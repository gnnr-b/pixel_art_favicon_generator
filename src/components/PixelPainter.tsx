import React, { useEffect, useRef, useState } from 'react'
import './PixelPainter.css'

const PRESET_COLORS = [
  '#000000',
  '#ffffff',
  '#ff0000',
  '#00ff00',
  '#0000ff',
  '#ffff00',
  '#ff00ff',
  '#00ffff',
  'transparent',
]

export default function PixelPainter() {
  const [size, setSize] = useState(16)
  const [grid, setGrid] = useState<string[]>(() => Array(16 * 16).fill('transparent'))
  const [color, setColor] = useState<string>('#000000')
  const [isDrawing, setIsDrawing] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // pixel display size for the visible canvas
  const pixelSize = 18

  useEffect(() => {
    setGrid(Array(size * size).fill('transparent'))
  }, [size])

  useEffect(() => {
    drawToCanvas()
    updatePreview(32)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid, size])

  function drawToCanvas() {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = size * pixelSize
    canvas.height = size * pixelSize
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const c = grid[y * size + x]
        if (c === 'transparent') {
          ctx.clearRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
        } else {
          ctx.fillStyle = c
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
        }
      }
    }
    // grid lines
    ctx.strokeStyle = 'rgba(0,0,0,0.06)'
    ctx.lineWidth = 1
    for (let i = 0; i <= size; i++) {
      const pos = i * pixelSize + 0.5
      ctx.beginPath()
      ctx.moveTo(pos, 0)
      ctx.lineTo(pos, canvas.height)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, pos)
      ctx.lineTo(canvas.width, pos)
      ctx.stroke()
    }
  }

  function indexFromEvent(e: MouseEvent | Touch, rect: DOMRect) {
    const clientX = 'clientX' in e ? e.clientX : (e as Touch).clientX
    const clientY = 'clientY' in e ? e.clientY : (e as Touch).clientY
    const x = Math.floor((clientX - rect.left) / pixelSize)
    const y = Math.floor((clientY - rect.top) / pixelSize)
    if (x < 0 || x >= size || y < 0 || y >= size) return -1
    return y * size + x
  }

  function paintAt(index: number) {
    if (index < 0) return
    setGrid((g) => {
      if (g[index] === color) return g
      const copy = g.slice()
      copy[index] = color
      return copy
    })
  }

  function handleMouseDown(e: React.MouseEvent) {
    setIsDrawing(true)
    const rect = canvasRef.current!.getBoundingClientRect()
    const idx = indexFromEvent(e.nativeEvent, rect)
    paintAt(idx)
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDrawing) return
    const rect = canvasRef.current!.getBoundingClientRect()
    const idx = indexFromEvent(e.nativeEvent, rect)
    paintAt(idx)
  }

  function handleMouseUp() {
    setIsDrawing(false)
  }

  function handleTouchStart(e: React.TouchEvent) {
    e.preventDefault()
    setIsDrawing(true)
    const rect = canvasRef.current!.getBoundingClientRect()
    const idx = indexFromEvent(e.touches[0], rect)
    paintAt(idx)
  }

  function handleTouchMove(e: React.TouchEvent) {
    e.preventDefault()
    if (!isDrawing) return
    const rect = canvasRef.current!.getBoundingClientRect()
    const idx = indexFromEvent(e.touches[0], rect)
    paintAt(idx)
  }

  function clearGrid() {
    setGrid(Array(size * size).fill('transparent'))
  }

  function fillGrid() {
    setGrid(Array(size * size).fill(color))
  }

  function updatePreview(exportSize: number) {
    const off = document.createElement('canvas')
    off.width = exportSize
    off.height = exportSize
    const ctx = off.getContext('2d')!
    const scale = exportSize / size
    ctx.clearRect(0, 0, off.width, off.height)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const c = grid[y * size + x]
        if (c === 'transparent') continue
        ctx.fillStyle = c
        ctx.fillRect(Math.floor(x * scale), Math.floor(y * scale), Math.ceil(scale), Math.ceil(scale))
      }
    }
    setPreview(off.toDataURL('image/png'))
  }

  function exportPNG(filename = 'favicon.png', exportSize = 32) {
    const off = document.createElement('canvas')
    off.width = exportSize
    off.height = exportSize
    const ctx = off.getContext('2d')!
    const scale = exportSize / size
    ctx.clearRect(0, 0, off.width, off.height)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const c = grid[y * size + x]
        if (c === 'transparent') continue
        ctx.fillStyle = c
        ctx.fillRect(Math.floor(x * scale), Math.floor(y * scale), Math.ceil(scale), Math.ceil(scale))
      }
    }
    off.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    })
  }

  return (
    <div className="pixel-painter">
      <div className="controls">
        <div className="left">
          <label>
            Grid:
            <select value={size} onChange={(e) => setSize(Number(e.target.value))}>
              <option value={8}>8</option>
              <option value={16}>16</option>
              <option value={24}>24</option>
              <option value={32}>32</option>
            </select>
          </label>
          <label>
            Color:
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
          </label>
          <div className="palette">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                className={`swatch ${c === 'transparent' ? 'transparent' : ''} ${c === color ? 'active' : ''}`}
                style={c === 'transparent' ? {} : { background: c }}
                onClick={() => setColor(c === 'transparent' ? 'transparent' : c)}
                title={c}
              />
            ))}
          </div>
        </div>
        <div className="right">
          <button onClick={clearGrid}>Clear</button>
          <button onClick={fillGrid}>Fill</button>
          <button onClick={() => exportPNG('favicon.png', 32)}>Download PNG (32x32)</button>
        </div>
      </div>

      <div className="canvas-area">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp as any}
        />
        <div className="preview">
          <div>Preview (32x32)</div>
          <div className="favicon-preview">
            {preview ? <img src={preview} alt="preview" /> : <div className="empty">Empty</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
