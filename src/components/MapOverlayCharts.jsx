import React, { useState, useRef } from 'react';

function MapOverlayCharts({ elevationData, currentIndex, pointsCount, cumulativeDistances, totalDistance, currentDistance, onProgressChange }) {
  if (!elevationData || elevationData.length === 0 || !cumulativeDistances || !totalDistance) return null;

  const [hoverInfo, setHoverInfo] = useState({ visible: false, x: 0, altitude: 0, distance: 0 });
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  const svgWidth = 1000;
  const svgHeight = 100;
  const padding = 2;
  const labelHeight = 20;

  const maxElev = Math.max(...elevationData);
  const minElev = Math.min(...elevationData);
  const elevRange = maxElev - minElev || 1;

  // Gerar pontos para o gráfico de Elevação (Área)
  const elevPoints = elevationData.map((elev, i) => {
    const x = (cumulativeDistances[i] / totalDistance) * svgWidth;
    const y = (svgHeight - labelHeight - padding) - ((elev - minElev) / elevRange) * (svgHeight - labelHeight - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  const elevArea = `0,${svgHeight - labelHeight} ${elevPoints} ${svgWidth},${svgHeight - labelHeight}`;

  const handleInteraction = (e) => {
    if (!containerRef.current || !onProgressChange) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (mouseX / rect.width) * 100));
    onProgressChange(percent);
  };

  const handleMouseMove = (e) => {
    if (!containerRef.current || !svgRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const svgX = (mouseX / rect.width) * svgWidth;
    
    // Converte posição X do SVG para distância em Km
    const dist = (svgX / svgWidth) * totalDistance;
    
    // Encontra o índice do ponto mais próximo baseado na distância acumulada
    let closestIdx = 0;
    let minDiff = Infinity;
    for (let i = 0; i < cumulativeDistances.length; i++) {
      const diff = Math.abs(cumulativeDistances[i] - dist);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    }

    setHoverInfo({
      visible: true,
      x: svgX,
      altitude: elevationData[closestIdx],
      distance: cumulativeDistances[closestIdx]
    });

    if (e.buttons === 1) {
      handleInteraction(e);
    }
  };

  // Posição do cursor de progresso
  const cursorX = (currentDistance / totalDistance) * svgWidth;

  // Gerar marcadores de quilometragem baseados na distância total
  const interval = totalDistance > 100 ? 20 : (totalDistance > 50 ? 10 : (totalDistance > 10 ? 5 : 1));
  const kmMarkers = [];
  for (let d = interval; d < totalDistance; d += interval) {
    kmMarkers.push({
      x: (d / totalDistance) * svgWidth,
      label: `${d}km`
    });
  }

  return (
    <div className="map-overlay-charts"
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}
    >
      <div style={{
        padding: '4px 8px 0 8px',
        fontSize: '12px',
        fontWeight: '600'
      }}>
        <span style={{ color: '#FC5200' }}>● Elevação</span>
      </div>
      <svg 
        ref={svgRef}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        preserveAspectRatio="none"
        onClick={handleInteraction}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverInfo({ ...hoverInfo, visible: false })}
        style={{ 
          flex: 1,
          cursor: 'pointer',
          width: '100%',
          height: '100%'
        }}
      >
        <defs>
          <linearGradient id="overlayElevGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FC5200" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FC5200" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Área de Elevação */}
        <polygon points={elevArea} fill="url(#overlayElevGradient)" fillOpacity="0.5" />
        <polyline
          points={elevPoints}
          fill="none"
          stroke="#FC5200"
          strokeWidth="1"
          strokeOpacity="0.6"
        />

        {/* Marcadores de Quilometragem (Eixo X) */}
        {kmMarkers.map((marker, idx) => (
          <g key={idx}>
            <line x1={marker.x} y1={svgHeight - labelHeight} x2={marker.x} y2={svgHeight - labelHeight + 5} stroke="#666" strokeWidth="1" />
            <text x={marker.x} y={svgHeight - 5} fontSize="10" fill="#888" textAnchor="middle">
              {marker.label}
            </text>
          </g>
        ))}

        {/* Tooltip de Hover */}
        {hoverInfo.visible && (
          <g>
            <line x1={hoverInfo.x} y1="0" x2={hoverInfo.x} y2={svgHeight - labelHeight} stroke="#333" strokeWidth="1" strokeDasharray="4,2" />
            <rect 
              x={hoverInfo.x > svgWidth - 100 ? hoverInfo.x - 105 : hoverInfo.x + 5} 
              y="5" 
              width="95" 
              height="35" 
              rx="4" 
              fill="rgba(0,0,0,0.8)" 
            />
            <text 
              x={hoverInfo.x > svgWidth - 100 ? hoverInfo.x - 100 : hoverInfo.x + 10} 
              y="20" 
              fill="white" 
              fontSize="12" 
              fontWeight="bold"
            >
              {hoverInfo.altitude.toFixed(0)} m
            </text>
            <text 
              x={hoverInfo.x > svgWidth - 100 ? hoverInfo.x - 100 : hoverInfo.x + 10} 
              y="33" 
              fill="#ccc" 
              fontSize="10"
            >
              Dist: {hoverInfo.distance.toFixed(2)} km
            </text>
          </g>
        )}

        {/* Cursor de Progresso */}
        <line x1={cursorX} y1="0" x2={cursorX} y2={svgHeight - labelHeight} stroke="#333" strokeWidth="2" />
        <circle cx={cursorX} cy={svgHeight - labelHeight - 2} r="3" fill="#333" />
      </svg>
    </div>
  );
}

export default MapOverlayCharts;