import { formatTime } from '../utils/calculations'

function ProgressBar({ progress, currentTime, totalTime, onProgressClick }) {
  const handleProgressTrackClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = ((e.clientX - rect.left) / rect.width) * 100
    onProgressClick(percent)
  }

  return (
    <div className="progress-bar">
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
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  )
}

export default ProgressBar
