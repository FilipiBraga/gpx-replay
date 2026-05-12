import { useRef, useState } from 'react'
import FileUpload from './FileUpload'
import RouteInfo from './RouteInfo'
import Controls from './Controls'
import ProgressBar from './ProgressBar'
import Stats from './Stats'
import ErrorMessage from './ErrorMessage'
import LayerControl from './LayerControl'
import RouteBuilder from './RouteBuilder'
import ElevationProfile from './ElevationProfile'
import { formatTime, calculateDistance } from '../utils/calculations'

function Sidebar({
  gpxData,
  onGPXUpload,
  isPlaying,
  isPaused,
  onPlay,
  onPause,
  onResume,
  onReset,
  animationSpeed,
  onSpeedChange,
  onProgressClick,
  error,
  stats,
  onLayerToggle,
  onBuildRoute,
  onClearRoute,
  elevation,
  route,
  onRouteBuilderChange,
  onClearGPX
}) {
  const calculateStats = () => {
    if (!gpxData) return null

    let totalDistance = 0
    for (let i = 1; i < gpxData.points.length; i++) {
      totalDistance += calculateDistance(
        gpxData.points[i-1].lat, gpxData.points[i-1].lon,
        gpxData.points[i].lat, gpxData.points[i].lon
      )
    }

    const avgSpeed = 25
    const estimatedDuration = (totalDistance / avgSpeed) * 3600

    return {
      name: gpxData.name,
      pointCount: gpxData.points.length,
      distance: totalDistance,
      duration: estimatedDuration
    }
  }

  const routeStats = calculateStats()

  return (
    <div className="sidebar">
      <ErrorMessage message={error} />

      <div className="file-upload-section-with-clear">
        <FileUpload onGPXUpload={onGPXUpload} />
        {gpxData && <button className="clear-gpx-button" onClick={onClearGPX}>X</button>}
      </div>

      {gpxData && routeStats && (
        <>
          <RouteInfo
            name={routeStats.name}
            pointCount={routeStats.pointCount}
            distance={routeStats.distance}
            duration={routeStats.duration}
          />

          <Controls
            isPlaying={isPlaying}
            isPaused={isPaused}
            onPlay={onPlay}
            onPause={onPause}
            onResume={onResume}
            onReset={onReset}
            animationSpeed={animationSpeed}
            onSpeedChange={onSpeedChange}
          />

          <ProgressBar
            progress={stats.progress}
            currentTime={stats.currentTime}
            totalTime={stats.totalTime}
            onProgressClick={onProgressClick}
          />

          <Stats
            speed={isPlaying ? stats.currentSpeed : 0}
            elevation={stats.elevation}
            slope={stats.slope}
            progress={stats.progress}
            currentDistance={stats.distance}
            totalDistance={stats.totalDistance}
          />
        </>
      )}

      <LayerControl onLayerToggle={onLayerToggle} />

      <RouteBuilder
        onBuildRoute={onBuildRoute}
        onClearRoute={onClearRoute}
        onPreferenceChange={onRouteBuilderChange}
      />

      {elevation && elevation.length > 0 && (
        <ElevationProfile
          elevationData={elevation}
          route={route}
        />
      )}
    </div>
  )
}

export default Sidebar
