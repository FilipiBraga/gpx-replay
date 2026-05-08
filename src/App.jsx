import { useState, useRef, useEffect } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import MapContainer from './components/MapContainer'
import { parseGPX } from './utils/gpxParser'
import { calculateDistance, formatTime } from './utils/calculations'
import './App.css'

function App() {
  const mapRef = useRef(null)
  const [gpxData, setGpxData] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [animationSpeed, setAnimationSpeed] = useState(1)
  const [error, setError] = useState('')
  const [elevation, setElevation] = useState([])
  const [route, setRoute] = useState(null)
  const [isBuilding, setIsBuilding] = useState(false)
  const [eleMinMax, setEleMinMax] = useState({ min: 0, max: 0 })
  
  const initialStats = {
    distance: 0,
    totalDistance: 0,
    currentSpeed: 0,
    elevation: 0,
    progress: 0,
    currentTime: 0,
    totalTime: 0
  };
  const [stats, setStats] = useState({
    distance: 0,
    totalDistance: 0,
    currentSpeed: 0,
    elevation: 0,
    progress: 0,
    currentTime: 0,
    totalTime: 0
  });
  const [isDrawing, setIsDrawing] = useState(false)

  const animationRef = useRef(null)
  const lastTimeRef = useRef(0)
  const currentIndexRef = useRef(0)

  useEffect(() => {
    currentIndexRef.current = currentIndex
  }, [currentIndex])

  const handleGPXUpload = (file) => {
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const data = parseGPX(event.target.result)
        
        if (data.points.length < 2) {
          setError('O arquivo GPX deve conter pelo menos 2 pontos')
          return
        }

        setGpxData(data)
        setCurrentIndex(0)
        setIsPlaying(false)
        setIsPaused(false)
        setError('')

        // Calcular estatísticas iniciais
        let totalDist = 0
        const cumulativeDistances = [0]
        for (let i = 1; i < data.points.length; i++) {
          const d = calculateDistance(
            data.points[i-1].lat, data.points[i-1].lon,
            data.points[i].lat, data.points[i].lon
          )
          totalDist += d
          cumulativeDistances.push(totalDist)
        }

        const totalTime = (totalDist / 25) * 3600
        setStats(prevStats => ({
          ...prevStats, // Mantém currentSpeed, elevation, etc. se já tiverem algum valor
          distance: 0,
          totalDistance: totalDist,
          totalTime: totalTime,
          progress: 0
        }));

        // Usar elevação do arquivo GPX se disponível
        const elevations = data.points.map(p => p.ele || 0)
        setElevation(elevations)
        
        // Anexar distâncias acumuladas para performance na animação
        data.cumulativeDistances = cumulativeDistances
        
        const newEleMinMax = {
          min: Math.min(...elevations),
          max: Math.max(...elevations)
        }
        setEleMinMax(newEleMinMax)

        // Inicializar mapa
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.drawRoute(data.points)
            mapRef.current.createMarker(data.points[0], newEleMinMax)
          }
        }, 0)
      } catch (err) {
        setError('Erro ao processar arquivo GPX: ' + err.message)
      }
    }
    reader.readAsText(file)
  }

  const animate = (timestamp) => {
    if (!isPlaying || isPaused) {
      animationRef.current = null
      return
    }

    if (lastTimeRef.current === 0) {
      lastTimeRef.current = timestamp
    }

    const deltaTime = (timestamp - lastTimeRef.current) * animationSpeed
    lastTimeRef.current = timestamp

    const newIndex = currentIndexRef.current + deltaTime / 50
    currentIndexRef.current = newIndex // Sincroniza o ref imediatamente para o próximo frame

    if (newIndex >= gpxData.points.length - 1) {
      newIndex = gpxData.points.length - 1
      setIsPlaying(false)
      setCurrentIndex(newIndex)
      lastTimeRef.current = 0
      return
    }

    setCurrentIndex(newIndex)
    updateStatsAndMarker(newIndex)
    animationRef.current = requestAnimationFrame(animate)
  }

  const updateStatsAndMarker = (index) => {
    const indexFloor = Math.floor(index)
    const nextIndex = Math.min(indexFloor + 1, gpxData.points.length - 1)
    const progress = index - indexFloor

    const point = gpxData.points[indexFloor]
    const nextPoint = gpxData.points[nextIndex]

    const interpolatedLat = point.lat + (nextPoint.lat - point.lat) * progress
    const interpolatedLon = point.lon + (nextPoint.lon - point.lon) * progress

    const elevValue = elevation.length > 0
      ? elevation[indexFloor] + (elevation[nextIndex] - elevation[indexFloor]) * progress
      : 0

    // Determine previous elevation for slope calculation for the marker
    let prevElevForMarker = elevValue // Default to current elevation for the very first point
    if (indexFloor > 0) {
      prevElevForMarker = elevation[indexFloor - 1]
    } else if (indexFloor === 0 && progress > 0) {
      prevElevForMarker = elevation[0]
    }

    if (mapRef.current) {
      mapRef.current.createMarker({ lat: interpolatedLat, lon: interpolatedLon, ele: elevValue, prevEle: prevElevForMarker }, eleMinMax)
      // Seguir a câmera no marcador durante animação
      if (isPlaying && !isPaused) {
        mapRef.current.followMarker({ lat: interpolatedLat, lon: interpolatedLon, ele: elevValue })
      }
    }

    // Otimização: usa distâncias pré-calculadas
    const totalDist = stats.totalDistance
    let currentDist = gpxData.cumulativeDistances[indexFloor] || 0
    currentDist += calculateDistance(
      point.lat, point.lon,
      interpolatedLat, interpolatedLon
    )

    const percent = totalDist > 0 ? (currentDist / totalDist) * 100 : 0
    const currentTime = (index / gpxData.points.length) * stats.totalTime

    // Calcula a velocidade instantânea do segmento
    const segmentDist = calculateDistance(point.lat, point.lon, nextPoint.lat, nextPoint.lon)
    const timePerIndex = gpxData.points.length > 1 ? stats.totalTime / (gpxData.points.length - 1) : 0
    const instantSpeed = timePerIndex > 0 ? (segmentDist / (timePerIndex / 3600)) : 0

    // Aplica suavização (Low-pass filter) para evitar picos de velocidade por ruído de GPS
    // Usamos 10% da velocidade nova e 90% da anterior para uma transição fluida
    const smoothingFactor = 0.1
    const smoothedSpeed = stats.currentSpeed === 0 || !isPlaying 
      ? instantSpeed 
      : (stats.currentSpeed * (1 - smoothingFactor) + instantSpeed * smoothingFactor)

    setStats(prev => ({
      ...prev,
      distance: currentDist,
      totalDistance: totalDist,
      progress: percent,
      elevation: elevValue,
      currentTime: currentTime,
      currentSpeed: smoothedSpeed
    }))
  }

  useEffect(() => {
    if (isPlaying && gpxData) {
      animationRef.current = requestAnimationFrame(animate)
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, isPaused, gpxData, animationSpeed])

  const handlePlay = () => {
    if (gpxData) {
      setIsPlaying(true)
      setIsPaused(false)
      lastTimeRef.current = 0
    }
  }

  const handlePause = () => {
    setIsPaused(true)
  }

  const handleResume = () => {
    setIsPaused(false)
    lastTimeRef.current = 0
  }

  const handleReset = () => {
    setCurrentIndex(0)
    currentIndexRef.current = 0
    setIsPlaying(false)
    setIsPaused(false)
    lastTimeRef.current = 0
    if (gpxData && mapRef.current) {
      // For the first point, prevEle can be the same as current ele (slope 0)
      mapRef.current.createMarker({ ...gpxData.points[0], prevEle: gpxData.points[0].ele }, eleMinMax)
    }
    setStats(prev => ({
      ...prev,
      distance: 0,
      progress: 0,
      currentTime: 0,
      currentSpeed: 0
    }))
  }

  const handleProgressClick = (percent) => {
    if (!gpxData) return
    const newIndex = (percent / 100) * (gpxData.points.length - 1)
    setCurrentIndex(newIndex)
    updateStatsAndMarker(newIndex)
  }

  const handleLayerToggle = (layerId, visible) => {
    if (mapRef.current) {
      mapRef.current.toggleLayer(layerId, visible)
    }
  }

  const handleBuildRoute = (options) => {
    try {
      if (options.mode === 'draw') {
        // Ativar modo de desenho
        if (!isDrawing) {
          setIsDrawing(true)
          mapRef.current?.startDrawing()
          setError('')
        } else {
          // Finalizar desenho
          setIsDrawing(false)
          mapRef.current?.stopDrawing()
          
          const drawnRoute = mapRef.current?.getDrawnRoute()
          if (!drawnRoute || drawnRoute.length < 2) {
            setError('Desenhe uma rota no mapa com pelo menos 2 pontos')
            return
          }

          setRoute({ points: drawnRoute })
          setElevation(drawnRoute.map(p => p.ele || 0))
          
          setEleMinMax({
            min: Math.min(...drawnRoute.map(p => p.ele || 0)),
            max: Math.max(...drawnRoute.map(p => p.ele || 0))
          })

          // Desenhar rota no mapa
          if (mapRef.current) {
            mapRef.current.drawRoute(drawnRoute, true)
          }

          // Atualizar stats
          let totalDist = 0
          for (let i = 1; i < drawnRoute.length; i++) {
            totalDist += calculateDistance(
              drawnRoute[i-1].lat, drawnRoute[i-1].lon,
              drawnRoute[i].lat, drawnRoute[i].lon
            )
          }
          const totalTime = (totalDist / 25) * 3600
          setStats(prev => ({
            ...prev,
            totalDistance: totalDist,
            totalTime: totalTime,
            progress: 0
          }))

          setError('')
        }
      }
    } catch (err) {
      setError('Erro ao construir rota: ' + err.message)
      setIsDrawing(false)
    }
  }

  const handleClearRoute = () => {
    if (mapRef.current) {
      mapRef.current.clearDrawing()
    }
    setRoute(null)
    setElevation([])
  }

  const handleClearGPXData = () => {
    setGpxData(null);
    setCurrentIndex(0);
    currentIndexRef.current = 0;
    setIsPlaying(false);
    setIsPaused(false);
    lastTimeRef.current = 0;
    setError('');
    setElevation([]);
    setRoute(null);
    setEleMinMax({ min: 0, max: 0 });
    setStats(initialStats); // Reseta para o estado inicial

    if (mapRef.current) {
      mapRef.current.clearMap();
      mapRef.current.drawRoute([]); // Explicitamente limpa a rota no mapa
    }
  };

  const handleMarkerDrag = (index) => {
    // Pausa a animação ao arrastar o marcador para permitir busca manual
    setIsPlaying(false)
    setCurrentIndex(index)
    currentIndexRef.current = index
    updateStatsAndMarker(index)
  }

  return (
    <div className="app">
      <Header />
      <div className="container">
        <Sidebar
          gpxData={gpxData}
          onGPXUpload={handleGPXUpload}
          isPlaying={isPlaying}
          isPaused={isPaused}
          onPlay={handlePlay}
          onPause={handlePause}
          onResume={handleResume}
          onReset={handleReset}
          animationSpeed={animationSpeed}
          onSpeedChange={setAnimationSpeed}
          onProgressClick={handleProgressClick}
          error={error}
          stats={stats}
          onLayerToggle={handleLayerToggle}
          onBuildRoute={handleBuildRoute}
          onClearRoute={handleClearRoute}
          elevation={elevation}
          route={route}
          onClearGPX={handleClearGPXData}
        />
        {gpxData && <button className="clear-gpx-button" onClick={handleClearGPXData}>X Limpar GPX</button>}
        <MapContainer 
          ref={mapRef} 
          onMarkerDrag={handleMarkerDrag}
        />
      </div>
    </div>
  )
}

export default App
