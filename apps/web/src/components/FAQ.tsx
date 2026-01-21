import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    id: "change-plan",
    question: "¿Puedo cambiar de plan en cualquier momento?",
    answer:
      "Sí, puedes actualizar o degradar tu plan en cualquier momento. Los cambios se aplican inmediatamente y se prorratean según el tiempo restante del período de facturación.",
  },
  {
    id: "exceed-limits",
    question: "¿Qué pasa si supero los límites de mi plan?",
    answer:
      "Recibirás una notificación cuando estés cerca de los límites. No perderás acceso a tus datos, pero no podrás agregar más registros hasta que actualices tu plan o elimines algunos existentes.",
  },
  {
    id: "annual-discount",
    question: "¿Ofrecen descuentos para pagos anuales?",
    answer:
      "Sí, ofrecemos un 20% de descuento para suscripciones anuales. Contacta a ventas para más información.",
  },
  {
    id: "data-security",
    question: "¿Mis datos están seguros?",
    answer:
      "Absolutamente. Usamos encriptación de nivel bancario, servidores seguros y realizamos backups automáticos. Cumplimos con las normativas de protección de datos.",
  },
  {
    id: "cancel-anytime",
    question: "¿Puedo cancelar en cualquier momento?",
    answer:
      "Sí, puedes cancelar tu suscripción cuando quieras. Mantendrás acceso hasta el final del período de facturación actual.",
  },
  {
    id: "trial-period",
    question: "¿Cómo funciona el período de prueba?",
    answer:
      "Ofrecemos 14 días de prueba gratuita con acceso completo a todas las funciones del plan Empresa. No se requiere tarjeta de crédito para comenzar.",
  },
  {
    id: "import-data",
    question: "¿Puedo importar datos de otro sistema?",
    answer:
      "Sí, ofrecemos herramientas de importación para migrar tus datos desde otros sistemas. Nuestro equipo de soporte puede ayudarte con el proceso de migración.",
  },
  {
    id: "support-types",
    question: "¿Qué tipo de soporte ofrecen?",
    answer:
      "El plan Gratis incluye soporte de comunidad. El plan Básico incluye soporte por email con respuesta en 24 horas. El plan Empresa incluye soporte prioritario con respuesta en 4 horas y acceso a videollamadas.",
  },
  {
    id: "mobile-devices",
    question: "¿Funciona en dispositivos móviles?",
    answer:
      "Sí, Alveodent es completamente responsive y funciona en cualquier dispositivo: computadoras, tablets y smartphones. Puedes acceder a tu clínica desde cualquier lugar.",
  },
  {
    id: "patient-data",
    question: "¿Cómo se manejan los datos de pacientes?",
    answer:
      "Los datos de pacientes se almacenan de forma segura con encriptación en reposo y en tránsito. Cumplimos con las normativas de protección de datos de salud y realizamos backups automáticos diarios.",
  },
];

interface FAQItemProps {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItemComponent({ item, isOpen, onToggle }: FAQItemProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-lg font-semibold text-gray-900">{item.question}</h3>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid transition-all duration-200 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <div className="px-6 pb-6">
            <p className="text-gray-600">{item.answer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FAQProps {
  title?: string;
  showBackground?: boolean;
}

export function FAQ({
  title = "Preguntas Frecuentes",
  showBackground = true,
}: FAQProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section
      className={`py-16 px-4 sm:px-6 lg:px-8 ${showBackground ? "bg-gray-50" : ""}`}
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
          {title}
        </h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <FAQItemComponent
              key={faq.id}
              item={faq}
              isOpen={openId === faq.id}
              onToggle={() => handleToggle(faq.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
