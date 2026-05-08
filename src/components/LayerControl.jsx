import { useState } from 'react'

function LayerControl({ onLayerToggle }) {
  const [visibleLayers, setVisibleLayers] = useState({
    cycling: false,
    cycleway: false,
    highway: false,
    parks: false
  })

  const layers = [
    { id: 'cycling', name: '🚴 Ciclofaixas', description: 'Faixas separadas para ciclistas' },
    { id: 'cycleway', name: '🛣️ Ciclovias', description: 'Vias para bicicletas' },
    { id: 'highway', name: '🛣️ Rodovias', description: 'Principais vias de circulação' },
    { id: 'parks', name: '🌳 Parques', description: 'Áreas verdes' }
  ]

  const handleLayerChange = (layerId) => {
    const newState = {
      ...visibleLayers,
      [layerId]: !visibleLayers[layerId]
    }
    setVisibleLayers(newState)
    onLayerToggle(layerId, newState[layerId])
  }

  return (
    <div className="layer-control">
      <div className="layer-control-title">Camadas do Mapa</div>
      {layers.map(layer => (
        <div key={layer.id} className="layer-item">
          <input
            type="checkbox"
            id={`layer-${layer.id}`}
            checked={visibleLayers[layer.id]}
            onChange={() => handleLayerChange(layer.id)}
          />
          <label htmlFor={`layer-${layer.id}`}>
            <div>{layer.name}</div>
            <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
              {layer.description}
            </div>
          </label>
        </div>
      ))}
    </div>
  )
}

export default LayerControl
