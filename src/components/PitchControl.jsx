import React, { useState } from 'react';
import '../styles/PitchControl.css';

function PitchControl({ pitch, onPitchChange }) {
  const [showSlider, setShowSlider] = useState(false);

  const handleChange = (e) => {
    const newPitch = parseFloat(e.target.value);
    onPitchChange(newPitch);
  };

  const toggleSlider = () => {
    setShowSlider(!showSlider);
  };

  const handlePreset = (value) => {
    onPitchChange(value);
    setShowSlider(false);
  };

  return (
    <div className="pitch-control-compact">
      <button
        className="pitch-toggle-btn"
        onClick={toggleSlider}
        title="Ajustar inclinação"
      >
        ↗️
      </button>
      
      {showSlider && (
        <div className="pitch-expanded">
          <div className="pitch-slider-container">
            <input
              type="range"
              min="0"
              max="75"
              step="1"
              value={pitch}
              onChange={handleChange}
              className="pitch-slider"
            />
            <div className="pitch-value">{Math.round(pitch)}°</div>
          </div>
          <div className="pitch-presets">
            <button
              className={`preset-btn ${pitch < 20 ? 'active' : ''}`}
              onClick={() => handlePreset(0)}
              title="Vista de cima"
            >
              ⬆️
            </button>
            <button
              className={`preset-btn ${pitch >= 20 && pitch < 50 ? 'active' : ''}`}
              onClick={() => handlePreset(35)}
              title="Vista intermediária"
            >
              ↗️
            </button>
            <button
              className={`preset-btn ${pitch >= 50 ? 'active' : ''}`}
              onClick={() => handlePreset(60)}
              title="Vista horizontal"
            >
              ➡️
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PitchControl;
