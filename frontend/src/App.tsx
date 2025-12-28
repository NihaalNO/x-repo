import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { RealtimeProvider } from './components/RealtimeProvider'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import CreateProject from './pages/CreateProject'
import EditProject from './pages/EditProject'
import CreatePost from './pages/CreatePost'
import CircuitPlayground from './pages/CircuitPlayground'
import Communities from './pages/Communities'
import CommunityDetail from './pages/CommunityDetail'
import PostDetail from './pages/PostDetail'
import About from './pages/About'
import Contact from './pages/Contact'
import FAQ from './pages/FAQ'
import Feed from './pages/Feed'
import CreateCommunity from './pages/CreateCommunity'

function App() {
  return (
    <AuthProvider>
      <RealtimeProvider>
        <Router>
          <Layout>
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/new" element={<CreateProject />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/projects/:id/edit" element={<EditProject />} />
            <Route path="/communities/:name/submit" element={<CreatePost />} />
            <Route path="/playground" element={<CircuitPlayground />} />
            <Route path="/communities" element={<Communities />} />
            <Route path="/communities/:name" element={<CommunityDetail />} />
            <Route path="/posts/:id" element={<PostDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/communities/new" element={<CreateCommunity />} />
          </Routes>
        </Layout>
      </Router>
      </RealtimeProvider>
    </AuthProvider>
  )
}

export default App

