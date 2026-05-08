import { useRef, useState } from 'react'

function FileUpload({ onGPXUpload }) {
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = (file) => {
    if (file && file.name.endsWith('.gpx')) {
      onGPXUpload(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  return (
    <div className="upload-section">
      <label className="upload-label">Upload do Arquivo GPX</label>
      <div className="file-input-wrapper">
        <label
          className={`file-input-label ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          📁 Selecionar arquivo GPX
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".gpx"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleFileSelect(e.target.files[0])
            }
          }}
          style={{ display: 'none' }}
          onClick={() => fileInputRef.current?.click()}
        />
      </div>
    </div>
  )
}

export default FileUpload
