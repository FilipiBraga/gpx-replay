import React from 'react';
import '../styles/PitchControl.css';

function PitchControl({ pitch, onPitchChange }) {
  const handleChange = (e) => {
    const newPitch = parseFloat(e.target.value);
    onPitchChange(newPitch);
  };

  return (
    <div className="pitch-control-bar">
      <div className="pitch-bar-wrapper">
        <input
          type="range"
          min="0"
          max="75"
          step="1"
          value={pitch}
          onChange={handleChange}
          className="pitch-slider-bar"
          title="Inclinação do mapa"
        />
        <div className="pitch-bar-value">{Math.round(pitch)}°</div>
      </div>
    </div>
  );
}

export default PitchControl;
