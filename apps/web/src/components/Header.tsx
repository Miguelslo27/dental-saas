import { Link } from "react-router";

export function Header() {
  const appUrl = __APP_URL__;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Alveodent</span>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Inicio
            </Link>
            <Link
              to="/precios"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Precios
            </Link>
            <a
              href="#caracteristicas"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Características
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-4">
            <a
              href={`${appUrl}/login`}
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Iniciar Sesión
            </a>
            <a
              href={`${appUrl}/register`}
              className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Comenzar Gratis
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}
