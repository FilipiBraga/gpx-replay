import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

// Fix para ícones de marcador padrão - o caminho do ícone padrão do Leaflet pode ser problemático com bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const MapContainer = forwardRef((props, ref) => {
  const mapInstanceRef = useRef(null); // Ref para armazenar o objeto do mapa Leaflet
  const markerRef = useRef(null); // Ref para armazenar o marcador de animação atual
  const routeLayerRef = useRef(null); // Ref para armazenar a polilinha da rota atual
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const extraLayersRef = useRef({}); // Armazena as camadas extras (ciclovias, etc)
  const routePointsRef = useRef([]); // Armazena os pontos da rota para busca de proximidade no arrasto

  // Sensibilidade: metros de diferença entre pontos para atingir cor máxima (ajustado para GPX real)
  const MAX_SLOPE_FOR_COLOR = 0.3; 

  // Definição dos ícones de bandeira
  const startIcon = L.divIcon({
    html: '<span style="font-size: 24px;">🚩</span>',
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [5, 25]
  });

  const endIcon = L.divIcon({
    html: '<span style="font-size: 24px;">🏁</span>',
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [5, 25]
  });

  // Função auxiliar para encontrar o índice do ponto mais próximo da rota ao arrastar
  const findClosestIndex = (latlng) => {
    if (!routePointsRef.current || routePointsRef.current.length === 0) return 0;
    let minDistance = Infinity;
    let index = 0;
    for (let i = 0; i < routePointsRef.current.length; i++) {
      const p = routePointsRef.current[i];
      const d = latlng.distanceTo([p.lat, p.lon]);
      if (d < minDistance) {
        minDistance = d;
        index = i;
      }
    }
    return index;
  };

  useEffect(() => {
    // Inicializa o mapa apenas uma vez
    if (!mapInstanceRef.current) {
      const map = L.map('map').setView([0, 0], 2); // Visualização inicial padrão, será atualizada pela geolocalização

      const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      });

      const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      });

      // Camada de Relevo (Hillshade) para dar sensação de profundidade 3D nas montanhas
      const hillshade = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Esri, USGS, NOAA',
        maxZoom: 15,
        opacity: 0.5
      });

      // Camada de Prédios 3D (Simulação por tiles)
      const buildings = L.tileLayer('https://{s}.tile.osmbuildings.org/0.2/anonymous/{z}/{x}/{y}.json', {
        attribution: '&copy; <a href="https://osmbuildings.org">OSM Buildings</a>'
      });

      // Adiciona o mapa de ruas por padrão
      osm.addTo(map);

      const baseMaps = {
        "Mapa 2D": osm,
        "Satélite": satellite,
      };

      const overlayMaps = {
        "Relevo 3D (Sombras)": hillshade,
        "Construções 3D": buildings
      };

      // Adiciona o controle de camadas no canto superior direito
      L.control.layers(baseMaps, overlayMaps, { position: 'topright' }).addTo(map);

      mapInstanceRef.current = map;

      // 1. Posicionar o mapa onde o usuário está
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            map.setView([latitude, longitude], 13); // Define a visualização para a localização do usuário com um zoom razoável
          },
          (error) => {
            console.error("Erro ao obter a localização do usuário:", error);
            // Fallback para uma visualização padrão se a geolocalização falhar ou for negada
            map.setView([-23.5505, -46.6333], 10); // Padrão para São Paulo, Brasil
          }
        );
      } else {
        console.warn("Geolocalização não é suportada por este navegador.");
        map.setView([-23.5505, -46.6333], 10); // Padrão para São Paulo, Brasil
      }
    }

    // Função de limpeza para quando o componente for desmontado
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Array de dependências vazio garante que isso seja executado apenas uma vez na montagem

  // Expõe métodos para o componente pai via ref
  useImperativeHandle(ref, () => ({
    drawRoute: (points, fitBounds = true) => {
      if (!mapInstanceRef.current) return;

      if (routeLayerRef.current) {
        mapInstanceRef.current.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }
      routePointsRef.current = points;

      if (markerRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current);
        markerRef.current = null;
      }
      if (startMarkerRef.current) {
        mapInstanceRef.current.removeLayer(startMarkerRef.current);
        startMarkerRef.current = null;
      }
      if (endMarkerRef.current) {
        mapInstanceRef.current.removeLayer(endMarkerRef.current);
        endMarkerRef.current = null;
      }

      if (points.length < 2) return;

      const latlngs = points.map(p => [p.lat, p.lon]);
      const routeSegments = [];

      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        const segmentSlope = (p2.ele || 0) - (p1.ele || 0);

        // Mapeamento linear para evitar saltos bruscos (Verde=120, Vermelho=0, Azul=240)
        const slopeNorm = Math.max(-1, Math.min(1, segmentSlope / MAX_SLOPE_FOR_COLOR));
        const hue = 120 - (slopeNorm * 120);

        const segmentColor = `hsl(${hue}, 100%, 50%)`;

        routeSegments.push(
          L.polyline([[p1.lat, p1.lon], [p2.lat, p2.lon]], { color: segmentColor, weight: 6 })
        );
      }

      // Add all segments to a feature group and then to the map
      routeLayerRef.current = L.featureGroup(routeSegments).addTo(mapInstanceRef.current);

      // Adicionar bandeiras de início e fim
      if (latlngs.length > 0 && points.length > 0) { // Ensure points array is not empty
        startMarkerRef.current = L.marker(latlngs[0], { icon: startIcon }).addTo(mapInstanceRef.current);
        endMarkerRef.current = L.marker(latlngs[latlngs.length - 1], { icon: endIcon }).addTo(mapInstanceRef.current);
      }

      if (fitBounds && latlngs.length > 0) {
        mapInstanceRef.current.fitBounds(routeLayerRef.current.getBounds());
      }
    },
    createMarker: (point, eleMinMax) => { // point now includes prevEle
      if (!mapInstanceRef.current) return;

      // Cálculo da cor baseada na elevação
      let hue;
      let lightness = 50; // Default lightness

      // Fallback para evitar NaN se prevEle for undefined
      const currentEle = point.ele || 0;
      const prevEle = point.prevEle !== undefined ? point.prevEle : currentEle;
      const slope = currentEle - prevEle;

      // Cálculo gradual do matiz baseado na intensidade da inclinação
      const slopeNorm = Math.max(-1, Math.min(1, slope / MAX_SLOPE_FOR_COLOR));
      hue = 120 - (slopeNorm * 120);

      if (eleMinMax && eleMinMax.max !== eleMinMax.min) {
        const eleRatio = (currentEle - eleMinMax.min) / (eleMinMax.max - eleMinMax.min);
        const ascentL = 60 - (eleRatio * 35);  // Alvo para subida
        const descentL = 40 + (eleRatio * 35); // Alvo para descida

        // Interpola a luminosidade suavemente a partir de 50% (neutro)
        if (slopeNorm > 0) {
          lightness = 50 + (ascentL - 50) * slopeNorm;
        } else if (slopeNorm < 0) {
          lightness = 50 + (descentL - 50) * Math.abs(slopeNorm);
        }
      }

      // Ensure hue is within 0-360 and lightness within 0-100
      hue = Math.max(0, Math.min(360, hue));
      lightness = Math.max(0, Math.min(100, lightness));

      const color = `hsl(${hue}, 100%, ${lightness}%)`;
      
      if (markerRef.current) {
        markerRef.current.setLatLng([point.lat, point.lon]);
        
        // Otimização: Em vez de setIcon (pesado), alteramos apenas o CSS da div interna
        const el = markerRef.current.getElement();
        if (el) {
          const dot = el.querySelector('.marker-dot');
          if (dot) dot.style.backgroundColor = color;
        }
      } else {
        const icon = L.divIcon({
          html: `<div class="marker-dot" style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid #000; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
          className: 'marker-bolinha',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        markerRef.current = L.marker([point.lat, point.lon], {
          icon: icon,
          draggable: true,
          zIndexOffset: 1000
        }).addTo(mapInstanceRef.current);

        // Evento de arrasto: encontra o ponto mais próximo e avisa o App.jsx
        markerRef.current.on('drag', (e) => {
          const snappedIndex = findClosestIndex(e.target.getLatLng());
          if (props.onMarkerDrag) props.onMarkerDrag(snappedIndex);
        });
      }
    },
    // 2. Acompanhar a bolinha no mapa
    followMarker: (point) => {
      if (mapInstanceRef.current) {
        // Usa setView com animate: false para evitar atrasos e conflitos na câmera
        mapInstanceRef.current.setView([point.lat, point.lon], mapInstanceRef.current.getZoom(), { animate: false });
      }
    },
    toggleLayer: async (layerId, visible) => {
      if (!mapInstanceRef.current) return;

      // Se for para esconder a camada
      if (!visible) {
        if (extraLayersRef.current[layerId]) {
          mapInstanceRef.current.removeLayer(extraLayersRef.current[layerId]);
          delete extraLayersRef.current[layerId];
        }
        return;
      }

      // Verificação de zoom para não sobrecarregar a API
      if (mapInstanceRef.current.getZoom() < 13) {
        alert("Por favor, aumente o zoom para visualizar os detalhes desta camada.");
        return;
      }

      // Definição de filtros OSM e estilos
      let osmQuery = "";
      let style = {};
      let isPolygon = false;

      switch (layerId) {
        case 'cycleway':
          osmQuery = 'way["highway"="cycleway"];way["cycleway"="track"]';
          style = { color: '#0033ff', weight: 5, opacity: 0.9 };
          break;
        case 'cycling':
          osmQuery = 'way["cycleway"~"lane|share_busway"]';
          style = { color: '#00ffff', weight: 4, opacity: 0.8, dashArray: '5, 10' };
          break;
        case 'highway':
          osmQuery = 'way["highway"~"motorway|trunk|primary"]';
          style = { color: '#ff4500', weight: 6, opacity: 0.7 };
          break;
        case 'parks':
          osmQuery = 'way["leisure"="park"];way["landuse"="recreation_ground"]';
          style = { color: '#228b22', fillColor: '#32cd32', fillOpacity: 0.3, weight: 1 };
          isPolygon = true;
          break;
        default:
          return;
      }

      try {
        const bounds = mapInstanceRef.current.getBounds();
        const bbox = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;
        
        // Construção da Query Overpass
        const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json][timeout:25];(${osmQuery}(${bbox}););out body;>;out skel qt;`;
        
        const response = await axios.get(overpassUrl);
        const data = response.data;

        // Mapeamento de nós para coordenadas
        const nodes = {};
        data.elements.forEach(el => {
          if (el.type === 'node') nodes[el.id] = [el.lat, el.lon];
        });

        const newLayerGroup = L.featureGroup();

        // Processamento dos caminhos (ways)
        data.elements.forEach(el => {
          if (el.type === 'way' && el.nodes) {
            const coords = el.nodes.map(id => nodes[id]).filter(c => !!c);
            if (coords.length > 1) {
              if (isPolygon) {
                L.polygon(coords, style).addTo(newLayerGroup);
              } else {
                L.polyline(coords, style).addTo(newLayerGroup);
              }
            }
          }
        });

        extraLayersRef.current[layerId] = newLayerGroup.addTo(mapInstanceRef.current);
      } catch (error) {
        console.error("Erro ao carregar dados do OpenStreetMap:", error);
      }
    },
    startDrawing: () => {
      // Placeholder para a lógica de desenho (por exemplo, usando leaflet-draw)
      console.log("Iniciar desenho");
    },
    stopDrawing: () => {
      // Placeholder para a lógica de desenho
      console.log("Parar desenho");
    },
    getDrawnRoute: () => {
      // Placeholder para a lógica de desenho
      return [];
    },
    clearMap: () => {
      if (routeLayerRef.current) {
        mapInstanceRef.current.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }
      if (markerRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current);
        markerRef.current = null;
      }
      if (startMarkerRef.current) {
        mapInstanceRef.current.removeLayer(startMarkerRef.current);
        startMarkerRef.current = null;
      }
      if (endMarkerRef.current) {
        mapInstanceRef.current.removeLayer(endMarkerRef.current);
        endMarkerRef.current = null;
      }
      routePointsRef.current = [];
    },
    clearDrawing: () => {
      // Placeholder para a lógica de desenho
      console.log("Limpar desenho");
    }
  }));

  return <div id="map" style={{ flexGrow: 1, height: '100vh', width: '100%' }}></div>;
});

export default MapContainer;