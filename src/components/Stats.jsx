function Stats({ speed, elevation, slope, progress, currentDistance, totalDistance }) {
  return (
    <div className="stats-section">
      <div className="stat-row">
        <span>Velocidade Atual:</span>
        <strong>{speed.toFixed(1)} km/h</strong>
      </div>
      <div className="stat-row">
        <span>Elevação:</span>
        <strong>{elevation > 0 ? `${elevation.toFixed(0)} m` : '-'}</strong>
      </div>
      <div className="stat-row">
        <span>Inclinação:</span>
        <strong style={{ color: slope > 0 ? '#dc3545' : slope < 0 ? '#28a745' : '#333' }}>
          {slope.toFixed(1)}%
        </strong>
      </div>
      <div className="stat-row">
        <span>Progresso:</span>
        <strong>{currentDistance.toFixed(2)} km / {totalDistance.toFixed(2)} km ({progress.toFixed(1)}%)</strong>
      </div>
    </div>
  )
}

export default Stats
