/* Configuración del sitio. Lo único que se edita para publicar.
   Los 3 datos del propietario los entrega Juan; mientras estén vacíos la página se adapta sola
   (sin botón de WhatsApp, y los textos usan "el propietario"). */
window.UPCFG = {
  // Datos del propietario (Juan, 16-oct-2026)
  whatsapp_papa: "573183648833",   // solo dígitos con indicativo, ej. 573001112233
  nombre_papa: "William Salazar",     // nombre completo del propietario y responsable de datos
  correo_venta: "wisama1@hotmail.com",    // correo de la venta (derechos de datos)

  // Meta Pixel (dataset en finan.taxi, creado el 16-oct-2026)
  pixel_id: "2694679924367626",

  // PDFs
  memo_pdf: "assets/presentacion-edificio.pdf",
  kit_pdf: "assets/kit-referidoras.pdf",

  // Google Form (fuente: landing/form-config.json, creado el 2026-10-16)
  form: {
    action: "https://docs.google.com/forms/d/e/1FAIpQLSeishRarW8sV0lmbv89J7MfV29sZC3qBfT1NBt6f-xlXt5lLA/formResponse",
    pageHistory: "",   // formulario de 1 sola sección: no se necesita
    entries: {
      nombre: "entry.1940087286",
      celular: "entry.1447406478",
      correo: "entry.261662196",
      compra: "entry.253908373",
      plazo: "entry.163104233",
      perfil: "entry.337715184",
      autorizacion: "entry.1648830687",
      origen: "entry.323015153"
    },
    autorizacion_valor: "Autorizo el tratamiento de mis datos para esta venta",
    // Debe coincidir con la obligatoriedad del Google Form (origen no es obligatorio)
    required: { nombre: true, celular: true, correo: true, compra: true, plazo: true, perfil: true, autorizacion: true, origen: false }
  }
};
