/**
 * ====================================================================
 * AURA PERFUMES — LÓGICA DEL CATÁLOGO (VENTAS EXCLUSIVAS AL DETAL)
 * ====================================================================
 */
(function () {
  "use strict";

  // ─── Carga de Configuración y Productos ────────────────────────
  const config = typeof obtenerConfigTienda === "function" ? obtenerConfigTienda() : {
    nombre: "Aura Perfumes",
    slogan: "Catálogo Exclusivo · Perfumería Fina al Detal",
    whatsapp: "584120000000",
    whatsappSaludo: "¡Hola! Deseo realizar el siguiente pedido al detal:",
    moneda: "$"
  };

  const listaInicial = typeof obtenerPerfumes === "function" ? obtenerPerfumes() : (window.PERFUMES_BASE || []);

  // ─── Estado de la aplicación ───────────────────────────────────
  const state = {
    productos: listaInicial,
    busqueda: "",
    casa: "",
    orden: "casa",
    pagina: 1,
    carrito: cargarCarrito(),
  };

  const POR_PAGINA = 24;
  const CART_KEY = "aura_perfumes_carrito";
  const CHIP_COUNT = 10;

  // Degradados elegantes en tonos vino para las tarjetas
  const GRADIENTS = [
    ["#722f37", "#a4626c"],
    ["#46161e", "#8c4a55"],
    ["#8a3a45", "#c9909a"],
    ["#5a2630", "#9c6b78"],
    ["#93404b", "#d0a0a8"],
    ["#3c1a21", "#7a4a52"],
    ["#6b3540", "#b07884"],
    ["#7e2d3a", "#bd8890"],
  ];

  // ─── Referencias al DOM ────────────────────────────────────────
  const $grid = document.getElementById("product-grid");
  const $search = document.getElementById("search-input");
  const $searchClear = document.getElementById("search-clear");
  const $brandSelect = document.getElementById("brand-select");
  const $sortSelect = document.getElementById("sort-select");
  const $chips = document.getElementById("brand-chips");
  const $count = document.getElementById("results-count");
  const $empty = document.getElementById("empty-state");
  const $reset = document.getElementById("reset-filters");
  const $pagination = document.getElementById("pagination");
  const $catalog = document.querySelector(".catalog");

  // Carrito y WhatsApp
  const $cartFab = document.getElementById("cart-fab");
  const $cartCount = document.getElementById("cart-count");
  const $cartOverlay = document.getElementById("cart-overlay");
  const $cartDrawer = document.getElementById("cart-drawer");
  const $cartClose = document.getElementById("cart-close");
  const $cartItems = document.getElementById("cart-items");
  const $cartEmpty = document.getElementById("cart-empty");
  const $cartFoot = document.getElementById("cart-foot");
  const $cartTotal = document.getElementById("cart-total");
  const $cartWhatsapp = document.getElementById("cart-whatsapp");
  const $cartCopy = document.getElementById("cart-copy");
  const $cartClear = document.getElementById("cart-clear");
  const $cartNombre = document.getElementById("cart-nombre");
  const $cartTelefono = document.getElementById("cart-telefono");
  const $cartDatosError = document.getElementById("cart-datos-error");

  // ─── Utilidades ────────────────────────────────────────────────
  const normalizar = (texto) =>
    (texto || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const formatearPrecio = (valor) => {
    const num = Number(valor) || 0;
    return `${config.moneda || "$"}${num % 1 === 0 ? num : num.toFixed(2)}`;
  };

  function escapeHTML(texto) {
    const div = document.createElement("div");
    div.textContent = texto || "";
    return div.innerHTML;
  }

  function gradientePara(casa) {
    let hash = 0;
    const str = casa || "Perfume";
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    }
    const [a, b] = GRADIENTS[hash % GRADIENTS.length];
    return `linear-gradient(135deg, ${a}, ${b})`;
  }

  // ─── Carrito Local ─────────────────────────────────────────────
  function cargarCarrito() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
      return [];
    }
  }

  function guardarCarrito() {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(state.carrito));
    } catch (e) {
      console.warn("Error guardando carrito:", e);
    }
  }

  const buscarProducto = (id) => state.productos.find((p) => p.id === id);

  function totalCarrito() {
    return state.carrito.reduce((acc, it) => {
      const p = buscarProducto(it.id);
      return p ? acc + (Number(p.precio) || 0) * it.cantidad : acc;
    }, 0);
  }

  function unidadesCarrito() {
    return state.carrito.reduce((acc, it) => acc + it.cantidad, 0);
  }

  function agregarAlCarrito(id) {
    const item = state.carrito.find((it) => it.id === id);
    if (item) {
      item.cantidad += 1;
    } else {
      state.carrito.push({ id, cantidad: 1 });
    }
    guardarCarrito();
    renderProductos();
    renderCarrito();
    return true;
  }

  function cambiarCantidad(id, delta) {
    const item = state.carrito.find((it) => it.id === id);
    if (!item) return;
    item.cantidad += delta;
    if (item.cantidad <= 0) {
      state.carrito = state.carrito.filter((it) => it.id !== id);
    }
    guardarCarrito();
    renderProductos();
    renderCarrito();
  }

  function vaciarCarrito() {
    state.carrito = [];
    guardarCarrito();
    renderProductos();
    renderCarrito();
  }

  // ─── Render Carrito ────────────────────────────────────────────
  function renderCarrito() {
    const totalUnidades = unidadesCarrito();
    if ($cartCount) {
      $cartCount.textContent = totalUnidades;
      $cartCount.hidden = totalUnidades === 0;
    }

    const estaVacio = state.carrito.length === 0;
    if ($cartEmpty) $cartEmpty.hidden = !estaVacio;
    if ($cartFoot) $cartFoot.hidden = estaVacio;

    if ($cartItems) {
      $cartItems.innerHTML = state.carrito
        .map((it) => {
          const p = buscarProducto(it.id);
          if (!p) return "";
          const subtotal = (Number(p.precio) || 0) * it.cantidad;
          return `
          <div class="cart-item">
            <div class="cart-item-info">
              <p class="cart-item-name">${escapeHTML(p.nombre)}</p>
              <p class="cart-item-brand">${escapeHTML(p.casa)} · ${formatearPrecio(p.precio)} c/u</p>
            </div>
            <div class="cart-item-qty">
              <button type="button" data-dec="${p.id}" aria-label="Menos">−</button>
              <span>${it.cantidad}</span>
              <button type="button" data-inc="${p.id}" aria-label="Más">+</button>
            </div>
            <span class="cart-item-sub">${formatearPrecio(subtotal)}</span>
          </div>`;
        })
        .join("");
    }

    if ($cartTotal) {
      $cartTotal.textContent = formatearPrecio(totalCarrito());
    }
  }

  function textoPedido() {
    const lineas = state.carrito.map((it) => {
      const p = buscarProducto(it.id);
      if (!p) return "";
      const subtotal = (Number(p.precio) || 0) * it.cantidad;
      return `• ${it.cantidad}x ${p.nombre} (${p.casa}) — ${formatearPrecio(subtotal)}`;
    });

    const nombreCliente = $cartNombre ? $cartNombre.value.trim() : "";
    const telCliente = $cartTelefono ? $cartTelefono.value.trim() : "";

    let texto = `*${config.whatsappSaludo || "Pedido"}*\n`;
    texto += `*Tienda:* ${config.nombre}\n`;
    texto += `(Venta exclusiva al detal)\n\n`;
    texto += lineas.join("\n");
    texto += `\n\n*Total a pagar: ${formatearPrecio(totalCarrito())}*`;

    if (nombreCliente || telCliente) {
      texto += `\n\n*Datos del cliente:*`;
      if (nombreCliente) texto += `\n👤 Nombre: ${nombreCliente}`;
      if (telCliente) texto += `\n📱 Teléfono: ${telCliente}`;
    }

    return texto;
  }

  function abrirCarrito() {
    if (!$cartDrawer || !$cartOverlay) return;
    $cartDrawer.hidden = false;
    $cartOverlay.hidden = false;
    requestAnimationFrame(() => {
      $cartDrawer.classList.add("is-open");
      $cartOverlay.classList.add("is-open");
    });
  }

  function cerrarCarrito() {
    if (!$cartDrawer || !$cartOverlay) return;
    $cartDrawer.classList.remove("is-open");
    $cartOverlay.classList.remove("is-open");
    setTimeout(() => {
      $cartDrawer.hidden = true;
      $cartOverlay.hidden = true;
    }, 280);
  }

  // ─── Filtrado y Orden ──────────────────────────────────────────
  function productosFiltrados() {
    const q = normalizar(state.busqueda.trim());

    let lista = state.productos.filter((p) => {
      const coincideBusqueda =
        !q ||
        normalizar(p.nombre).includes(q) ||
        normalizar(p.casa).includes(q);
      const coincideCasa = !state.casa || p.casa === state.casa;
      return coincideBusqueda && coincideCasa;
    });

    const porNombre = (a, b) => a.nombre.localeCompare(b.nombre, "es");
    switch (state.orden) {
      case "nombre":
        lista.sort(porNombre);
        break;
      case "precio-asc":
        lista.sort((a, b) => (Number(a.precio) || 0) - (Number(b.precio) || 0) || porNombre(a, b));
        break;
      case "precio-desc":
        lista.sort((a, b) => (Number(b.precio) || 0) - (Number(a.precio) || 0) || porNombre(a, b));
        break;
      default:
        lista.sort((a, b) => a.casa.localeCompare(b.casa, "es") || porNombre(a, b));
    }
    return lista;
  }

  // ─── Tarjeta de Producto (SOLO AL DETAL) ────────────────────────
  function tarjetaHTML(p, i) {
    const imagen = p.imagen
      ? `<img src="${escapeHTML(p.imagen)}" alt="${escapeHTML(p.nombre)}" loading="lazy" />`
      : `<span class="card-monogram">${escapeHTML(p.nombre.charAt(0))}</span>`;

    const enItem = state.carrito.find((it) => it.id === p.id);
    const enCarrito = !!enItem;

    return `
      <article class="product-card" style="animation-delay:${Math.min(i * 20, 350)}ms">
        <div class="card-visual" style="background:${gradientePara(p.casa)}">
          ${imagen}
        </div>
        <div class="card-body">
          <div class="card-brand-row">
            <p class="card-brand">${escapeHTML(p.casa)}</p>
          </div>
          <h3 class="card-name">${escapeHTML(p.nombre)}</h3>
          <div class="card-footer">
            <div>
              <span class="card-price-label">Precio al detal</span>
              <span class="card-price">${formatearPrecio(p.precio)}</span>
            </div>
          </div>
          <button type="button" class="card-add ${enCarrito ? "is-added" : ""}" data-add="${p.id}">
            ${enCarrito ? `Agregado ✓ (${enItem.cantidad})` : "Agregar al pedido"}
          </button>
        </div>
      </article>`;
  }

  function renderProductos() {
    if (!$grid) return;
    const lista = productosFiltrados();
    const totalPaginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
    if (state.pagina > totalPaginas) state.pagina = totalPaginas;

    if ($count) {
      $count.innerHTML = `<strong>${lista.length}</strong> ${
        lista.length === 1 ? "perfume" : "perfumes"
      }`;
    }
    if ($empty) $empty.hidden = lista.length > 0;

    const inicio = (state.pagina - 1) * POR_PAGINA;
    const pagina = lista.slice(inicio, inicio + POR_PAGINA);
    $grid.innerHTML = pagina.map((p, i) => tarjetaHTML(p, i)).join("");

    renderPaginacion(totalPaginas);
  }

  function renderPaginacion(totalPaginas) {
    if (!$pagination) return;
    if (totalPaginas <= 1) {
      $pagination.innerHTML = "";
      $pagination.hidden = true;
      return;
    }
    $pagination.hidden = false;
    const actual = state.pagina;

    const paginas = [];
    const rango = 1;
    for (let p = 1; p <= totalPaginas; p++) {
      if (p === 1 || p === totalPaginas || (p >= actual - rango && p <= actual + rango)) {
        paginas.push(p);
      } else if (paginas[paginas.length - 1] !== "…") {
        paginas.push("…");
      }
    }

    const btn = (p) =>
      p === "…"
        ? `<span class="page-ellipsis">…</span>`
        : `<button type="button" class="page-num ${p === actual ? "is-active" : ""}" data-page="${p}">${p}</button>`;

    $pagination.innerHTML = `
      <button type="button" class="page-arrow" data-page="${actual - 1}" ${actual === 1 ? "disabled" : ""} aria-label="Anterior">‹</button>
      ${paginas.map(btn).join("")}
      <button type="button" class="page-arrow" data-page="${actual + 1}" ${actual === totalPaginas ? "disabled" : ""} aria-label="Siguiente">›</button>
    `;
  }

  function irAPagina(p) {
    state.pagina = p;
    renderProductos();
    if ($catalog) {
      const y = $catalog.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }

  function renderFiltros() {
    if (!$brandSelect || !$chips) return;
    const casas = [...new Set(state.productos.map((p) => p.casa))].sort((a, b) =>
      a.localeCompare(b, "es")
    );

    $brandSelect.innerHTML =
      '<option value="">Todas las casas</option>' +
      casas
        .map((c) => `<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`)
        .join("");
    $brandSelect.value = state.casa;

    const conteo = {};
    state.productos.forEach((p) => (conteo[p.casa] = (conteo[p.casa] || 0) + 1));
    const destacadas = casas
      .slice()
      .sort((a, b) => conteo[b] - conteo[a])
      .slice(0, CHIP_COUNT);

    $chips.innerHTML =
      `<button type="button" class="chip ${!state.casa ? "is-active" : ""}" data-casa="">Todas</button>` +
      destacadas
        .map(
          (c) =>
            `<button type="button" class="chip ${state.casa === c ? "is-active" : ""}" data-casa="${escapeHTML(c)}">${escapeHTML(c)}</button>`
        )
        .join("");
  }

  function render() {
    renderFiltros();
    renderProductos();
    renderCarrito();
  }

  // ─── Eventos ───────────────────────────────────────────────────
  if ($grid) {
    $grid.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-add]");
      if (!btn) return;
      agregarAlCarrito(btn.dataset.add);
      btn.classList.add("just-added");
      setTimeout(() => btn.classList.remove("just-added"), 500);
    });
  }

  if ($cartFab) $cartFab.addEventListener("click", abrirCarrito);
  if ($cartClose) $cartClose.addEventListener("click", cerrarCarrito);
  if ($cartOverlay) $cartOverlay.addEventListener("click", cerrarCarrito);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && $cartDrawer && !$cartDrawer.hidden) cerrarCarrito();
  });

  if ($cartItems) {
    $cartItems.addEventListener("click", (e) => {
      const inc = e.target.closest("[data-inc]");
      const dec = e.target.closest("[data-dec]");
      if (inc) cambiarCantidad(inc.dataset.inc, 1);
      else if (dec) cambiarCantidad(dec.dataset.dec, -1);
    });
  }

  if ($cartClear) {
    $cartClear.addEventListener("click", () => {
      if (state.carrito.length && confirm("¿Deseas vaciar todo el pedido?")) {
        vaciarCarrito();
      }
    });
  }

  // Validación de datos del cliente
  function validarDatosCliente() {
    if (!$cartNombre || !$cartTelefono) return true;
    const nombreOk = $cartNombre.value.trim().length >= 2;
    const telOk = $cartTelefono.value.replace(/\D/g, "").length >= 7;

    $cartNombre.classList.toggle("input-error", !nombreOk);
    $cartTelefono.classList.toggle("input-error", !telOk);
    if ($cartDatosError) $cartDatosError.hidden = nombreOk && telOk;

    if (!nombreOk) $cartNombre.focus();
    else if (!telOk) $cartTelefono.focus();
    return nombreOk && telOk;
  }

  if ($cartNombre) {
    $cartNombre.addEventListener("input", () => {
      $cartNombre.classList.remove("input-error");
      if ($cartDatosError) $cartDatosError.hidden = true;
    });
  }

  if ($cartTelefono) {
    $cartTelefono.addEventListener("input", () => {
      $cartTelefono.classList.remove("input-error");
      if ($cartDatosError) $cartDatosError.hidden = true;
    });
  }

  // Envío a WhatsApp
  if ($cartWhatsapp) {
    $cartWhatsapp.addEventListener("click", () => {
      if (!state.carrito.length) return;
      if (!validarDatosCliente()) return;

      const numWa = (config.whatsapp || "").replace(/\D/g, "");
      const mensaje = textoPedido();
      const url = `https://wa.me/${numWa}?text=${encodeURIComponent(mensaje)}`;
      window.open(url, "_blank");
    });
  }

  // Copiar lista del pedido
  if ($cartCopy) {
    $cartCopy.addEventListener("click", async (e) => {
      if (!state.carrito.length) return;
      const btn = e.currentTarget;
      const original = btn.innerHTML;
      const texto = textoPedido();

      try {
        await navigator.clipboard.writeText(texto);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = texto;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }

      btn.innerHTML = "Lista copiada ✓";
      btn.classList.add("copied");
      setTimeout(() => {
        btn.innerHTML = original;
        btn.classList.remove("copied");
      }, 1800);
    });
  }

  // Búsqueda
  if ($search) {
    $search.addEventListener("input", () => {
      state.busqueda = $search.value;
      state.pagina = 1;
      if ($searchClear) $searchClear.hidden = !$search.value;
      renderProductos();
    });
  }

  if ($searchClear) {
    $searchClear.addEventListener("click", () => {
      $search.value = "";
      state.busqueda = "";
      state.pagina = 1;
      $searchClear.hidden = true;
      $search.focus();
      renderProductos();
    });
  }

  // Filtros
  if ($brandSelect) {
    $brandSelect.addEventListener("change", () => {
      state.casa = $brandSelect.value;
      state.pagina = 1;
      render();
    });
  }

  if ($sortSelect) {
    $sortSelect.addEventListener("change", () => {
      state.orden = $sortSelect.value;
      state.pagina = 1;
      renderProductos();
    });
  }

  if ($chips) {
    $chips.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      state.casa = chip.dataset.casa;
      state.pagina = 1;
      render();
    });
  }

  if ($reset) {
    $reset.addEventListener("click", () => {
      state.busqueda = "";
      state.casa = "";
      state.pagina = 1;
      if ($search) $search.value = "";
      if ($searchClear) $searchClear.hidden = true;
      render();
    });
  }

  // Paginación
  if ($pagination) {
    $pagination.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-page]");
      if (!btn || btn.disabled) return;
      const p = Number(btn.dataset.page);
      if (p && p !== state.pagina) irAPagina(p);
    });
  }

  // Año actual en el footer
  const $year = document.getElementById("year");
  if ($year) $year.textContent = new Date().getFullYear();

  // Actualizar enlaces de WhatsApp directos en la página
  const numWa = (config.whatsapp || "").replace(/\D/g, "");
  const waDirectUrl = `https://wa.me/${numWa}?text=${encodeURIComponent("¡Hola! Me gustaría consultar sobre sus perfumes disponibles.")}`;

  const $headerWa = document.getElementById("header-whatsapp-btn");
  if ($headerWa) $headerWa.href = waDirectUrl;

  const $floatWa = document.getElementById("wa-floating-btn");
  if ($floatWa) $floatWa.href = waDirectUrl;

  // Actualizar nombres comerciales dinámicamente si están presentes
  document.querySelectorAll(".dyn-brand-name").forEach((el) => {
    el.textContent = config.nombre;
  });

  // Inicializar render
  render();
})();
