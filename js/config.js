/**
 * ====================================================================
 * CONFIGURACIÓN GENERAL DE LA TIENDA
 * ====================================================================
 * Puedes modificar tus datos directamente aquí, o cambiarlos
 * desde el Panel de Administración (admin.html).
 */

const TIENDA_CONFIG = {
  // Nombre de tu perfumería / tienda
  nombre: "J'aime Ce Parfum",

  // Subtítulo o eslogan
  slogan: "Catálogo Exclusivo · Perfumería Fina al Detal",

  // Tu número de WhatsApp con código de país (solo números, sin '+')
  // Ejemplo: Para Venezuela (código 58 y número 0412-1234567) -> "584121234567"
  // Ejemplo: Para Colombia -> "573001234567"
  // Ejemplo: Para México -> "521234567890"
  whatsapp: "584120000000",

  // Mensaje de saludo que acompañará el pedido enviado por WhatsApp
  whatsappSaludo: "¡Hola! Deseo realizar el siguiente pedido al detal:",

  // Símbolo de moneda
  moneda: "$",

  // Clave de acceso para el Panel de Administración (admin.html)
  adminPin: "1234",
};

// Carga configuración personalizada desde LocalStorage si existe
function obtenerConfigTienda() {
  try {
    const guardada = localStorage.getItem("tienda_configuracion");
    if (guardada) {
      return Object.assign({}, TIENDA_CONFIG, JSON.parse(guardada));
    }
  } catch (e) {
    console.error("Error al leer configuración:", e);
  }
  return TIENDA_CONFIG;
}

// Guarda la configuración en LocalStorage
function guardarConfigTienda(nuevaConfig) {
  try {
    const fusionada = Object.assign({}, obtenerConfigTienda(), nuevaConfig);
    localStorage.setItem("tienda_configuracion", JSON.stringify(fusionada));
    return true;
  } catch (e) {
    console.error("Error al guardar configuración:", e);
    return false;
  }
}
