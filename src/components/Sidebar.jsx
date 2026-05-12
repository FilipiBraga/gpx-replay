import { useRef, useState } from 'react'
import FileUpload from './FileUpload'
import RouteInfo from './RouteInfo'
import ErrorMessage from './ErrorMessage'
import ElevationProfile from './ElevationProfile'
import { formatTime, calculateDistance } from '../utils/calculations'

function Sidebar({
  gpxData,
  onGPXUpload,
  error,
  elevation,
  route,
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
        </>
      )}

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
