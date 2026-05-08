function Controls({
  isPlaying,
  isPaused,
  onPlay,
  onPause,
  onResume,
  onReset,
  animationSpeed,
  onSpeedChange
}) {
  return (
    <div className="controls-section">
      <div className="controls-title">Controles</div>
      <div className="controls">
        {!isPlaying ? (
          <button
            className="play-btn"
            onClick={onPlay}
          >
            ▶️ Play
          </button>
        ) : null}

        {isPlaying && !isPaused ? (
          <button
            className="pause-btn"
            onClick={onPause}
          >
            ⏸ Pausa
          </button>
        ) : null}

        {isPaused ? (
          <button
            className="play-btn"
            onClick={onResume}
          >
            ▶️ Retomar
          </button>
        ) : null}

        <button
          className="reset-btn"
          onClick={onReset}
        >
          ↻ Reset
        </button>
      </div>

      <div className="speed-control">
        <label htmlFor="speedSlider">Velocidade:</label>
        <input
          id="speedSlider"
          type="range"
          min="0.5"
          max="5"
          step="0.5"
          value={animationSpeed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          className="speed-slider"
        />
        <span>{animationSpeed}x</span>
      </div>
    </div>
  )
}

export default Controls
