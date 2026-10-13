import { createRoot } from 'react-dom/client'
import Login from './pages/login.jsx'

function App() {
  return <Login />
}

const root = createRoot(document.getElementById('root'))

root.render(<App />)
