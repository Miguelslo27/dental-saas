import { LegalLayout } from "../components/LegalLayout";

export function PrivacyPage() {
  return (
    <LegalLayout
      title="Política de Privacidad"
      lastUpdated="21 de enero de 2026"
    >
      <section>
        <h2>1. Introducción</h2>
        <p>
          En Alveodent, nos comprometemos a proteger su privacidad y la de sus
          pacientes. Esta Política de Privacidad explica cómo recopilamos,
          usamos, almacenamos y protegemos la información personal.
        </p>
      </section>

      <section>
        <h2>2. Información que Recopilamos</h2>
        <h3>2.1 Información de la Cuenta</h3>
        <p>
          Al registrarse, recopilamos información como nombre, correo
          electrónico, nombre de la clínica y datos de contacto.
        </p>

        <h3>2.2 Datos de Pacientes</h3>
        <p>
          Usted, como profesional de la salud, es responsable de los datos de
          pacientes que ingrese en el sistema. Estos pueden incluir:
        </p>
        <ul>
          <li>Datos de identificación personal</li>
          <li>Historial médico y dental</li>
          <li>Información de tratamientos</li>
          <li>Imágenes clínicas</li>
        </ul>

        <h3>2.3 Datos de Uso</h3>
        <p>
          Recopilamos información sobre cómo utiliza el Servicio, incluyendo
          páginas visitadas, funciones utilizadas y patrones de uso.
        </p>
      </section>

      <section>
        <h2>3. Uso de la Información</h2>
        <p>Utilizamos la información recopilada para:</p>
        <ul>
          <li>Proporcionar y mantener el Servicio</li>
          <li>Mejorar y personalizar la experiencia del usuario</li>
          <li>Enviar comunicaciones importantes sobre el Servicio</li>
          <li>Proporcionar soporte técnico</li>
          <li>Cumplir con obligaciones legales</li>
        </ul>
      </section>

      <section>
        <h2>4. Almacenamiento y Seguridad</h2>
        <p>
          Implementamos medidas de seguridad técnicas y organizativas para
          proteger sus datos, incluyendo:
        </p>
        <ul>
          <li>Encriptación de datos en tránsito y en reposo</li>
          <li>Acceso restringido basado en roles</li>
          <li>Copias de seguridad automáticas</li>
          <li>Monitoreo de seguridad continuo</li>
          <li>Servidores seguros con certificación</li>
        </ul>
        <p>
          Los datos se almacenan en centros de datos seguros y se mantienen
          durante el tiempo que su cuenta esté activa o según sea necesario para
          cumplir con obligaciones legales.
        </p>
      </section>

      <section>
        <h2>5. Compartición de Datos</h2>
        <p>
          No vendemos, alquilamos ni compartimos sus datos personales o los
          datos de sus pacientes con terceros, excepto:
        </p>
        <ul>
          <li>Con su consentimiento explícito</li>
          <li>Para cumplir con obligaciones legales</li>
          <li>
            Con proveedores de servicios que nos ayudan a operar el Servicio
            (bajo acuerdos de confidencialidad)
          </li>
        </ul>
      </section>

      <section>
        <h2>6. Sus Derechos</h2>
        <p>Usted tiene derecho a:</p>
        <ul>
          <li>Acceder a sus datos personales</li>
          <li>Rectificar datos incorrectos</li>
          <li>Solicitar la eliminación de sus datos</li>
          <li>Exportar sus datos en formato portable</li>
          <li>Oponerse al procesamiento de sus datos</li>
        </ul>
        <p>
          Para ejercer estos derechos, puede contactarnos a través de nuestro
          correo de soporte.
        </p>
      </section>

      <section>
        <h2>7. Responsabilidad del Usuario</h2>
        <p>
          Como usuario del Servicio y profesional de la salud, usted es
          responsable de:
        </p>
        <ul>
          <li>Obtener el consentimiento de sus pacientes para el tratamiento de datos</li>
          <li>Cumplir con las leyes de protección de datos de salud aplicables</li>
          <li>Mantener la confidencialidad de sus credenciales de acceso</li>
          <li>Notificar cualquier incidente de seguridad</li>
        </ul>
      </section>

      <section>
        <h2>8. Cookies</h2>
        <p>
          Utilizamos cookies y tecnologías similares para mejorar la experiencia
          del usuario. Consulte nuestra Política de Cookies para más
          información.
        </p>
      </section>

      <section>
        <h2>9. Cambios a esta Política</h2>
        <p>
          Podemos actualizar esta Política de Privacidad periódicamente. Le
          notificaremos sobre cambios significativos a través del Servicio o por
          correo electrónico.
        </p>
      </section>

      <section>
        <h2>10. Contacto</h2>
        <p>
          Si tiene preguntas sobre esta Política de Privacidad o sobre cómo
          manejamos sus datos, puede contactarnos a través de nuestro correo
          electrónico de soporte.
        </p>
      </section>
    </LegalLayout>
  );
}
