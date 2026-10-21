
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route,} from 'react-router-dom'
import Home from './pages/Home.jsx';

import Login from './pages/login.jsx'
import Signup from './pages/signup.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  )
}

const root = createRoot(document.getElementById('root'))

root.render(<App />)
