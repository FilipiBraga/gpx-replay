function ElevationProfile({ elevationData, route }) {
  if (!route || !elevationData || elevationData.length === 0) return null

  const minElevation = Math.min(...elevationData)
  const maxElevation = Math.max(...elevationData)
  const totalGain = elevationData.reduce((sum, curr, idx) => {
    if (idx === 0) return 0
    return sum + Math.max(0, curr - elevationData[idx - 1])
  }, 0)

  const totalLoss = elevationData.reduce((sum, curr, idx) => {
    if (idx === 0) return 0
    return sum + Math.max(0, elevationData[idx - 1] - curr)
  }, 0)

  // Criar SVG do perfil
  const height = 100
  const width = 100
  const padding = 5
  const range = maxElevation - minElevation || 1
  
  const points = elevationData.map((elev, idx) => {
    const x = padding + (idx / (elevationData.length - 1 || 1)) * (width - 2 * padding)
    const y = height - padding - ((elev - minElevation) / range) * (height - 2 * padding)
    return `${x},${y}`
  }).join(' ')

  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`

  return (
    <div className="elevation-section">
      <div className="elevation-title">📊 Perfil de Elevação</div>
      
      <div className="elevation-chart-container">
        <svg className="elevation-chart" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="elevGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FC5200" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FC5200" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          
          {/* Linhas de Grade de fundo */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#e0e0e0" strokeWidth="0.2" strokeDasharray="1,1" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e0e0e0" strokeWidth="0.2" />
          
          {/* Preenchimento de Volume (Efeito de profundidade) */}
          <polygon
            points={areaPoints}
            fill="url(#elevGradient)"
          />
          
          {/* Linha Principal do Perfil */}
          <polyline
            points={points}
            fill="none"
            stroke="#FC5200"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="elevation-stats">
        <div className="elevation-stat">
          <div className="elevation-stat-label">Min</div>
          <div className="elevation-stat-value">{minElevation.toFixed(0)}m</div>
        </div>
        <div className="elevation-stat">
          <div className="elevation-stat-label">Max</div>
          <div className="elevation-stat-value">{maxElevation.toFixed(0)}m</div>
        </div>
        <div className="elevation-stat">
          <div className="elevation-stat-label">Ganho</div>
          <div className="elevation-stat-value" style={{ color: '#28a745' }}>+{totalGain.toFixed(0)}m</div>
        </div>
        <div className="elevation-stat">
          <div className="elevation-stat-label">Perda</div>
          <div className="elevation-stat-value" style={{ color: '#dc3545' }}>-{totalLoss.toFixed(0)}m</div>
        </div>
      </div>
    </div>
  )
}

export default ElevationProfile
