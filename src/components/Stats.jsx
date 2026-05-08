function Stats({ speed, elevation, progress }) {
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
        <span>Progresso:</span>
        <strong>{progress.toFixed(1)}%</strong>
      </div>
    </div>
  )
}

export default Stats
