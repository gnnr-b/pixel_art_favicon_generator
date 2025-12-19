import './App.css'
import PixelPainter from './components/PixelPainter'

function App() {
  return (
    <div className="App">
      <header style={{ textAlign: 'center', marginTop: 14 }}>
        <h1>Pixel Art Favicon Generator</h1>
        <p style={{ maxWidth: 760, margin: '6px auto 12px' }}>
          Draw pixel art and export a 32x32 PNG suitable for use as a favicon.
          Use the grid selector to change resolution. Click and drag to paint.
        </p>
      </header>
      <main>
        <PixelPainter />
      </main>
    </div>
  )
}

export default App
