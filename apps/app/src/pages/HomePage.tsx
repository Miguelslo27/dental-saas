import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useAuthStore } from '@/stores/auth.store'
import { useAuth } from '@/hooks/useAuth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

interface HealthResponse {
  status: string
  timestamp: string
  uptime?: number
}

export default function HomePage() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { user, isAuthenticated } = useAuthStore()
  const { logout } = useAuth()

  useEffect(() => {
    fetch(`${API_URL}/api/health`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`)
        }
        return res.json()
      })
      .then((data: HealthResponse) => setHealth(data))
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">🦷 Alveo System</h1>
          <nav className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <>
                <span className="text-gray-600">
                  Hola, <strong>{user.firstName}</strong> ({user.role})
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Registrarse
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Sistema de gestión para clínicas dentales
          </h2>
          <p className="text-gray-600">
            Gestiona pacientes, citas, doctores y más desde una sola plataforma.
          </p>
        </div>

        {/* User info card (if authenticated) */}
        {isAuthenticated && user && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">
              👤 Información del Usuario
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Nombre:</span>
                <span className="ml-2 font-medium">
                  {user.firstName} {user.lastName}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <span className="ml-2 font-medium">{user.email}</span>
              </div>
              <div>
                <span className="text-gray-600">Rol:</span>
                <span className="ml-2 font-medium">{user.role}</span>
              </div>
              <div>
                <span className="text-gray-600">Tenant ID:</span>
                <span className="ml-2 font-medium">{user.tenantId}</span>
              </div>
            </div>
          </div>
        )}

        {/* API Health Check */}
        <div className="bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">🔧 API Health Check</h3>
          {error && (
            <p className="text-red-600 bg-red-50 p-3 rounded">Error: {error}</p>
          )}
          {health && (
            <pre className="bg-white p-4 rounded border text-sm overflow-auto">
              {JSON.stringify(health, null, 2)}
            </pre>
          )}
          {!health && !error && <p className="text-gray-500">Cargando...</p>}
        </div>
      </main>
    </div>
  )
}
