import './App.css'
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './components/ui/Sidebar.tsx'
import { SignIn } from './pages/SignIn.tsx'
import { SignUp } from './pages/SignUp.tsx'
import { Dashboard } from './pages/Dashboard.tsx'
import { Content } from './pages/Content.tsx'
import { Share } from './pages/Share.tsx'
import { PublicView } from './pages/PublicView.tsx'
import { useAuth, AuthProvider } from './auth.tsx'

function ProtectedLayout() {
  const { token } = useAuth()
  const location = useLocation()
  if (!token) {
    return <Navigate to="/signin" replace state={{ from: location }} />
  }
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto flex max-w-7xl">
        <Sidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/public">
          <Route index element={<PublicView />} />
          <Route path=":shareLink" element={<PublicView />} />
        </Route>

        <Route element={<ProtectedLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="/content" element={<Content />} />
          <Route path="/share" element={<Share />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  )
}
