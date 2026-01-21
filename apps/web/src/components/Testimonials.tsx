interface Testimonial {
  id: string;
  name: string;
  role: string;
  clinic: string;
  quote: string;
  initials: string;
}

const testimonials: Testimonial[] = [
  {
    id: "maria-garcia",
    name: "Dra. María García",
    role: "Directora",
    clinic: "Dental Care Plus",
    quote:
      "Alveodent ha transformado completamente la manera en que gestionamos nuestra clínica. Antes perdíamos horas en papeleo, ahora todo está digitalizado y accesible en segundos.",
    initials: "MG",
  },
  {
    id: "carlos-rodriguez",
    name: "Dr. Carlos Rodríguez",
    role: "Odontólogo",
    clinic: "Sonrisa Perfecta",
    quote:
      "El odontograma digital es increíble. Puedo mostrar a mis pacientes exactamente qué tratamientos necesitan y ellos entienden mejor su situación. Ha mejorado la comunicación enormemente.",
    initials: "CR",
  },
  {
    id: "ana-martinez",
    name: "Ana Martínez",
    role: "Administradora",
    clinic: "Centro Odontológico San Martín",
    quote:
      "La agenda inteligente nos salvó la vida. Ya no tenemos citas duplicadas ni pacientes olvidados. Los recordatorios automáticos redujeron las ausencias en un 40%.",
    initials: "AM",
  },
  {
    id: "roberto-sanchez",
    name: "Dr. Roberto Sánchez",
    role: "Director Médico",
    clinic: "Clínica Dental Familiar",
    quote:
      "Probamos varios sistemas antes de Alveodent. Ninguno era tan intuitivo ni tan completo. El soporte técnico responde rápido y siempre encuentran solución.",
    initials: "RS",
  },
];

interface TestimonialCardProps {
  testimonial: Testimonial;
}

function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
      <div className="flex-1">
        <svg
          className="w-8 h-8 text-blue-200 mb-4"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
        <p className="text-gray-600 mb-6 leading-relaxed">
          "{testimonial.quote}"
        </p>
      </div>
      <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
          {testimonial.initials}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{testimonial.name}</p>
          <p className="text-sm text-gray-500">
            {testimonial.role} · {testimonial.clinic}
          </p>
        </div>
      </div>
    </div>
  );
}

interface TestimonialsProps {
  title?: string;
  subtitle?: string;
}

export function Testimonials({
  title = "Lo que dicen nuestros usuarios",
  subtitle = "Profesionales de la salud dental confían en Alveodent para gestionar sus clínicas.",
}: TestimonialsProps) {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}
