import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import axios from 'axios';
import 'maplibre-gl/dist/maplibre-gl.css';
import ResizableDraggableContainer from './ResizableDraggableContainer';

const MapContainer = forwardRef((props, ref) => {
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null); // Ref para armazenar o marcador de animação atual
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const routePointsRef = useRef([]); // Armazena os pontos da rota para busca de proximidade no arrasto
  const drawnPointsRef = useRef([]); // Armazena pontos do desenho manual
  const isAutoFollowEnabled = useRef(true); // Controla se a câmera deve seguir o marcador
  const [mapStyle, setMapStyle] = useState('street');

  // Atualiza a camada visual do desenho manual
  const updateDrawingLayer = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const geojson = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: drawnPointsRef.current.map(p => [p.lon, p.lat])
      }
    };

    if (map.getSource('draw-source')) {
      map.getSource('draw-source').setData(geojson);
    } else {
      map.addSource('draw-source', { type: 'geojson', data: geojson });
      map.addLayer({
        id: 'draw-layer',
        type: 'line',
        source: 'draw-source',
        paint: {
          'line-color': '#FFA500',
          'line-width': 4,
          'line-dasharray': [2, 1]
        }
      });
    }
  };

  const handleMapClick = (e) => {
    const newPoint = { lat: e.lngLat.lat, lon: e.lngLat.lng, ele: 0 };
    drawnPointsRef.current = [...drawnPointsRef.current, newPoint];
    updateDrawingLayer();
  };

  // Sensibilidade: metros de diferença entre pontos para atingir cor máxima (ajustado para GPX real)
  const MAX_SLOPE_FOR_COLOR = 0.3; 

  // Função auxiliar para encontrar o índice do ponto mais próximo da rota ao arrastar
  const findClosestIndex = (latlng) => {
    if (!routePointsRef.current || routePointsRef.current.length === 0) return 0;
    let minDistance = Infinity;
    let index = 0;
    for (let i = 0; i < routePointsRef.current.length; i++) {
      const p = routePointsRef.current[i];
      // Distância simples Euclidiana para performance (MapLibre usa [lon, lat])
      const d = Math.sqrt(Math.pow(latlng.lng - p.lon, 2) + Math.pow(latlng.lat - p.lat, 2));
      if (d < minDistance) {
        minDistance = d;
        index = i;
      }
    }
    return index;
  };

  useEffect(() => {
    if (!mapInstanceRef.current) {
      const map = new maplibregl.Map({
        container: 'map',
        style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json', // Estilo limpo
        center: [-46.6333, -23.5505],
        zoom: 12,
        pitch: 45, // Inclinação para visão 3D
        bearing: -17.6,
        antialias: true
      });

      // Detectar interação do usuário para desativar o auto-follow
      const stopFollow = (e) => {
        if (e.originalEvent) isAutoFollowEnabled.current = false;
      };
      map.on('movestart', stopFollow);

      map.on('load', () => {
        // Adicionar fonte de terreno para relevo 3D real
        map.addSource('terrainRGB', {
          type: 'raster-dem',
          url: 'https://demotiles.maplibre.org/terrain-tiles/tile.json',
          tileSize: 256
        });
        
        // Exageração de 3.0 é o ponto ideal para ver ladeiras urbanas sem deformar o mapa
        map.setTerrain({ source: 'terrainRGB', exaggeration: 3.0 }); 

        // Adicionamos a camada de Hillshade (sombreamento)
        // É isso que cria as sombras nas encostas, permitindo ver o "volume" das subidas
        map.addLayer({
          id: 'hills',
          type: 'hillshade',
          source: 'terrainRGB',
          paint: {
            'hillshade-shadow-color': '#473b31',
            'hillshade-exaggeration': 1.0
          }
        }, 'route'); // Renderiza abaixo da linha da rota

        // Atmosfera 3D correta para MapLibre
        map.setAtmosphere({
          'color': 'white',
          'high-color': '#add8e6',
          'horizon-blend': 0.05
        });

        // Adicionar fonte de Satélite (ESRI) para uso posterior
        map.addSource('satellite-source', {
          type: 'raster',
          tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
          tileSize: 256,
          attribution: 'Tiles &copy; Esri'
        });
      });

      map.addControl(new maplibregl.NavigationControl(), 'top-right');
      map.addControl(new maplibregl.TerrainControl({ source: 'terrainRGB' }), 'top-right');

      mapInstanceRef.current = map;

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            map.jumpTo({ center: [longitude, latitude], zoom: 13 });
          }
        );
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Função interna para alternar o estilo
  const handleInternalStyleToggle = (style) => {
    setMapStyle(style);
    const map = mapInstanceRef.current;
    if (!map) return;

    const visible = style === 'satellite';
    
    if (visible) {
      if (!map.getSource('satellite-source')) {
        map.addSource('satellite-source', {
          type: 'raster',
          tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
          tileSize: 256,
          attribution: 'Tiles &copy; Esri'
        });
      }
      if (!map.getLayer('satellite-layer')) {
        map.addLayer({ id: 'satellite-layer', type: 'raster', source: 'satellite-source' });
      }
      map.setLayoutProperty('satellite-layer', 'visibility', 'visible');
      if (map.getLayer('route')) map.moveLayer('route');
      if (map.getLayer('draw-layer')) map.moveLayer('draw-layer');
    } else if (map.getLayer('satellite-layer')) {
      map.setLayoutProperty('satellite-layer', 'visibility', 'none');
    }
  };

  // Expõe métodos para o componente pai via ref
  useImperativeHandle(ref, () => ({
    drawRoute: (points, fitBounds = true) => {
      const map = mapInstanceRef.current;
      if (!map || points.length < 2) return;
      isAutoFollowEnabled.current = true; // Resetar follow ao carregar nova rota

      routePointsRef.current = points;
      
      // Criar segmentos coloridos com base na inclinação
      const features = [];
      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        const elevationDiff = (p2.ele || 0) - (p1.ele || 0);
        
        let color = '#FC5200'; // Plano (Laranja Strava)
        if (elevationDiff > 0.1) color = '#FF0000'; // Subida (Vermelho)
        if (elevationDiff < -0.1) color = '#00FF00'; // Descida (Verde)

        features.push({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [[p1.lon, p1.lat], [p2.lon, p2.lat]]
          },
          properties: { color }
        });
      }

      // Limpar camada anterior se existir
      if (map.getLayer('route')) {
        map.removeLayer('route');
        map.removeSource('route');
      }

      map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: features
        }
      });

      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 5,
          'line-opacity': 0.8
        }
      });

      // Bandeiras (Usando marcadores HTML simples no MapLibre)
      if (startMarkerRef.current) startMarkerRef.current.remove();
      if (endMarkerRef.current) endMarkerRef.current.remove();

      const startCoord = [points[0].lon, points[0].lat];
      const endCoord = [points[points.length - 1].lon, points[points.length - 1].lat];

      const startEl = document.createElement('div');
      startEl.innerHTML = '<div style="font-size: 30px; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3))">🚩</div>';
      startEl.style.fontSize = '24px';
      startMarkerRef.current = new maplibregl.Marker({ element: startEl })
        .setLngLat(startCoord)
        .addTo(map);

      const endEl = document.createElement('div');
      endEl.innerHTML = '<div style="font-size: 30px; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3))">🏁</div>';
      endEl.style.fontSize = '24px';
      endMarkerRef.current = new maplibregl.Marker({ element: endEl })
        .setLngLat(endCoord)
        .addTo(map);

      if (fitBounds) {
        const coordinates = points.map(p => [p.lon, p.lat]);
        const bounds = coordinates.reduce((acc, coord) => acc.extend(coord), new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));
        map.fitBounds(bounds, { padding: 50 });
      }
    },
    createMarker: (point, eleMinMax) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      const currentEle = point.ele || 0;
      const prevEle = point.prevEle !== undefined ? point.prevEle : currentEle;
      const slope = currentEle - prevEle;
      const slopeNorm = Math.max(-1, Math.min(1, slope / MAX_SLOPE_FOR_COLOR));
      const hue = 120 - (slopeNorm * 120);
      const color = `hsl(${hue}, 100%, 50%)`;

      if (markerRef.current) {
        markerRef.current.setLngLat([point.lon, point.lat]);
        const el = markerRef.current.getElement().querySelector('.marker-dot');
        if (el) el.style.backgroundColor = color;
      } else {
        const el = document.createElement('div');
        el.className = 'marker-bolinha';
        el.innerHTML = `<div class="marker-dot" style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid #000; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`;

        markerRef.current = new maplibregl.Marker({ element: el, draggable: true })
          .setLngLat([point.lon, point.lat])
          .addTo(map);

        markerRef.current.on('drag', (e) => {
          const snappedIndex = findClosestIndex(markerRef.current.getLngLat());
          if (props.onMarkerDrag) props.onMarkerDrag(snappedIndex);
        });
      }
    },
    followMarker: (point, slope = 0) => {
      const map = mapInstanceRef.current;
      if (map && isAutoFollowEnabled.current) {
        // Limitamos o pitch máximo para 75 graus para evitar jitter de horizonte no terreno 3D
        const dynamicPitch = Math.min(75, 60 + (Math.max(-1, Math.min(1, slope / 0.2)) * 15));
        
        // Usamos jumpTo para atualizações de frame instantâneas sem overhead de animação
        map.jumpTo({
          center: [point.lon, point.lat],
          pitch: dynamicPitch
        });
      }
    },
    setAutoFollow: (enabled) => {
      isAutoFollowEnabled.current = enabled;
    },
    toggleLayer: async (layerId, visible) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      // Lógica específica para a camada de Satélite
      if (layerId === 'satellite') {
        handleInternalStyleToggle(visible ? 'satellite' : 'street');
        return;
      }

      if (!visible) {
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId);
          map.removeSource(layerId);
        }
        return;
      }

      // A lógica do Overpass permaneceria parecida, mas você usaria addSource com os dados GeoJSON retornados
      console.warn("Camadas extras precisam ser implementadas via GeoJSON no MapLibre.");
    },
    startDrawing: () => {
      const map = mapInstanceRef.current;
      if (!map) return;
      map.getCanvas().style.cursor = 'crosshair';
      map.on('click', handleMapClick);
    },
    stopDrawing: () => {
      const map = mapInstanceRef.current;
      if (!map) return;
      map.getCanvas().style.cursor = '';
      map.off('click', handleMapClick);
    },
    getDrawnRoute: () => {
      return drawnPointsRef.current;
    },
    clearDrawing: () => {
      const map = mapInstanceRef.current;
      drawnPointsRef.current = [];
      if (map && map.getLayer('draw-layer')) {
        map.removeLayer('draw-layer');
        map.removeSource('draw-source');
      }
    },
    clearMap: () => {
      const map = mapInstanceRef.current;
      if (!map) return;
      if (map.getLayer('route')) { map.removeLayer('route'); map.removeSource('route'); }
      if (map.getLayer('draw-layer')) { map.removeLayer('draw-layer'); map.removeSource('draw-source'); }
      if (markerRef.current) markerRef.current.remove();
      markerRef.current = null;
      if (startMarkerRef.current) startMarkerRef.current.remove();
      if (endMarkerRef.current) endMarkerRef.current.remove();
      drawnPointsRef.current = [];
    },
    setPitch: (newPitch) => {
      const map = mapInstanceRef.current;
      if (map) {
        map.setPitch(newPitch);
      }
    }
  }));

  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 900;
  const controlWidth = 280;
  const controlHeight = 280;
  const chartWidth = 320;
  const chartHeight = 220;
  const controlInitialX = 20;
  const controlInitialY = viewportHeight - controlHeight - 20;
  const chartInitialX = controlInitialX + controlWidth + 20;
  const chartInitialY = viewportHeight - chartHeight - 20;

  return (
    <div className="map-wrapper" style={{ position: 'relative', flexGrow: 1, height: '100vh', width: '100%' }}>
      <div id="map" style={{ height: '100%', width: '100%' }}></div>
      
      <div className="map-style-control">
        <button 
          className={`style-btn ${mapStyle === 'street' ? 'active' : ''}`}
          onClick={() => handleInternalStyleToggle('street')}
        >
          🗺️ Mapa
        </button>
        <button 
          className={`style-btn ${mapStyle === 'satellite' ? 'active' : ''}`}
          onClick={() => handleInternalStyleToggle('satellite')}
        >
          🛰️ Satélite
        </button>
        {props.PitchControl}
      </div>

      {props.MapOverlayControls && (
        <ResizableDraggableContainer 
          defaultWidth={controlWidth}
          defaultHeight={controlHeight}
          defaultX={controlInitialX}
          defaultY={controlInitialY}
        >
          {props.MapOverlayControls}
        </ResizableDraggableContainer>
      )}

      {props.MapOverlayCharts && (
        <ResizableDraggableContainer 
          defaultWidth={chartWidth}
          defaultHeight={chartHeight}
          defaultX={chartInitialX}
          defaultY={chartInitialY}
        >
          {props.MapOverlayCharts}
        </ResizableDraggableContainer>
      )}
    </div>
  );
});

export default MapContainer;