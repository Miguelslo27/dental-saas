import { Link } from 'react-router'
import { useAuthStore } from '@/stores/auth.store'
import { useAuth } from '@/hooks/useAuth'

// Plan data for pricing section
const plans = [
  {
    name: 'Gratis',
    price: '$0',
    period: '/mes',
    description: 'Perfecto para empezar',
    features: [
      '1 Administrador',
      '3 Doctores',
      '15 Pacientes',
      '100MB Almacenamiento',
      'Reportes Básicos',
      'Soporte Comunidad',
    ],
    cta: 'Comenzar Gratis',
    highlighted: false,
  },
  {
    name: 'Básico',
    price: '$5.99',
    period: '/mes',
    description: 'Para clínicas en crecimiento',
    features: [
      '2 Administradores',
      '5 Doctores',
      '25 Pacientes',
      '1GB Almacenamiento',
      'Reportes Completos',
      'Backups Diarios',
      'Soporte Email',
    ],
    cta: 'Comenzar Prueba',
    highlighted: true,
  },
  {
    name: 'Empresa',
    price: '$11.99',
    period: '/mes',
    description: 'Para clínicas establecidas',
    features: [
      '5 Administradores',
      '10 Doctores',
      '60 Pacientes',
      '5GB Almacenamiento',
      'Reportes Personalizados',
      'Backups + Exportación',
      'Soporte Prioritario',
    ],
    cta: 'Contactar Ventas',
    highlighted: false,
  },
]

const features = [
  {
    icon: '👥',
    title: 'Gestión de Pacientes',
    description:
      'Historial dental completo, datos demográficos y seguimiento de tratamientos.',
  },
  {
    icon: '📅',
    title: 'Calendario de Citas',
    description:
      'Agenda visual, recordatorios automáticos y gestión de disponibilidad.',
  },
  {
    icon: '👨‍⚕️',
    title: 'Control de Doctores',
    description:
      'Horarios de trabajo, especialidades y asignación de pacientes.',
  },
  {
    icon: '🔬',
    title: 'Trabajos de Laboratorio',
    description: 'Seguimiento de trabajos, estados de pago y tiempos de entrega.',
  },
  {
    icon: '📊',
    title: 'Reportes y Estadísticas',
    description: 'Dashboard con métricas clave, ingresos y rendimiento del equipo.',
  },
  {
    icon: '🔒',
    title: 'Seguro y Confiable',
    description: 'Datos encriptados, backups automáticos y acceso controlado por roles.',
  },
]

export default function LandingPage() {
  const { user, isAuthenticated } = useAuthStore()
  const { logout } = useAuth()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🦷</span>
            <span className="text-xl font-bold text-gray-900">Alveo System</span>
          </Link>
          <nav className="flex items-center gap-6">
            <a href="#features" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              Características
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              Precios
            </a>
            {isAuthenticated && user ? (
              <>
                <span className="text-gray-600 text-sm">
                  Hola, <strong>{user.firstName}</strong>
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Comenzar Gratis
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6">
            Gestiona tu clínica dental
            <span className="text-blue-600"> sin complicaciones</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Alveo System es la plataforma todo-en-uno para clínicas dentales.
            Pacientes, citas, doctores y reportes en un solo lugar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25"
            >
              Comenzar Gratis
            </Link>
            <a
              href="#features"
              className="px-8 py-4 text-lg font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Ver Características
            </a>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            ✓ Sin tarjeta de crédito &nbsp; ✓ Configuración en 2 minutos &nbsp; ✓
            Cancela cuando quieras
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para tu clínica
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Herramientas diseñadas específicamente para la gestión dental moderna.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl border border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Planes simples y transparentes
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Elige el plan que mejor se adapte al tamaño de tu clínica.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`p-8 rounded-2xl ${plan.highlighted
                    ? 'bg-blue-600 text-white ring-4 ring-blue-600 ring-offset-4'
                    : 'bg-white border border-gray-200'
                  }`}
              >
                <h3
                  className={`text-xl font-semibold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900'
                    }`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`text-sm mb-4 ${plan.highlighted ? 'text-blue-100' : 'text-gray-500'
                    }`}
                >
                  {plan.description}
                </p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span
                    className={plan.highlighted ? 'text-blue-100' : 'text-gray-500'}
                  >
                    {plan.period}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <span
                        className={
                          plan.highlighted ? 'text-blue-200' : 'text-green-500'
                        }
                      >
                        ✓
                      </span>
                      <span
                        className={
                          plan.highlighted ? 'text-white' : 'text-gray-600'
                        }
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`block w-full py-3 px-4 text-center font-semibold rounded-xl transition-colors ${plan.highlighted
                      ? 'bg-white text-blue-600 hover:bg-blue-50'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            ¿Listo para modernizar tu clínica?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Únete a cientos de clínicas que ya confían en Alveo System.
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-4 text-lg font-semibold text-blue-600 bg-white rounded-xl hover:bg-blue-50 transition-colors"
          >
            Crear Cuenta Gratis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🦷</span>
              <span className="text-xl font-bold text-white">Alveo System</span>
            </div>
            <nav className="flex gap-6 text-gray-400 text-sm">
              <a href="#features" className="hover:text-white transition-colors">
                Características
              </a>
              <a href="#pricing" className="hover:text-white transition-colors">
                Precios
              </a>
              <Link to="/login" className="hover:text-white transition-colors">
                Iniciar Sesión
              </Link>
            </nav>
            <p className="text-gray-500 text-sm">
              © 2026 Alveo System. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
