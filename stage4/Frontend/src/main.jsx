
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/base.css'
import { BrowserRouter, Routes, Route,} from 'react-router-dom'
import Home from './pages/Home.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import MyMatches from './pages/MyMatches.jsx';
import Login from './pages/login.jsx'
import Signup from './pages/signup.jsx'
import CreateMatch from './pages/CreateMatch.jsx'
import BrowseMatches from './pages/BrowseMatches.jsx'
import MatchDetails from './pages/MatchDetails.jsx'
import ManageMatch from './pages/ManageMatch.jsx';
import Invitations from './pages/Invitations.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/create-match" element={<CreateMatch />} />
        <Route path="/matches" element={<BrowseMatches />} />
        <Route path="/matches/:id" element={<MatchDetails />} />
        <Route path="/my-matches" element={<MyMatches />} />
        <Route path="/matches/:id/manage" element={<ManageMatch />} />
        <Route path="/invitations" element={<Invitations />} />
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

