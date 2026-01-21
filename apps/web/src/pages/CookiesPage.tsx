import { LegalLayout } from "../components/LegalLayout";

export function CookiesPage() {
  return (
    <LegalLayout title="Política de Cookies" lastUpdated="21 de enero de 2026">
      <section>
        <h2>1. ¿Qué son las Cookies?</h2>
        <p>
          Las cookies son pequeños archivos de texto que se almacenan en su
          dispositivo cuando visita un sitio web. Se utilizan ampliamente para
          hacer que los sitios web funcionen de manera más eficiente y para
          proporcionar información a los propietarios del sitio.
        </p>
      </section>

      <section>
        <h2>2. Tipos de Cookies que Utilizamos</h2>

        <h3>2.1 Cookies Esenciales</h3>
        <p>
          Estas cookies son necesarias para el funcionamiento básico del
          Servicio. Incluyen cookies que permiten iniciar sesión en áreas
          seguras y mantener su sesión activa. Sin estas cookies, el Servicio no
          puede funcionar correctamente.
        </p>

        <h3>2.2 Cookies de Preferencias</h3>
        <p>
          Estas cookies permiten que el Servicio recuerde sus preferencias, como
          el idioma seleccionado o la configuración regional. Ayudan a
          personalizar su experiencia.
        </p>

        <h3>2.3 Cookies de Rendimiento</h3>
        <p>
          Recopilan información sobre cómo utiliza el Servicio, como las páginas
          que visita con más frecuencia. Nos ayudan a mejorar el funcionamiento
          del Servicio. Toda la información es anónima y agregada.
        </p>
      </section>

      <section>
        <h2>3. Cookies de Terceros</h2>
        <p>
          Podemos utilizar servicios de terceros que establecen sus propias
          cookies, como:
        </p>
        <ul>
          <li>
            <strong>Servicios de análisis:</strong> Para entender cómo se
            utiliza el Servicio
          </li>
          <li>
            <strong>Servicios de pago:</strong> Para procesar transacciones de
            forma segura
          </li>
        </ul>
        <p>
          Estos terceros tienen sus propias políticas de privacidad y cookies.
        </p>
      </section>

      <section>
        <h2>4. Duración de las Cookies</h2>
        <p>Las cookies pueden ser:</p>
        <ul>
          <li>
            <strong>Cookies de sesión:</strong> Se eliminan cuando cierra el
            navegador
          </li>
          <li>
            <strong>Cookies persistentes:</strong> Permanecen en su dispositivo
            durante un período determinado o hasta que las elimine manualmente
          </li>
        </ul>
      </section>

      <section>
        <h2>5. Control de Cookies</h2>
        <p>
          Puede controlar y gestionar las cookies de varias maneras. Tenga en
          cuenta que eliminar o bloquear cookies puede afectar su experiencia de
          usuario y algunas funciones pueden no estar disponibles.
        </p>

        <h3>5.1 Configuración del Navegador</h3>
        <p>
          La mayoría de los navegadores le permiten rechazar o aceptar cookies,
          así como eliminar las cookies existentes. Las opciones se encuentran
          generalmente en el menú de "Configuración" o "Preferencias" de su
          navegador.
        </p>

        <h3>5.2 Cookies Esenciales</h3>
        <p>
          Las cookies esenciales no se pueden desactivar, ya que son necesarias
          para el funcionamiento del Servicio.
        </p>
      </section>

      <section>
        <h2>6. Cambios a esta Política</h2>
        <p>
          Podemos actualizar esta Política de Cookies ocasionalmente. Los
          cambios se publicarán en esta página con una nueva fecha de
          actualización.
        </p>
      </section>

      <section>
        <h2>7. Contacto</h2>
        <p>
          Si tiene preguntas sobre nuestra Política de Cookies, puede
          contactarnos a través de nuestro correo electrónico de soporte.
        </p>
      </section>
    </LegalLayout>
  );
}
