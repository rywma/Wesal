
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route,} from 'react-router-dom'
import Home from './pages/Home.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

import Login from './pages/login.jsx'
import Signup from './pages/signup.jsx'
import CreateMatch from './pages/CreateMatch.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/create-match" element={<CreateMatch />} />
      </Routes>
    </BrowserRouter>
  )
}

const root = createRoot(document.getElementById('root'))

root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);

