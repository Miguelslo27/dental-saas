import { Link } from 'react-router'

const plans = [
  {
    name: 'Gratis',
    price: '$0',
    period: '/mes',
    description: 'Perfecto para empezar',
    features: [
      { text: '1 Administrador', included: true },
      { text: '3 Doctores', included: true },
      { text: '15 Pacientes', included: true },
      { text: '100MB Almacenamiento', included: true },
      { text: 'Reportes Básicos', included: true },
      { text: 'Soporte Comunidad', included: true },
      { text: 'Backups Manuales', included: true },
      { text: 'Backups Diarios', included: false },
      { text: 'Reportes Personalizados', included: false },
      { text: 'Soporte Prioritario', included: false },
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
      { text: '2 Administradores', included: true },
      { text: '5 Doctores', included: true },
      { text: '25 Pacientes', included: true },
      { text: '1GB Almacenamiento', included: true },
      { text: 'Reportes Completos', included: true },
      { text: 'Soporte Email', included: true },
      { text: 'Backups Diarios', included: true },
      { text: 'Reportes Personalizados', included: false },
      { text: 'Soporte Prioritario', included: false },
      { text: 'Exportación de Datos', included: false },
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
      { text: '5 Administradores', included: true },
      { text: '10 Doctores', included: true },
      { text: '60 Pacientes', included: true },
      { text: '5GB Almacenamiento', included: true },
      { text: 'Reportes Personalizados', included: true },
      { text: 'Soporte Prioritario', included: true },
      { text: 'Backups Diarios', included: true },
      { text: 'Exportación de Datos', included: true },
      { text: 'API Access', included: true },
      { text: 'White-label (próximamente)', included: false },
    ],
    cta: 'Contactar Ventas',
    highlighted: false,
  },
]

const faqs = [
  {
    question: '¿Puedo cambiar de plan en cualquier momento?',
    answer:
      'Sí, puedes actualizar o degradar tu plan en cualquier momento. Los cambios se aplican inmediatamente y se prorratean según el tiempo restante del período de facturación.',
  },
  {
    question: '¿Qué pasa si supero los límites de mi plan?',
    answer:
      'Recibirás una notificación cuando estés cerca de los límites. No perderás acceso a tus datos, pero no podrás agregar más registros hasta que actualices tu plan o elimines algunos existentes.',
  },
  {
    question: '¿Ofrecen descuentos para pagos anuales?',
    answer:
      'Sí, ofrecemos un 20% de descuento para suscripciones anuales. Contacta a ventas para más información.',
  },
  {
    question: '¿Mis datos están seguros?',
    answer:
      'Absolutamente. Usamos encriptación de nivel bancario, servidores seguros y realizamos backups automáticos. Cumplimos con las normativas de protección de datos.',
  },
  {
    question: '¿Puedo cancelar en cualquier momento?',
    answer:
      'Sí, puedes cancelar tu suscripción cuando quieras. Mantendrás acceso hasta el final del período de facturación actual.',
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🦷</span>
            <span className="text-xl font-bold text-gray-900">Alveo System</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              Inicio
            </Link>
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
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6">
            Planes y Precios
          </h1>
          <p className="text-xl text-gray-600">
            Elige el plan perfecto para tu clínica. Sin contratos, cancela cuando quieras.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`p-8 rounded-2xl ${plan.highlighted
                    ? 'bg-blue-600 text-white ring-4 ring-blue-600 ring-offset-4 scale-105'
                    : 'bg-white border border-gray-200'
                  }`}
              >
                {plan.highlighted && (
                  <div className="text-center mb-4">
                    <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      MÁS POPULAR
                    </span>
                  </div>
                )}
                <h3
                  className={`text-2xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900'
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
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span
                    className={plan.highlighted ? 'text-blue-100' : 'text-gray-500'}
                  >
                    {plan.period}
                  </span>
                </div>
                <Link
                  to="/register"
                  className={`block w-full py-3 px-4 text-center font-semibold rounded-xl transition-colors mb-8 ${plan.highlighted
                      ? 'bg-white text-blue-600 hover:bg-blue-50'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                  {plan.cta}
                </Link>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-center gap-3">
                      <span
                        className={
                          feature.included
                            ? plan.highlighted
                              ? 'text-blue-200'
                              : 'text-green-500'
                            : 'text-gray-300'
                        }
                      >
                        {feature.included ? '✓' : '✗'}
                      </span>
                      <span
                        className={
                          feature.included
                            ? plan.highlighted
                              ? 'text-white'
                              : 'text-gray-700'
                            : plan.highlighted
                              ? 'text-blue-200 line-through'
                              : 'text-gray-400 line-through'
                        }
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Comparación Detallada
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl border border-gray-200">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-4 font-semibold text-gray-900">
                    Característica
                  </th>
                  <th className="text-center p-4 font-semibold text-gray-900">
                    Gratis
                  </th>
                  <th className="text-center p-4 font-semibold text-blue-600 bg-blue-50">
                    Básico
                  </th>
                  <th className="text-center p-4 font-semibold text-gray-900">
                    Empresa
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="p-4 text-gray-600">Administradores</td>
                  <td className="p-4 text-center">1</td>
                  <td className="p-4 text-center bg-blue-50 font-medium">2</td>
                  <td className="p-4 text-center">5</td>
                </tr>
                <tr>
                  <td className="p-4 text-gray-600">Doctores</td>
                  <td className="p-4 text-center">3</td>
                  <td className="p-4 text-center bg-blue-50 font-medium">5</td>
                  <td className="p-4 text-center">10</td>
                </tr>
                <tr>
                  <td className="p-4 text-gray-600">Pacientes</td>
                  <td className="p-4 text-center">15</td>
                  <td className="p-4 text-center bg-blue-50 font-medium">25</td>
                  <td className="p-4 text-center">60</td>
                </tr>
                <tr>
                  <td className="p-4 text-gray-600">Almacenamiento</td>
                  <td className="p-4 text-center">100MB</td>
                  <td className="p-4 text-center bg-blue-50 font-medium">1GB</td>
                  <td className="p-4 text-center">5GB</td>
                </tr>
                <tr>
                  <td className="p-4 text-gray-600">Backups</td>
                  <td className="p-4 text-center">Manual</td>
                  <td className="p-4 text-center bg-blue-50 font-medium">Diarios</td>
                  <td className="p-4 text-center">Diarios + Export</td>
                </tr>
                <tr>
                  <td className="p-4 text-gray-600">Reportes</td>
                  <td className="p-4 text-center">Básicos</td>
                  <td className="p-4 text-center bg-blue-50 font-medium">Completos</td>
                  <td className="p-4 text-center">Personalizados</td>
                </tr>
                <tr>
                  <td className="p-4 text-gray-600">Soporte</td>
                  <td className="p-4 text-center">Comunidad</td>
                  <td className="p-4 text-center bg-blue-50 font-medium">Email</td>
                  <td className="p-4 text-center">Prioritario</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Preguntas Frecuentes
          </h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="border border-gray-200 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            ¿Listo para empezar?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Prueba Alveo System gratis. Sin tarjeta de crédito.
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
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">🦷</span>
            <span className="text-xl font-bold text-white">Alveo System</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2026 Alveo System. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
