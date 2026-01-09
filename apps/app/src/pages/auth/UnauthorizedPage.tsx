import { Link } from 'react-router'

export function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Acceso No Autorizado
        </h1>
        <p className="text-gray-600 mb-8">
          No tienes permisos suficientes para acceder a esta página.
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  )
}

export default UnauthorizedPage
