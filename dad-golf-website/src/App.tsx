import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Schedule from './pages/Schedule'
import Pictures from './pages/Pictures'
import AlbumDetail from './components/AlbumDetail'
import './index.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/pictures" element={<Pictures />} />
            <Route path="/album/:id" element={<AlbumDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
