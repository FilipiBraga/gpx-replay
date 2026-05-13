import React, { useState, useRef, useEffect } from 'react';
import '../styles/MapOverlayContainer.css';

function MapOverlayContainer({ children }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    // Inicializar posição padrão no canto inferior esquerdo
    setPosition({ x: 20, y: window.innerHeight - 140 });
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
      newX = Math.max(margin, Math.min(newX, window.innerWidth - 740 - margin));
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

  return (
    <div
      ref={containerRef}
      className="map-overlay-container"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      <div className="overlay-drag-handle-bottom" onMouseDown={handleMouseDown}>
        <span className="drag-icon-bottom">⋮⋮</span>
      </div>
      <div className="overlay-content">
        {children}
      </div>
    </div>
  );
}

export default MapOverlayContainer;
