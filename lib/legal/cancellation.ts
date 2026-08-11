import type { LegalDocument } from './privacy'

export const cancellationContent: Record<'en' | 'es', LegalDocument> = {
  en: {
    title: 'Cancellation & Refund Policy',
    lastUpdated: 'July 15, 2026',
    sections: [
      {
        heading: 'Overview',
        content: [
          'We understand that plans can change. Our cancellation policy is designed to be fair to both our guests and our operations, recognizing that late cancellations leave us with limited options to fill the vacated spaces. The following terms apply to all reservations unless a separate written agreement states otherwise.',
        ],
      },
      {
        heading: 'Cancellation by Guest — Refund Schedule',
        content: [
          'If you need to cancel your reservation, the following refund schedule applies based on the date we receive your written cancellation notice:',
        ],
        list: [
          '90 days or more before departure: Full refund minus a $250 USD administrative fee per person.',
          '60 to 89 days before departure: 50% refund of the total trip cost.',
          '30 to 59 days before departure: 25% refund of the total trip cost.',
          'Less than 30 days before departure: No refund.',
        ],
      },
      {
        heading: 'Date Changes',
        content: [
          'We understand that sometimes a schedule conflict arises. One free date change to another available departure within the same calendar year is permitted, provided you notify us in writing at least 60 days before your original departure date. The new trip must be of equal or lesser value; if the new trip is more expensive, the difference must be paid.',
          'Additional date changes beyond the first, or changes requested with less than 60 days\' notice, are treated as cancellations and subject to the refund schedule above.',
        ],
      },
      {
        heading: 'Force Majeure',
        content: [
          'Quetzal Liveaboard shall not be liable for any failure or delay in performing its obligations where such failure or delay results from any cause beyond our reasonable control. Such causes include, but are not limited to: severe weather, hurricanes, tropical storms, natural disasters, earthquakes, volcanic activity, fire, flood, acts of war or terrorism, civil unrest, government actions or regulations, pandemics, epidemics, port closures, mechanical failure that cannot be repaired in time, or any other event beyond our direct control.',
          'In the event of a force majeure cancellation by Quetzal, guests will receive a credit toward a future trip equal to the amount paid, valid for 24 months from the original departure date. Refunds in force majeure situations are at our sole discretion and depend on the specific circumstances.',
        ],
      },
      {
        heading: 'Trip Insurance',
        content: [
          'We STRONGLY recommend that every guest purchase comprehensive travel insurance that includes trip cancellation, trip interruption, medical coverage, and emergency evacuation. Policies such as those offered by Dive Assure, DAN (Divers Alert Network), World Nomads, or similar providers can protect your investment against unforeseen circumstances.',
          'Trip insurance should be purchased at the time of booking to ensure coverage for pre-existing conditions and supplier financial default, where applicable.',
        ],
      },
      {
        heading: 'How to Cancel',
        content: [
          'All cancellations must be submitted in writing via email to info@quetzalliveaboard.com. The cancellation date is the date we receive your email, not the date you send it. Please include your reservation number and full name in the cancellation request.',
          'We will acknowledge receipt of your cancellation within 48 hours. If you do not receive an acknowledgment, please follow up — it is your responsibility to ensure we have received your notice.',
        ],
      },
      {
        heading: 'Refund Processing',
        content: [
          'Approved refunds will be processed within 14 business days of our acknowledgment of your cancellation. Refunds are issued to the original payment method. Depending on your bank or card issuer, it may take an additional 5–10 business days for the funds to appear in your account.',
          'Bank transfer and wire fees are non-refundable.',
        ],
      },
      {
        heading: 'Cancellation by Quetzal',
        content: [
          'We reserve the right to cancel any trip due to safety concerns, insufficient participation, mechanical issues, or any other reason that would compromise the quality or safety of the expedition. If Quetzal cancels a trip for reasons other than force majeure, guests will receive a full refund of all payments made, or the option to transfer to another departure at no additional cost.',
          'Quetzal is not responsible for expenses incurred in preparation for any canceled trip, such as airline tickets, hotel bookings, equipment purchases, or visa fees. This is another reason we emphasize the importance of trip insurance.',
        ],
      },
      {
        heading: 'EU Right of Withdrawal',
        content: [
          'If you are a consumer residing in the European Union and you booked your expedition entirely online (distance contract), you may have a statutory right to withdraw from the contract within 14 days of booking without giving any reason, in accordance with EU consumer protection law (Directive 2011/83/EU).',
          'However, this right does NOT apply if your expedition departure date falls within the 14-day withdrawal period, as travel services with a specific date are exempt. Additionally, once services have been fully performed, the right of withdrawal expires.',
          'To exercise your right of withdrawal, contact us in writing at info@quetzalliveaboard.com within 14 days of your booking. If eligible, we will refund all payments within 14 days of receiving your withdrawal notice.',
        ],
      },
      {
        heading: 'Contact',
        content: [
          'For cancellation requests or questions about this policy:',
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
    title: 'Política de Cancelación y Reembolso',
    lastUpdated: '15 de julio de 2026',
    sections: [
      {
        heading: 'Visión General',
        content: [
          'Entendemos que los planes pueden cambiar. Nuestra política de cancelación está diseñada para ser justa tanto con nuestros huéspedes como con nuestra operación, reconociendo que las cancelaciones tardías nos dejan con opciones limitadas para ocupar los espacios vacantes. Los siguientes términos aplican a todas las reservas, salvo que un acuerdo por escrito por separado establezca lo contrario.',
        ],
      },
      {
        heading: 'Cancelación por el Huésped — Tabla de Reembolsos',
        content: [
          'Si necesitas cancelar tu reserva, se aplica la siguiente tabla de reembolsos según la fecha en que recibamos tu notificación de cancelación por escrito:',
        ],
        list: [
          '90 días o más antes de la salida: Reembolso completo menos una tarifa administrativa de $250 USD por persona.',
          '60 a 89 días antes de la salida: Reembolso del 50% del costo total del viaje.',
          '30 a 59 días antes de la salida: Reembolso del 25% del costo total del viaje.',
          'Menos de 30 días antes de la salida: Sin reembolso.',
        ],
      },
      {
        heading: 'Cambios de Fecha',
        content: [
          'Entendemos que a veces surgen conflictos de agenda. Se permite un cambio de fecha gratuito a otra salida disponible dentro del mismo año calendario, siempre que nos notifiques por escrito con al menos 60 días de anticipación a tu fecha de salida original. El nuevo viaje debe ser de valor igual o menor; si el nuevo viaje es más costoso, deberás pagar la diferencia.',
          'Los cambios de fecha adicionales más allá del primero, o los cambios solicitados con menos de 60 días de aviso, se tratan como cancelaciones y están sujetos a la tabla de reembolsos anterior.',
        ],
      },
      {
        heading: 'Fuerza Mayor',
        content: [
          'Quetzal Liveaboard no será responsable por ningún incumplimiento o demora en el cumplimiento de sus obligaciones cuando dicho incumplimiento o demora resulte de cualquier causa fuera de nuestro control razonable. Dichas causas incluyen, pero no se limitan a: clima severo, huracanes, tormentas tropicales, desastres naturales, terremotos, actividad volcánica, incendios, inundaciones, actos de guerra o terrorismo, disturbios civiles, acciones o regulaciones gubernamentales, pandemias, epidemias, cierres de puertos, fallas mecánicas que no puedan repararse a tiempo, o cualquier otro evento fuera de nuestro control directo.',
          'En caso de cancelación por fuerza mayor por parte de Quetzal, los huéspedes recibirán un crédito para un viaje futuro equivalente al monto pagado, válido por 24 meses a partir de la fecha de salida original. Los reembolsos en situaciones de fuerza mayor quedan a nuestra entera discreción y dependen de las circunstancias específicas.',
        ],
      },
      {
        heading: 'Seguro de Viaje',
        content: [
          'Recomendamos ENFÁTICAMENTE que cada huésped contrate un seguro de viaje integral que incluya cancelación de viaje, interrupción de viaje, cobertura médica y evacuación de emergencia. Pólizas como las ofrecidas por Dive Assure, DAN (Divers Alert Network), World Nomads o proveedores similares pueden proteger tu inversión ante circunstancias imprevistas.',
          'El seguro de viaje debe contratarse al momento de la reserva para asegurar cobertura de condiciones preexistentes e incumplimiento financiero del proveedor, cuando corresponda.',
        ],
      },
      {
        heading: 'Cómo Cancelar',
        content: [
          'Todas las cancelaciones deben enviarse por escrito por correo electrónico a info@quetzalliveaboard.com. La fecha de cancelación es la fecha en que recibimos tu correo, no la fecha en que lo enviaste. Por favor incluye tu número de reserva y nombre completo en la solicitud de cancelación.',
          'Acusaremos recibo de tu cancelación dentro de las 48 horas. Si no recibes una confirmación, por favor haznos seguimiento — es tu responsabilidad asegurarte de que hayamos recibido tu notificación.',
        ],
      },
      {
        heading: 'Procesamiento de Reembolsos',
        content: [
          'Los reembolsos aprobados se procesarán dentro de los 14 días hábiles posteriores a nuestro acuse de recibo de tu cancelación. Los reembolsos se emiten al método de pago original. Dependiendo de tu banco o emisor de tarjeta, puede tomar de 5 a 10 días hábiles adicionales para que los fondos aparezcan en tu cuenta.',
          'Las comisiones por transferencia bancaria no son reembolsables.',
        ],
      },
      {
        heading: 'Cancelación por Quetzal',
        content: [
          'Nos reservamos el derecho de cancelar cualquier viaje por razones de seguridad, participación insuficiente, problemas mecánicos o cualquier otra razón que comprometa la calidad o seguridad de la expedición. Si Quetzal cancela un viaje por razones distintas a fuerza mayor, los huéspedes recibirán un reembolso completo de todos los pagos realizados, o la opción de transferirse a otra salida sin costo adicional.',
          'Quetzal no es responsable por gastos incurridos en preparación de cualquier viaje cancelado, como boletos de avión, reservas de hotel, compras de equipo o tarifas de visa. Esta es otra razón por la que enfatizamos la importancia del seguro de viaje.',
        ],
      },
      {
        heading: 'Derecho de Desistimiento (UE)',
        content: [
          'Si sos un consumidor residente en la Unión Europea y reservaste tu expedición completamente en línea (contrato a distancia), podés tener el derecho legal de desistir del contrato dentro de los 14 días posteriores a la reserva sin necesidad de justificación, conforme a la legislación de protección al consumidor de la UE (Directiva 2011/83/UE).',
          'Sin embargo, este derecho NO aplica si la fecha de salida de tu expedición cae dentro del período de desistimiento de 14 días, ya que los servicios de viaje con una fecha específica están exentos. Además, una vez que los servicios se hayan realizado completamente, el derecho de desistimiento expira.',
          'Para ejercer tu derecho de desistimiento, contactanos por escrito en info@quetzalliveaboard.com dentro de los 14 días posteriores a tu reserva. Si corresponde, reembolsaremos todos los pagos dentro de los 14 días posteriores a la recepción de tu notificación de desistimiento.',
        ],
      },
      {
        heading: 'Contacto',
        content: [
          'Para solicitudes de cancelación o preguntas sobre esta política:',
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
