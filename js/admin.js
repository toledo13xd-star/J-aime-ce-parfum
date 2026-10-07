/**
 * ====================================================================
 * PANEL DE ADMINISTRACIÓN — GESTOR DE PRECIOS Y CONFIGURACIÓN
 * ====================================================================
 */
(function () {
  "use strict";

  // Estado
  let config = typeof obtenerConfigTienda === "function" ? obtenerConfigTienda() : TIENDA_CONFIG;
  let productos = typeof obtenerPerfumes === "function" ? obtenerPerfumes() : (window.PERFUMES_BASE || []);

  const AUTH_KEY = "admin_auth_logged_in";

  // Elementos DOM de Login
  const $loginScreen = document.getElementById("login-screen");
  const $loginForm = document.getElementById("login-form");
  const $loginPin = document.getElementById("login-pin");
  const $loginError = document.getElementById("login-error");
  const $adminApp = document.getElementById("admin-app");
  const $btnLogout = document.getElementById("btn-logout");

  // Elementos DOM de Navegación
  const $navItems = document.querySelectorAll(".sidebar-nav .nav-item");
  const $sections = document.querySelectorAll(".admin-sec");

  // Elementos DOM de Precios
  const $tbody = document.getElementById("tbody-productos");
  const $search = document.getElementById("admin-search");
  const $brandFilter = document.getElementById("admin-brand-filter");
  const $btnGuardarTodos = document.getElementById("btn-guardar-todos");
  const $prodConteoSub = document.getElementById("prod-conteo-sub");

  // Modales
  const $btnNuevoProd = document.getElementById("btn-nuevo-producto");
  const $modalNuevo = document.getElementById("modal-nuevo");
  const $modalNuevoClose = document.getElementById("modal-nuevo-close");
  const $nuevoCancelar = document.getElementById("nuevo-cancelar");
  const $formNuevoProd = document.getElementById("form-nuevo-prod");

  const $btnAjusteMasivo = document.getElementById("btn-ajuste-masivo");
  const $modalMasivo = document.getElementById("modal-masivo");
  const $modalMasivoClose = document.getElementById("modal-masivo-close");
  const $masivoCancelar = document.getElementById("masivo-cancelar");
  const $formAjusteMasivo = document.getElementById("form-ajuste-masivo");

  // Configuración
  const $formConfig = document.getElementById("form-config");
  const $cfgNombre = document.getElementById("cfg-nombre");
  const $cfgWhatsapp = document.getElementById("cfg-whatsapp");
  const $cfgSlogan = document.getElementById("cfg-slogan");
  const $cfgSaludo = document.getElementById("cfg-saludo");
  const $cfgPin = document.getElementById("cfg-pin");

  // Exportar / Descargar
  const $btnDescargarData = document.getElementById("btn-descargar-data");
  const $btnDescargarConfig = document.getElementById("btn-descargar-config");
  const $btnRestaurarBase = document.getElementById("btn-restaurar-base");

  // Contenedor Toasts
  const $toasts = document.getElementById("toasts");

  // ─── Notificaciones Toast ──────────────────────────────────────
  function mostrarToast(mensaje, tipo = "success") {
    if (!$toasts) return;
    const toast = document.createElement("div");
    toast.className = `toast toast-${tipo}`;
    toast.textContent = mensaje;
    $toasts.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // ─── Autenticación con PIN ─────────────────────────────────────
  function verificarSesion() {
    if (sessionStorage.getItem(AUTH_KEY) === "true") {
      mostrarApp();
    }
  }

  function mostrarApp() {
    $loginScreen.hidden = true;
    $adminApp.hidden = false;
    cargarFormularioConfig();
    poblarFiltroCasas();
    renderTablaProductos();
  }

  $loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const pinIngresado = $loginPin.value.trim();
    const pinCorrecto = String(config.adminPin || "1234");

    if (pinIngresado === pinCorrecto) {
      sessionStorage.setItem(AUTH_KEY, "true");
      $loginError.hidden = true;
      mostrarApp();
    } else {
      $loginError.hidden = false;
      $loginPin.select();
    }
  });

  $btnLogout.addEventListener("click", () => {
    sessionStorage.removeItem(AUTH_KEY);
    window.location.reload();
  });

  // ─── Navegación entre Pestañas ──────────────────────────────────
  $navItems.forEach((btn) => {
    btn.addEventListener("click", () => {
      const secId = btn.dataset.sec;
      $navItems.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      $sections.forEach((sec) => {
        sec.hidden = sec.id !== `sec-${secId}`;
      });
    });
  });

  // ─── Utilidades ────────────────────────────────────────────────
  const normalizar = (texto) =>
    (texto || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  function escapeHTML(texto) {
    const div = document.createElement("div");
    div.textContent = texto || "";
    return div.innerHTML;
  }

  // ─── Renderizado de la Tabla de Productos ──────────────────────
  function poblarFiltroCasas() {
    const casas = [...new Set(productos.map((p) => p.casa))].sort((a, b) =>
      a.localeCompare(b, "es")
    );
    $brandFilter.innerHTML =
      '<option value="">Todas las marcas</option>' +
      casas.map((c) => `<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`).join("");
  }

  function productosFiltrados() {
    const q = normalizar($search.value.trim());
    const casa = $brandFilter.value;

    return productos.filter((p) => {
      const coincideQ =
        !q || normalizar(p.nombre).includes(q) || normalizar(p.casa).includes(q);
      const coincideCasa = !casa || p.casa === casa;
      return coincideQ && coincideCasa;
    });
  }

  function renderTablaProductos() {
    const lista = productosFiltrados();
    $prodConteoSub.textContent = `Mostrando ${lista.length} de ${productos.length} perfumes en total`;

    $tbody.innerHTML = lista
      .map((p, idx) => {
        return `
        <tr data-id="${p.id}">
          <td style="color:var(--ink-faint); font-size:0.8rem;">${idx + 1}</td>
          <td><span class="badge-tag">${escapeHTML(p.casa)}</span></td>
          <td><strong>${escapeHTML(p.nombre)}</strong></td>
          <td class="num">
            <div class="price-input-wrap">
              <span>$</span>
              <input type="number" step="0.5" min="0" class="price-input" data-prod-id="${p.id}" value="${p.precio}" />
            </div>
          </td>
          <td style="text-align:center;">
            <button type="button" class="btn btn-ghost btn-sm btn-guardar-uno" data-prod-id="${p.id}" title="Guardar este precio">💾 Guardar</button>
            <button type="button" class="btn btn-ghost btn-sm btn-eliminar-uno" data-prod-id="${p.id}" style="color:var(--danger);" title="Eliminar perfume">🗑️</button>
          </td>
        </tr>`;
      })
      .join("");
  }

  // Búsqueda y Filtros
  $search.addEventListener("input", renderTablaProductos);
  $brandFilter.addEventListener("change", renderTablaProductos);

  // Marcar cambios en los inputs
  $tbody.addEventListener("input", (e) => {
    if (e.target.classList.contains("price-input")) {
      e.target.classList.add("is-changed");
    }
  });

  // Guardar individual o eliminar
  $tbody.addEventListener("click", (e) => {
    const btnGuardar = e.target.closest(".btn-guardar-uno");
    if (btnGuardar) {
      const id = btnGuardar.dataset.prodId;
      const input = $tbody.querySelector(`.price-input[data-prod-id="${id}"]`);
      if (!input) return;

      const nuevoPrecio = Number(input.value);
      if (isNaN(nuevoPrecio) || nuevoPrecio < 0) {
        mostrarToast("Ingresa un precio válido", "danger");
        return;
      }

      const prod = productos.find((p) => p.id === id);
      if (prod) {
        prod.precio = nuevoPrecio;
        guardarPerfumes(productos);
        input.classList.remove("is-changed");
        mostrarToast(`Precio de "${prod.nombre}" actualizado a $${nuevoPrecio}`);
      }
      return;
    }

    const btnEliminar = e.target.closest(".btn-eliminar-uno");
    if (btnEliminar) {
      const id = btnEliminar.dataset.prodId;
      const prod = productos.find((p) => p.id === id);
      if (prod && confirm(`¿Deseas eliminar "${prod.nombre}" de la lista?`)) {
        productos = productos.filter((p) => p.id !== id);
        guardarPerfumes(productos);
        poblarFiltroCasas();
        renderTablaProductos();
        mostrarToast(`"${prod.nombre}" eliminado`);
      }
    }
  });

  // Guardar todos los precios modificados
  $btnGuardarTodos.addEventListener("click", () => {
    const inputs = $tbody.querySelectorAll(".price-input");
    let actualizados = 0;

    inputs.forEach((input) => {
      const id = input.dataset.prodId;
      const nuevoPrecio = Number(input.value);
      const prod = productos.find((p) => p.id === id);

      if (prod && !isNaN(nuevoPrecio) && nuevoPrecio >= 0 && prod.precio !== nuevoPrecio) {
        prod.precio = nuevoPrecio;
        input.classList.remove("is-changed");
        actualizados++;
      }
    });

    guardarPerfumes(productos);
    mostrarToast(`Se guardaron los precios (${actualizados} modificados)`);
  });

  // ─── Modal Nuevo Producto ──────────────────────────────────────
  $btnNuevoProd.addEventListener("click", () => {
    $formNuevoProd.reset();
    $modalNuevo.hidden = false;
    document.getElementById("nuevo-casa").focus();
  });

  function cerrarModalNuevo() {
    $modalNuevo.hidden = true;
  }

  $modalNuevoClose.addEventListener("click", cerrarModalNuevo);
  $nuevoCancelar.addEventListener("click", cerrarModalNuevo);

  $formNuevoProd.addEventListener("submit", (e) => {
    e.preventDefault();
    const casa = document.getElementById("nuevo-casa").value.trim();
    const nombre = document.getElementById("nuevo-nombre").value.trim();
    const precio = Number(document.getElementById("nuevo-precio").value);

    if (!casa || !nombre || isNaN(precio) || precio <= 0) {
      mostrarToast("Completa todos los campos con valores válidos", "danger");
      return;
    }

    const nuevoId = "p" + String(productos.length + 1).padStart(3, "0");
    const nuevo = { id: nuevoId, casa, nombre, precio };

    productos.unshift(nuevo);
    guardarPerfumes(productos);
    poblarFiltroCasas();
    renderTablaProductos();
    cerrarModalNuevo();
    mostrarToast(`"${nombre}" agregado con éxito`);
  });

  // ─── Modal Ajuste Masivo ───────────────────────────────────────
  $btnAjusteMasivo.addEventListener("click", () => {
    $formAjusteMasivo.reset();
    $modalMasivo.hidden = false;
    document.getElementById("masivo-valor").focus();
  });

  function cerrarModalMasivo() {
    $modalMasivo.hidden = true;
  }

  $modalMasivoClose.addEventListener("click", cerrarModalMasivo);
  $masivoCancelar.addEventListener("click", cerrarModalMasivo);

  $formAjusteMasivo.addEventListener("submit", (e) => {
    e.preventDefault();
    const tipo = document.getElementById("masivo-tipo").value;
    const valor = Number(document.getElementById("masivo-valor").value);

    if (isNaN(valor) || valor <= 0) {
      mostrarToast("Ingresa un valor positivo válido", "danger");
      return;
    }

    if (!confirm(`¿Estás seguro de aplicar este ajuste a los ${productos.length} productos?`)) {
      return;
    }

    productos.forEach((p) => {
      let pActual = Number(p.precio) || 0;
      switch (tipo) {
        case "sumar":
          p.precio = Math.max(1, Math.round((pActual + valor) * 100) / 100);
          break;
        case "restar":
          p.precio = Math.max(1, Math.round((pActual - valor) * 100) / 100);
          break;
        case "porcentaje-mas":
          p.precio = Math.max(1, Math.round((pActual * (1 + valor / 100)) * 100) / 100);
          break;
        case "porcentaje-menos":
          p.precio = Math.max(1, Math.round((pActual * (1 - valor / 100)) * 100) / 100);
          break;
      }
    });

    guardarPerfumes(productos);
    renderTablaProductos();
    cerrarModalMasivo();
    mostrarToast("Ajuste masivo aplicado exitosamente a todos los productos");
  });

  // ─── Configuración de Tienda y WhatsApp ────────────────────────
  function cargarFormularioConfig() {
    config = typeof obtenerConfigTienda === "function" ? obtenerConfigTienda() : TIENDA_CONFIG;
    $cfgNombre.value = config.nombre || "";
    $cfgWhatsapp.value = config.whatsapp || "";
    $cfgSlogan.value = config.slogan || "";
    $cfgSaludo.value = config.whatsappSaludo || "";
    $cfgPin.value = config.adminPin || "1234";
  }

  $formConfig.addEventListener("submit", (e) => {
    e.preventDefault();
    const nueva = {
      nombre: $cfgNombre.value.trim(),
      whatsapp: $cfgWhatsapp.value.replace(/\D/g, ""),
      slogan: $cfgSlogan.value.trim(),
      whatsappSaludo: $cfgSaludo.value.trim(),
      adminPin: $cfgPin.value.trim() || "1234",
    };

    if (!nueva.nombre) {
      mostrarToast("El nombre de la tienda es obligatorio", "danger");
      return;
    }
    if (!nueva.whatsapp || nueva.whatsapp.length < 8) {
      mostrarToast("Ingresa un número de WhatsApp válido (con código de país)", "danger");
      return;
    }

    guardarConfigTienda(nueva);
    config = nueva;
    mostrarToast("Configuración y número de WhatsApp guardados");
  });

  // ─── Exportar / Descargar Archivos ─────────────────────────────
  function descargarArchivo(nombreArchivo, contenido, tipo = "application/javascript;charset=utf-8") {
    const blob = new Blob([contenido], { type: tipo });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Descargar data.js
  $btnDescargarData.addEventListener("click", () => {
    let out = `/**\n * CATÁLOGO DE PERFUMES (VENTA EXCLUSIVA AL DETAL)\n * Actualizado desde el Panel de Administración\n */\n\n`;
    out += `const PERFUMES_BASE = [\n`;
    productos.forEach((p) => {
      out += `  { id: "${p.id}", casa: ${JSON.stringify(p.casa)}, nombre: ${JSON.stringify(p.nombre)}, precio: ${p.precio} },\n`;
    });
    out += `];\n\n`;
    out += `const STORAGE_CATALOGO_KEY = "aura_perfumes_catalogo";\n\n`;
    out += `function obtenerPerfumes() {\n`;
    out += `  try {\n    const guardados = localStorage.getItem(STORAGE_CATALOGO_KEY);\n    if (guardados) {\n      const parsed = JSON.parse(guardados);\n      if (Array.isArray(parsed) && parsed.length > 0) return parsed;\n    }\n  } catch (e) {}\n`;
    out += `  return PERFUMES_BASE.map(function(p) { return Object.assign({}, p); });\n}\n\n`;
    out += `function guardarPerfumes(nuevaLista) {\n  try {\n    localStorage.setItem(STORAGE_CATALOGO_KEY, JSON.stringify(nuevaLista));\n    return true;\n  } catch (e) { return false; }\n}\n\n`;
    out += `function restaurarPerfumesOriginales() {\n  localStorage.removeItem(STORAGE_CATALOGO_KEY);\n  return PERFUMES_BASE.map(function(p) { return Object.assign({}, p); });\n}\n`;

    descargarArchivo("data.js", out);
    mostrarToast("Archivo data.js generado para descarga");
  });

  // Descargar config.js
  $btnDescargarConfig.addEventListener("click", () => {
    let out = `/**\n * CONFIGURACIÓN GENERAL DE LA TIENDA\n * Actualizado desde el Panel de Administración\n */\n\n`;
    out += `const TIENDA_CONFIG = {\n`;
    out += `  nombre: ${JSON.stringify(config.nombre)},\n`;
    out += `  slogan: ${JSON.stringify(config.slogan)},\n`;
    out += `  whatsapp: ${JSON.stringify(config.whatsapp)},\n`;
    out += `  whatsappSaludo: ${JSON.stringify(config.whatsappSaludo)},\n`;
    out += `  moneda: "$",\n`;
    out += `  adminPin: ${JSON.stringify(config.adminPin || "1234")},\n`;
    out += `};\n\n`;
    out += `function obtenerConfigTienda() {\n`;
    out += `  try {\n    const guardada = localStorage.getItem("tienda_configuracion");\n    if (guardada) return Object.assign({}, TIENDA_CONFIG, JSON.parse(guardada));\n  } catch (e) {}\n`;
    out += `  return TIENDA_CONFIG;\n}\n\n`;
    out += `function guardarConfigTienda(nuevaConfig) {\n  try {\n    const fusionada = Object.assign({}, obtenerConfigTienda(), nuevaConfig);\n    localStorage.setItem("tienda_configuracion", JSON.stringify(fusionada));\n    return true;\n  } catch (e) { return false; }\n}\n`;

    descargarArchivo("config.js", out);
    mostrarToast("Archivo config.js generado para descarga");
  });

  // Restaurar base
  $btnRestaurarBase.addEventListener("click", () => {
    if (confirm("¿Estás seguro de restaurar todos los precios a los valores iniciales de fábrica? Esto borrará tus modificaciones locales.")) {
      if (typeof restaurarPerfumesOriginales === "function") {
        productos = restaurarPerfumesOriginales();
      } else {
        localStorage.removeItem("aura_perfumes_catalogo");
        productos = (window.PERFUMES_BASE || []).map((p) => Object.assign({}, p));
      }
      poblarFiltroCasas();
      renderTablaProductos();
      mostrarToast("Precios restaurados a los originales");
    }
  });

  // Inicializar
  verificarSesion();
})();
