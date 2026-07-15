export interface LegalSection {
  heading: string
  content: string[]
  list?: string[]
}

export interface LegalDocument {
  title: string
  lastUpdated: string
  sections: LegalSection[]
}

export const privacyContent: Record<'en' | 'es', LegalDocument> = {
  en: {
    title: 'Privacy Policy',
    lastUpdated: 'July 15, 2026',
    sections: [
      {
        heading: 'Who We Are',
        content: [
          'Quetzal Liveaboard ("Quetzal," "we," "our," or "us") operates the website quetzalliveaboard.com and provides liveaboard diving expeditions in Mexican waters, operating out of La Paz, Baja California Sur, Mexico.',
          'For the purposes of applicable data protection laws, Quetzal Liveaboard is the data controller responsible for your personal information.',
        ],
      },
      {
        heading: 'Jurisdiction & Governing Law',
        content: [
          'This Privacy Policy is governed by the Ley Federal de Protección de Datos Personales en Posesión de los Particulares (Federal Law on Protection of Personal Data Held by Private Parties) of the United Mexican States. By using our website and services, regardless of your country of residence, you consent to the processing of your data in accordance with Mexican law.',
          'For citizens of the European Union, the General Data Protection Regulation (GDPR) also applies to the extent that we process personal data of EU residents. We are committed to upholding the rights granted under both Mexican law and the GDPR.',
        ],
      },
      {
        heading: 'What Data We Collect',
        content: [
          'To provide our services effectively, we collect the following categories of personal information:',
        ],
        list: [
          'Identity & Contact: Full name, email address, phone number, mailing address, and country of residence.',
          'Travel Documents: Passport number, nationality, and date of birth — required by Mexican maritime authorities for passenger manifests.',
          'Diving & Medical: Diving certification level and agency, logged dive count, relevant medical conditions, dietary restrictions, and emergency contact details.',
          'Payment Information: Credit card details, billing address, and transaction history. Full card numbers are not stored on our servers; they are processed by our PCI-compliant payment gateways.',
          'Travel Preferences: Cabin type preference, dive gear rental requests, and special occasion notes.',
          'Communication Records: Emails, WhatsApp messages, contact form submissions, and phone call summaries.',
        ],
      },
      {
        heading: 'How We Collect It',
        content: [
          'We collect your personal information through the following channels:',
        ],
        list: [
          'Booking & Contact Forms: When you book an expedition or submit an inquiry through our website.',
          'Direct Communication: Via email, WhatsApp, phone calls, or social media messages.',
          'Automated Technologies: Cookies, server logs, and analytics tools when you browse our website.',
          'Third Parties: Travel agencies or dive operators who book on your behalf with your consent.',
        ],
      },
      {
        heading: 'Server Logs & Analytics',
        content: [
          'When you visit our website, our servers automatically record certain information sent by your browser. This may include your IP address, browser type and version, operating system, screen resolution, referring URL, pages visited, and the date and time of your visit.',
          'We use Google Analytics and similar tools to understand how visitors interact with our website. These services use cookies to collect anonymized data about traffic patterns and user behavior. You can opt out of Google Analytics by installing the Google Analytics Opt-out Browser Add-on.',
        ],
      },
      {
        heading: 'How We Use Your Data',
        content: [
          'We use your personal information for the following purposes:',
        ],
        list: [
          'Booking & Service Delivery: To process your reservation, confirm your expedition, communicate itinerary details, and provide the services you have purchased.',
          'Legal Compliance: To submit passenger manifests to Mexican maritime and port authorities as required by law (Ley de Navegación y Comercio Marítimos).',
          'Safety & Emergencies: To ensure we have accurate medical and emergency contact information in case of an incident during your expedition.',
          'Customer Support: To respond to your inquiries, resolve issues, and provide pre-trip and post-trip assistance.',
          'Marketing Communications: With your explicit consent, to send you newsletters, special offers, and trip announcements. You may unsubscribe at any time.',
          'Service Improvement: To analyze aggregated data and improve our website, offerings, and customer experience.',
        ],
      },
      {
        heading: 'Cookies',
        content: [
          'Our website uses cookies and similar technologies to enhance your browsing experience. We use:',
        ],
        list: [
          'Essential Cookies: Required for the website to function — session management, security, and booking flow.',
          'Analytics Cookies: Google Analytics and similar services to measure site usage and performance.',
          'Preference Cookies: To remember your language selection and display preferences.',
        ],
      },
      {
        heading: 'Data Storage & Security',
        content: [
          'Your personal data is stored on secure servers with industry-standard encryption. We implement technical and organizational measures — including SSL/TLS encryption for all data in transit, firewalls, access controls, and secure authentication — to protect your information against unauthorized access, alteration, disclosure, or destruction.',
          'Payment information is processed by PCI-DSS compliant payment processors. We do not store complete credit card numbers on our systems.',
        ],
      },
      {
        heading: 'Third-Party Sharing',
        content: [
          'We do not sell, rent, or trade your personal information to third parties. We share data only in the following limited circumstances:',
        ],
        list: [
          'Payment Processors: Stripe and PayPal process your payments. They receive only the transaction data necessary to complete the payment.',
          'Maritime Authorities: Passenger manifests are submitted to Mexican port authorities (Capitanía de Puerto) and immigration authorities as required by law.',
          'Service Providers: Trusted vendors who assist with email delivery, website hosting, and analytics — bound by data processing agreements.',
          'Legal Obligations: When required by law, court order, or government regulation.',
        ],
      },
      {
        heading: 'Your ARCO Rights (Mexico)',
        content: [
          'Under Mexican law, you have the following rights regarding your personal data (known as ARCO rights):',
        ],
        list: [
          'Access: Request confirmation of whether we process your personal data and obtain a copy.',
          'Rectification: Request correction of inaccurate or incomplete data.',
          'Cancellation: Request deletion of your data when it is no longer needed for the purposes it was collected.',
          'Opposition: Object to the processing of your data for specific purposes, including direct marketing.',
        ],
      },
      {
        heading: 'Your GDPR Rights (EU Residents)',
        content: [
          'If you reside in the European Union, you have additional rights under the GDPR:',
        ],
        list: [
          'Right to data portability in a structured, machine-readable format.',
          'Right to restrict processing under certain conditions.',
          'Right to withdraw consent at any time without affecting the lawfulness of prior processing.',
          'Right to lodge a complaint with your local data protection supervisory authority.',
        ],
      },
      {
        heading: 'Data Retention',
        content: [
          'We retain your personal information only as long as necessary to fulfill the purposes for which it was collected, or as required by Mexican law. Booking and financial records are retained for a minimum of 5 years per tax and maritime regulations. Marketing consent data is retained until you withdraw consent. Server logs and analytics data are retained for up to 26 months.',
        ],
      },
      {
        heading: 'Contact Us',
        content: [
          'To exercise your ARCO or GDPR rights, or if you have questions about this Privacy Policy, contact us at:',
        ],
        list: [
          'Email: info@quetzalliveaboard.com',
          'Phone: +52 (612) XXX-XXXX',
          'Address: La Paz, Baja California Sur, Mexico',
        ],
      },
    ],
  },
  es: {
    title: 'Política de Privacidad',
    lastUpdated: '15 de julio de 2026',
    sections: [
      {
        heading: 'Quiénes Somos',
        content: [
          'Quetzal Liveaboard ("Quetzal," "nosotros" o "nuestro") opera el sitio web quetzalliveaboard.com y ofrece expediciones de buceo liveaboard en aguas mexicanas, con base en La Paz, Baja California Sur, México.',
          'Para efectos de las leyes de protección de datos aplicables, Quetzal Liveaboard es el responsable del tratamiento de tu información personal.',
        ],
      },
      {
        heading: 'Jurisdicción y Ley Aplicable',
        content: [
          'Esta Política de Privacidad se rige por la Ley Federal de Protección de Datos Personales en Posesión de los Particulares de los Estados Unidos Mexicanos. Al utilizar nuestro sitio web y servicios, independientemente de tu país de residencia, aceptas el tratamiento de tus datos conforme a la legislación mexicana.',
          'Para ciudadanos de la Unión Europea, también aplica el Reglamento General de Protección de Datos (GDPR) en la medida en que tratemos datos personales de residentes de la UE. Estamos comprometidos a respetar los derechos otorgados tanto por la legislación mexicana como por el GDPR.',
        ],
      },
      {
        heading: 'Qué Datos Recopilamos',
        content: [
          'Para ofrecer nuestros servicios de manera efectiva, recopilamos las siguientes categorías de información personal:',
        ],
        list: [
          'Identidad y Contacto: Nombre completo, correo electrónico, número de teléfono, domicilio y país de residencia.',
          'Documentos de Viaje: Número de pasaporte, nacionalidad y fecha de nacimiento — requeridos por las autoridades marítimas mexicanas para los manifiestos de pasajeros.',
          'Buceo y Salud: Nivel y agencia de certificación de buceo, número de inmersiones registradas, condiciones médicas relevantes, restricciones alimentarias y datos de contacto de emergencia.',
          'Información de Pago: Datos de tarjeta de crédito, dirección de facturación e historial de transacciones. Los números completos de tarjeta no se almacenan en nuestros servidores; son procesados por nuestras pasarelas de pago con certificación PCI.',
          'Preferencias de Viaje: Tipo de cabina, solicitudes de renta de equipo de buceo y notas sobre ocasiones especiales.',
          'Registros de Comunicación: Correos electrónicos, mensajes de WhatsApp, formularios de contacto y resúmenes de llamadas.',
        ],
      },
      {
        heading: 'Cómo Recopilamos tus Datos',
        content: [
          'Recopilamos tu información personal a través de los siguientes canales:',
        ],
        list: [
          'Formularios de Reserva y Contacto: Al reservar una expedición o enviar una consulta a través de nuestro sitio web.',
          'Comunicación Directa: Por correo electrónico, WhatsApp, llamadas telefónicas o mensajes en redes sociales.',
          'Tecnologías Automatizadas: Cookies, registros de servidor y herramientas de análisis al navegar por nuestro sitio.',
          'Terceros: Agencias de viajes u operadores de buceo que reservan en tu nombre con tu consentimiento.',
        ],
      },
      {
        heading: 'Registros de Servidor y Analítica',
        content: [
          'Cuando visitas nuestro sitio web, nuestros servidores registran automáticamente cierta información enviada por tu navegador. Esto puede incluir tu dirección IP, tipo y versión de navegador, sistema operativo, resolución de pantalla, URL de referencia, páginas visitadas y la fecha y hora de tu visita.',
          'Utilizamos Google Analytics y herramientas similares para entender cómo los visitantes interactúan con nuestro sitio web. Estos servicios usan cookies para recopilar datos anónimos sobre patrones de tráfico y comportamiento del usuario. Puedes desactivar Google Analytics instalando el complemento de inhabilitación de Google Analytics.',
        ],
      },
      {
        heading: 'Cómo Usamos tus Datos',
        content: [
          'Utilizamos tu información personal para los siguientes fines:',
        ],
        list: [
          'Reservas y Prestación del Servicio: Para procesar tu reserva, confirmar tu expedición, comunicar detalles del itinerario y brindar los servicios que has adquirido.',
          'Cumplimiento Legal: Para presentar manifiestos de pasajeros ante las autoridades marítimas y portuarias mexicanas según lo exige la Ley de Navegación y Comercio Marítimos.',
          'Seguridad y Emergencias: Para contar con información médica y de contacto de emergencia precisa en caso de un incidente durante tu expedición.',
          'Atención al Cliente: Para responder a tus consultas, resolver problemas y brindar asistencia antes y después del viaje.',
          'Comunicaciones de Marketing: Con tu consentimiento explícito, para enviarte boletines, ofertas especiales y anuncios de viajes. Puedes cancelar la suscripción en cualquier momento.',
          'Mejora del Servicio: Para analizar datos agregados y mejorar nuestro sitio web, ofertas y experiencia del cliente.',
        ],
      },
      {
        heading: 'Cookies',
        content: [
          'Nuestro sitio web utiliza cookies y tecnologías similares para mejorar tu experiencia de navegación. Utilizamos:',
        ],
        list: [
          'Cookies Esenciales: Necesarias para el funcionamiento del sitio — gestión de sesión, seguridad y flujo de reserva.',
          'Cookies de Analítica: Google Analytics y servicios similares para medir el uso y rendimiento del sitio.',
          'Cookies de Preferencias: Para recordar tu selección de idioma y preferencias de visualización.',
        ],
      },
      {
        heading: 'Almacenamiento y Seguridad de Datos',
        content: [
          'Tu información personal se almacena en servidores seguros con cifrado de nivel industrial. Implementamos medidas técnicas y organizativas — incluyendo cifrado SSL/TLS para todos los datos en tránsito, cortafuegos, controles de acceso y autenticación segura — para proteger tu información contra accesos no autorizados, alteración, divulgación o destrucción.',
          'La información de pago es procesada por procesadores de pago con certificación PCI-DSS. No almacenamos números completos de tarjetas de crédito en nuestros sistemas.',
        ],
      },
      {
        heading: 'Compartición con Terceros',
        content: [
          'No vendemos, rentamos ni intercambiamos tu información personal con terceros. Compartimos datos únicamente en las siguientes circunstancias limitadas:',
        ],
        list: [
          'Procesadores de Pago: Stripe y PayPal procesan tus pagos. Reciben únicamente los datos de transacción necesarios para completar el pago.',
          'Autoridades Marítimas: Los manifiestos de pasajeros se presentan ante la Capitanía de Puerto y las autoridades migratorias mexicanas según lo exige la ley.',
          'Proveedores de Servicios: Proveedores confiables que ayudan con el envío de correos, alojamiento web y analítica — sujetos a acuerdos de tratamiento de datos.',
          'Obligaciones Legales: Cuando lo requiera la ley, una orden judicial o una regulación gubernamental.',
        ],
      },
      {
        heading: 'Tus Derechos ARCO (México)',
        content: [
          'Conforme a la legislación mexicana, tienes los siguientes derechos sobre tus datos personales (derechos ARCO):',
        ],
        list: [
          'Acceso: Solicitar confirmación de si tratamos tus datos personales y obtener una copia.',
          'Rectificación: Solicitar la corrección de datos inexactos o incompletos.',
          'Cancelación: Solicitar la eliminación de tus datos cuando ya no sean necesarios para los fines que fueron recopilados.',
          'Oposición: Oponerte al tratamiento de tus datos para fines específicos, incluido el marketing directo.',
        ],
      },
      {
        heading: 'Tus Derechos GDPR (Residentes UE)',
        content: [
          'Si resides en la Unión Europea, tienes derechos adicionales bajo el GDPR:',
        ],
        list: [
          'Derecho a la portabilidad de datos en un formato estructurado y legible por máquina.',
          'Derecho a limitar el tratamiento bajo ciertas condiciones.',
          'Derecho a retirar el consentimiento en cualquier momento sin que ello afecte la licitud del tratamiento previo.',
          'Derecho a presentar una queja ante tu autoridad local de protección de datos.',
        ],
      },
      {
        heading: 'Retención de Datos',
        content: [
          'Conservamos tu información personal solo durante el tiempo necesario para cumplir con los fines para los que fue recopilada, o según lo exija la legislación mexicana. Los registros de reservas y financieros se conservan por un mínimo de 5 años según las regulaciones fiscales y marítimas. Los datos de consentimiento de marketing se conservan hasta que retires tu consentimiento. Los registros de servidor y datos de analítica se conservan hasta por 26 meses.',
        ],
      },
      {
        heading: 'Contacto',
        content: [
          'Para ejercer tus derechos ARCO o GDPR, o si tienes preguntas sobre esta Política de Privacidad, contáctanos en:',
        ],
        list: [
          'Correo: info@quetzalliveaboard.com',
          'Teléfono: +52 (612) XXX-XXXX',
          'Dirección: La Paz, Baja California Sur, México',
        ],
      },
    ],
  },
}
