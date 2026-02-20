import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import {
  Users,
  CalendarDays,
  Stethoscope,
  UserCog,
  Receipt,
  FlaskConical,
  CreditCard,
  LayoutDashboard,
  FileDown,
  BarChart3,
  Building2,
  ShieldCheck,
  Lock,
  Languages,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  highlights: string[];
}

interface FeatureCategory {
  title: string;
  subtitle: string;
  features: Feature[];
}

const categories: FeatureCategory[] = [
  {
    title: "Gestión Clínica",
    subtitle:
      "Las herramientas esenciales para el día a día de tu consultorio dental.",
    features: [
      {
        icon: Users,
        title: "Gestión de Pacientes",
        description:
          "Centraliza toda la información de tus pacientes en fichas completas y organizadas.",
        highlights: [
          "Historial clínico completo",
          "Fichas con datos personales y médicos",
          "Notas clínicas por consulta",
          "Búsqueda y filtrado avanzado",
        ],
      },
      {
        icon: Stethoscope,
        title: "Odontograma Digital",
        description:
          "Carta dental interactiva para registrar el estado de cada diente con precisión.",
        highlights: [
          "9 estados clínicos por diente",
          "Visualización gráfica interactiva",
          "Historial de cambios por diente",
          "Vista panorámica y por cuadrante",
        ],
      },
      {
        icon: CalendarDays,
        title: "Agenda de Citas",
        description:
          "Organiza las citas de tu clínica con un calendario visual e intuitivo.",
        highlights: [
          "Calendario visual por día y semana",
          "Gestión multi-doctor",
          "Estados de cita (confirmada, cancelada, completada)",
          "Vista rápida de disponibilidad",
        ],
      },
      {
        icon: UserCog,
        title: "Gestión de Doctores",
        description:
          "Administra los profesionales de tu clínica con perfiles detallados.",
        highlights: [
          "Perfiles profesionales completos",
          "Especialidades y horarios",
          "Asignación de pacientes",
          "Agenda individual por doctor",
        ],
      },
    ],
  },
  {
    title: "Administración",
    subtitle: "Control financiero y operativo para mantener tu clínica en orden.",
    features: [
      {
        icon: Receipt,
        title: "Control de Gastos",
        description:
          "Registra y categoriza los gastos de tu clínica para un control financiero completo.",
        highlights: [
          "Registro de gastos por categoría",
          "Reportes financieros mensuales",
          "Seguimiento de presupuesto",
          "Exportación de datos",
        ],
      },
      {
        icon: FlaskConical,
        title: "Trabajos de Laboratorio",
        description:
          "Gestiona los pedidos a laboratorios dentales con seguimiento de estado.",
        highlights: [
          "Seguimiento de pedidos",
          "Estados (pendiente, en proceso, listo)",
          "Fechas de entrega estimadas",
          "Historial por paciente",
        ],
      },
      {
        icon: CreditCard,
        title: "Pagos de Pacientes",
        description:
          "Lleva el control de pagos y estados de cuenta de cada paciente.",
        highlights: [
          "Registro de pagos parciales y totales",
          "Historial de transacciones",
          "Estados de cuenta por paciente",
          "Múltiples métodos de pago",
        ],
      },
    ],
  },
  {
    title: "Inteligencia y Reportes",
    subtitle:
      "Datos y métricas para tomar mejores decisiones sobre tu clínica.",
    features: [
      {
        icon: LayoutDashboard,
        title: "Dashboard",
        description:
          "Vista general con las métricas más importantes de tu clínica en tiempo real.",
        highlights: [
          "Resumen de actividad diaria",
          "Gráficos de ingresos y citas",
          "Métricas clave de rendimiento",
          "Acceso rápido a acciones frecuentes",
        ],
      },
      {
        icon: BarChart3,
        title: "Estadísticas",
        description:
          "Analiza el rendimiento de tu clínica con reportes detallados.",
        highlights: [
          "Ingresos por período",
          "Tratamientos más realizados",
          "Rendimiento por doctor",
          "Tendencias y comparativas",
        ],
      },
      {
        icon: FileDown,
        title: "Exportación PDF",
        description:
          "Genera documentos profesionales listos para imprimir o enviar.",
        highlights: [
          "Fichas de pacientes en PDF",
          "Reportes y presupuestos",
          "Soporte multi-idioma en documentos",
          "Diseño profesional personalizado",
        ],
      },
    ],
  },
  {
    title: "Plataforma",
    subtitle: "Infraestructura robusta, segura y flexible para tu clínica.",
    features: [
      {
        icon: Building2,
        title: "Multi-Clínica",
        description:
          "Cada clínica opera en su propio espacio aislado con datos independientes.",
        highlights: [
          "Espacios aislados por clínica",
          "Datos completamente independientes",
          "Configuración personalizada por clínica",
          "Slug único para cada consultorio",
        ],
      },
      {
        icon: ShieldCheck,
        title: "Roles y Permisos",
        description:
          "Control de acceso granular con 6 niveles y más de 50 permisos configurables.",
        highlights: [
          "6 roles: Owner, Admin, Clinic Admin, Doctor, Staff",
          "50+ permisos granulares",
          "Control por módulo y acción",
          "Interfaz de gestión de usuarios",
        ],
      },
      {
        icon: Lock,
        title: "Seguridad",
        description:
          "Protección de datos con estándares de seguridad modernos.",
        highlights: [
          "Autenticación con tokens JWT",
          "Encriptación de datos sensibles",
          "Control de acceso por rol",
          "Sesiones seguras con refresh tokens",
        ],
      },
      {
        icon: Languages,
        title: "Multi-idioma",
        description:
          "Interfaz disponible en múltiples idiomas con soporte completo de RTL.",
        highlights: [
          "Español, Inglés y Árabe",
          "Soporte RTL (derecha a izquierda)",
          "Documentos PDF multi-idioma",
          "Cambio de idioma en tiempo real",
        ],
      },
    ],
  },
];

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;
  return (
    <div className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {feature.title}
      </h3>
      <p className="text-gray-600 mb-4">{feature.description}</p>
      <ul className="space-y-2">
        {feature.highlights.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
            <span className="text-blue-500 mt-0.5">&#10003;</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FeaturesPage() {
  const appUrl = __APP_URL__;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6">
              Características
            </h1>
            <p className="text-xl text-gray-600">
              Todo lo que necesitas para gestionar tu clínica dental de forma
              moderna, segura y eficiente.
            </p>
          </div>
        </section>

        {/* Feature Categories */}
        {categories.map((category, index) => (
          <section
            key={category.title}
            className={`py-20 px-4 sm:px-6 lg:px-8 ${
              index % 2 === 0 ? "bg-white" : "bg-gray-50"
            }`}
          >
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {category.title}
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  {category.subtitle}
                </p>
              </div>
              <div
                className={`grid gap-8 ${
                  category.features.length === 4
                    ? "md:grid-cols-2 lg:grid-cols-4"
                    : "md:grid-cols-3"
                }`}
              >
                {category.features.map((feature) => (
                  <FeatureCard key={feature.title} feature={feature} />
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* CTA Section */}
        <section className="bg-blue-600 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              ¿Listo para modernizar tu clínica?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Prueba todas las funcionalidades gratis por 14 días. Sin tarjeta
              de crédito.
            </p>
            <a
              href={`${appUrl}/register`}
              className="inline-block bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold text-lg transition-colors"
            >
              Comenzar Gratis
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
