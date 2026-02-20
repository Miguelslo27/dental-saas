import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { FAQ } from "../components/FAQ";

const plans = [
  {
    name: "Gratis",
    price: "$U 0",
    period: "/mes",
    description: "Perfecto para empezar",
    features: [
      { text: "1 Administrador", included: true },
      { text: "2 Doctores", included: true },
      { text: "10 Pacientes", included: true },
      { text: "100MB Almacenamiento", included: true },
      { text: "Reportes Básicos", included: true },
      { text: "Soporte Comunidad", included: true },
      { text: "Backups Manuales", included: true },
      { text: "Backups Diarios", included: false },
      { text: "Reportes Personalizados", included: false },
      { text: "Soporte Prioritario", included: false },
    ],
    cta: "Comenzar Gratis",
    highlighted: false,
  },
  {
    name: "Básico",
    price: "$U 8.99",
    period: "/mes",
    description: "Para clínicas en crecimiento",
    features: [
      { text: "2 Administradores", included: true },
      { text: "5 Doctores", included: true },
      { text: "20 Pacientes", included: true },
      { text: "1GB Almacenamiento", included: true },
      { text: "Reportes Completos", included: true },
      { text: "Soporte Email", included: true },
      { text: "Backups Diarios", included: true },
      { text: "Reportes Personalizados", included: false },
      { text: "Soporte Prioritario", included: false },
      { text: "Exportación de Datos", included: false },
    ],
    cta: "Comenzar Prueba",
    highlighted: true,
  },
  {
    name: "Empresa",
    price: "$U 15.99",
    period: "/mes",
    description: "Para clínicas establecidas",
    features: [
      { text: "5 Administradores", included: true },
      { text: "10 Doctores", included: true },
      { text: "60 Pacientes", included: true },
      { text: "5GB Almacenamiento", included: true },
      { text: "Reportes Personalizados", included: true },
      { text: "Soporte Prioritario", included: true },
      { text: "Backups Diarios", included: true },
      { text: "Exportación de Datos", included: true },
      { text: "API Access", included: true },
      { text: "White-label (próximamente)", included: false },
    ],
    cta: "Contactar Ventas",
    highlighted: false,
  },
];


export function PricingPage() {
  const appUrl = __APP_URL__;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6">
              Planes y Precios
            </h1>
            <p className="text-xl text-gray-600">
              Elige el plan perfecto para tu clínica. Sin contratos, cancela
              cuando quieras.
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
                  className={`p-8 rounded-2xl ${
                    plan.highlighted
                      ? "bg-blue-600 text-white ring-4 ring-blue-600 ring-offset-4 scale-105"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="text-center mb-4">
                      <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        MÁS POPULAR
                      </span>
                    </div>
                  )}
                  <h3
                    className={`text-2xl font-bold mb-2 ${
                      plan.highlighted ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={`text-sm mb-4 ${
                      plan.highlighted ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {plan.description}
                  </p>
                  <div className="mb-6">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span
                      className={
                        plan.highlighted ? "text-blue-100" : "text-gray-500"
                      }
                    >
                      {plan.period}
                    </span>
                  </div>
                  <a
                    href={`${appUrl}/register`}
                    className={`block w-full py-3 px-4 text-center font-semibold rounded-xl transition-colors mb-8 ${
                      plan.highlighted
                        ? "bg-white text-blue-600 hover:bg-blue-50"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {plan.cta}
                  </a>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature.text} className="flex items-center gap-3">
                        <span
                          className={
                            feature.included
                              ? plan.highlighted
                                ? "text-blue-200"
                                : "text-green-500"
                              : "text-gray-300"
                          }
                        >
                          {feature.included ? "✓" : "✗"}
                        </span>
                        <span
                          className={
                            feature.included
                              ? plan.highlighted
                                ? "text-white"
                                : "text-gray-700"
                              : "text-gray-400"
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

        {/* Custom Plans CTA */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              ¿Necesitás más pacientes o doctores?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Si tu clínica necesita más capacidad, contactanos para armar un
              plan a medida con paquetes adicionales de pacientes, doctores y
              almacenamiento.
            </p>
            <a
              href="mailto:contacto@alveodent.com?subject=Consulta%20por%20plan%20personalizado"
              className="inline-block bg-blue-600 text-white hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
            >
              Consultar por más capacidad
            </a>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQ />

        {/* CTA Section */}
        <section className="bg-blue-600 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              ¿Listo para comenzar?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Prueba Alveodent gratis por 14 días. Sin tarjeta de crédito.
            </p>
            <a
              href={`${appUrl}/register`}
              className="inline-block bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
            >
              Crear Cuenta Gratis
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
