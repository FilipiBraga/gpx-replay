import React, { useRef, useState, useEffect } from 'react';

function ResizableDraggableContainer({ 
  children, 
  defaultWidth = 300, 
  defaultHeight = 250,
  defaultX = 20,
  defaultY = 0,
  minWidth = 150,
  minHeight = 100
}) {
  const [position, setPosition] = useState({ x: defaultX, y: defaultY });
  const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const containerRef = useRef(null);

  // Handle drag - apenas nas bordas para não interferir com o conteúdo
  const handleMouseDownDrag = (e) => {
    // Detecta se clicou perto da borda (top ou left)
    const rect = containerRef.current.getBoundingClientRect();
    const isNearBorder = 
      (e.clientY - rect.top < 8) || 
      (e.clientX - rect.left < 8);
    
    if (e.target.closest('.resize-handle') || !isNearBorder) return;
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setPosition({
          x: Math.max(0, e.clientX - dragOffset.x),
          y: Math.max(0, e.clientY - dragOffset.y)
        });
      }

      if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;

        setSize({
          width: Math.max(minWidth, resizeStart.width + deltaX),
          height: Math.max(minHeight, resizeStart.height + deltaY)
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset, resizeStart]);

  const handleMouseDownResize = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        cursor: isDragging ? 'grabbing' : 'default',
        touchAction: 'none'
      }}
      onMouseDown={handleMouseDownDrag}
    >
      {children}
      
      <div 
        className="resize-handle" 
        onMouseDown={handleMouseDownResize}
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '16px',
          height: '16px',
          cursor: 'nwse-resize',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          color: '#FC5200',
          opacity: 0.4,
          transition: 'opacity 0.2s',
          pointerEvents: 'auto',
          userSelect: 'none'
        }}
        onMouseOver={(e) => e.target.style.opacity = '1'}
        onMouseOut={(e) => e.target.style.opacity = '0.4'}
      >
        ⤡
      </div>
    </div>
  );
}

export default ResizableDraggableContainer;
