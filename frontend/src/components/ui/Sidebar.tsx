import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../../auth"
import { Brain, Home, Link as LinkIcon, LogOut, Notebook } from "lucide-react"

export function Sidebar() {
  const navigate = useNavigate()
  const { signout } = useAuth()
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "block rounded-md px-3 py-2 text-sm font-medium",
      isActive ? "bg-purple-100 text-purple-800" : "text-gray-700 hover:bg-gray-100",
    ].join(" ")

  return (
    <aside className="sticky top-0 h-screen w-60 shrink-0 border-r border-gray-200 bg-white/70 p-5 backdrop-blur">
      <div className="mb-6 flex items-center gap-2 text-lg font-semibold"><Brain size={20}/> Vegapunk</div>
      <nav className="space-y-1">
        <NavLink to="/" className={linkClass} end>
          <span className="inline-flex items-center gap-2"><Home size={16}/> Dashboard</span>
        </NavLink>
        <NavLink to="/content" className={linkClass}>
          <span className="inline-flex items-center gap-2"><Notebook size={16}/> My Content</span>
        </NavLink>
        <NavLink to="/share" className={linkClass}>
          <span className="inline-flex items-center gap-2"><LinkIcon size={16}/> Share</span>
        </NavLink>
        <NavLink to="/public" className={linkClass}>
          <span className="inline-flex items-center gap-2">Public View</span>
        </NavLink>
      </nav>
      <div className="mt-8">
        <button
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
          onClick={() => {
            signout()
            navigate('/signin')
          }}
        >
          <LogOut size={16}/> Sign out
        </button>
      </div>
    </aside>
  )
}


