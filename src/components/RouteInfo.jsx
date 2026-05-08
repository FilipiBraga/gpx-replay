import { formatTime } from '../utils/calculations'

function RouteInfo({ name, pointCount, distance, duration }) {
  return (
    <div className="route-info">
      <div className="info-item">
        <span>Nome da Rota:</span>
        <strong>{name}</strong>
      </div>
      <div className="info-item">
        <span>Pontos:</span>
        <strong>{pointCount}</strong>
      </div>
      <div className="info-item">
        <span>Distância:</span>
        <strong>{distance.toFixed(2)} km</strong>
      </div>
      <div className="info-item">
        <span>Duração Estimada:</span>
        <strong>{formatTime(duration)}</strong>
      </div>
    </div>
  )
}

export default RouteInfo
