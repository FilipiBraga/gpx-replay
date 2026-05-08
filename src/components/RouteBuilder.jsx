import { useState } from 'react'

function RouteBuilder({ onBuildRoute, onClearRoute }) {
  const [isDrawing, setIsDrawing] = useState(false)
  const [routePreference, setRoutePreference] = useState('balanced')

  const preferences = [
    { id: 'fastest', label: 'Mais Rápido', icon: '⚡' },
    { id: 'shortest', label: 'Mais Curto', icon: '📏' },
    { id: 'balanced', label: 'Equilibrado', icon: '⚖️' },
    { id: 'cycling', label: 'Ciclável', icon: '🚴' },
    { id: 'scenic', label: 'Paisagem', icon: '🌲' }
  ]

  const handleStartDrawing = () => {
    setIsDrawing(!isDrawing)
    onBuildRoute({ mode: 'draw', preference: routePreference })
  }

  const handleClear = () => {
    setIsDrawing(false)
    onClearRoute()
  }

  return (
    <div className="route-builder">
      <div className="route-builder-title">Construtor de Rota</div>
      
      <div className="preferences">
        {preferences.map(pref => (
          <button
            key={pref.id}
            className={`preference-btn ${routePreference === pref.id ? 'active' : ''}`}
            onClick={() => setRoutePreference(pref.id)}
            title={`Priorizar: ${pref.label}`}
          >
            {pref.icon} {pref.label}
          </button>
        ))}
      </div>

      <div className="route-actions">
        <button
          className={`route-actions button ${isDrawing ? 'btn-clear' : 'btn-draw'}`}
          onClick={handleStartDrawing}
        >
          {isDrawing ? '✓ Acabar' : '✏️ Desenhar'}
        </button>
        <button
          className="route-actions button btn-clear"
          onClick={handleClear}
        >
          🗑️ Limpar
        </button>
      </div>

      {isDrawing && (
        <div style={{ 
          marginTop: '10px', 
          padding: '8px', 
          background: '#fff5e6', 
          borderRadius: '4px',
          fontSize: '12px',
          color: '#666'
        }}>
          💡 Clique no mapa para adicionar pontos. Duplo clique para finalizar.
        </div>
      )}
    </div>
  )
}

export default RouteBuilder
