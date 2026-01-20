import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

const plans = [
  {
    name: "Gratis",
    price: "$0",
    period: "/mes",
    description: "Perfecto para empezar",
    features: [
      { text: "1 Administrador", included: true },
      { text: "3 Doctores", included: true },
      { text: "15 Pacientes", included: true },
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
    price: "$5.99",
    period: "/mes",
    description: "Para clínicas en crecimiento",
    features: [
      { text: "2 Administradores", included: true },
      { text: "5 Doctores", included: true },
      { text: "25 Pacientes", included: true },
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
    price: "$11.99",
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

const faqs = [
  {
    question: "¿Puedo cambiar de plan en cualquier momento?",
    answer:
      "Sí, puedes actualizar o degradar tu plan en cualquier momento. Los cambios se aplican inmediatamente y se prorratean según el tiempo restante del período de facturación.",
  },
  {
    question: "¿Qué pasa si supero los límites de mi plan?",
    answer:
      "Recibirás una notificación cuando estés cerca de los límites. No perderás acceso a tus datos, pero no podrás agregar más registros hasta que actualices tu plan o elimines algunos existentes.",
  },
  {
    question: "¿Ofrecen descuentos para pagos anuales?",
    answer:
      "Sí, ofrecemos un 20% de descuento para suscripciones anuales. Contacta a ventas para más información.",
  },
  {
    question: "¿Mis datos están seguros?",
    answer:
      "Absolutamente. Usamos encriptación de nivel bancario, servidores seguros y realizamos backups automáticos. Cumplimos con las normativas de protección de datos.",
  },
  {
    question: "¿Puedo cancelar en cualquier momento?",
    answer:
      "Sí, puedes cancelar tu suscripción cuando quieras. Mantendrás acceso hasta el final del período de facturación actual.",
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

        {/* FAQ Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              Preguntas Frecuentes
            </h2>
            <div className="space-y-6">
              {faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="bg-white p-6 rounded-xl shadow-sm"
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
