import React, { useState, useRef, useEffect } from 'react';
import { formatTime } from '../utils/calculations';
import '../styles/MapOverlayControls.css';

function MapOverlayControls({
  isPlaying,
  isPaused,
  onPlay,
  onPause,
  onResume,
  onReset,
  animationSpeed,
  onSpeedChange,
  stats,
  onProgressClick,
  totalTime,
  currentTime
}) {
  const [position, setPosition] = useState({ x: window.innerWidth - 340, y: window.innerHeight - 420 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    // Inicializar posição padrão no canto inferior direito
    setPosition({ x: window.innerWidth - 340, y: window.innerHeight - 420 });
  }, []);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    const rect = containerRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      let newX = e.clientX - dragOffset.x;
      let newY = e.clientY - dragOffset.y;

      // Limitar movimento dentro da janela (com margem)
      const margin = 10;
      newX = Math.max(margin, Math.min(newX, window.innerWidth - 320 - margin));
      newY = Math.max(margin, Math.min(newY, window.innerHeight - margin));

      setPosition({
        x: newX,
        y: newY
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleProgressTrackClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = ((e.clientX - rect.left) / rect.width) * 100;
    onProgressClick(percent);
  };

  return (
    <div 
      ref={containerRef}
      className="map-overlay-controls"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      {/* Handle de Arraste */}
      <div className="overlay-drag-handle" onMouseDown={handleMouseDown} title="Arraste para mover">
        <span className="drag-icon">⋮⋮</span>
      </div>

      {/* Barra de Progresso com Tempo */}
      <div className="overlay-progress-section">
        <div className="progress-label">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(totalTime)}</span>
        </div>
        <div
          className="progress-track"
          onClick={handleProgressTrackClick}
        >
          <div
            className="progress-fill"
            style={{ width: `${stats.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="overlay-stats-grid">
        <div className="stat-item">
          <span className="stat-label">Velocidade</span>
          <span className="stat-value">{(isPlaying ? stats.currentSpeed : 0).toFixed(1)} km/h</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Elevação</span>
          <span className="stat-value">{stats.elevation > 0 ? `${stats.elevation.toFixed(0)} m` : '-'}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Inclinação</span>
          <span 
            className="stat-value" 
            style={{ color: stats.slope > 0 ? '#dc3545' : stats.slope < 0 ? '#28a745' : '#333' }}
          >
            {stats.slope.toFixed(1)}%
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Progresso</span>
          <span className="stat-value">{stats.progress.toFixed(1)}%</span>
        </div>
      </div>

      {/* Controles e Velocidade */}
      <div className="overlay-controls-section">
        <div className="controls-buttons">
          {!isPlaying ? (
            <button className="control-btn play-btn" onClick={onPlay} title="Play">
              ▶️
            </button>
          ) : null}

          {isPlaying && !isPaused ? (
            <button className="control-btn pause-btn" onClick={onPause} title="Pausa">
              ⏸
            </button>
          ) : null}

          {isPaused ? (
            <button className="control-btn play-btn" onClick={onResume} title="Retomar">
              ▶️
            </button>
          ) : null}

          <button className="control-btn reset-btn" onClick={onReset} title="Reset">
            ↻
          </button>
        </div>

        <div className="speed-control">
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.5"
            value={animationSpeed}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            className="speed-slider"
            title="Velocidade"
          />
          <span className="speed-value">{animationSpeed}x</span>
        </div>
      </div>
    </div>
  );
}

export default MapOverlayControls;
