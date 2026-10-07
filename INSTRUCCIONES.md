# 🌸 Tienda de Perfumes Digital (Venta al Detal)

¡Tu réplica personalizada del catálogo ya está lista! Está optimizada exclusivamente para **ventas al detal**, con diseño de lujo, carrito de pedidos para WhatsApp y un **Panel de Administración integrado** para modificar los precios de cada perfume y tu número de teléfono.

---

## 📁 Estructura del Proyecto

- 🌐 [**index.html**](file:///c:/Users/Porras%20Lugo%20Karleidy/Downloads/Nueva%20carpeta%20(2)/index.html): La página web de la tienda que ven tus clientes.
- ⚙️ [**admin.html**](file:///c:/Users/Porras%20Lugo%20Karleidy/Downloads/Nueva%20carpeta%20(2)/admin.html): Panel para editar precios, cambiar tu número de WhatsApp y nombre de la tienda.
- 📂 **css/**:
  - [**styles.css**](file:///c:/Users/Porras%20Lugo%20Karleidy/Downloads/Nueva%20carpeta%20(2)/css/styles.css): Estilos visuales de lujo de la tienda.
  - [**admin.css**](file:///c:/Users/Porras%20Lugo%20Karleidy/Downloads/Nueva%20carpeta%20(2)/css/admin.css): Estilos del panel de control.
- 📂 **js/**:
  - [**config.js**](file:///c:/Users/Porras%20Lugo%20Karleidy/Downloads/Nueva%20carpeta%20(2)/js/config.js): Configuración general (nombre, WhatsApp, eslogan).
  - [**data.js**](file:///c:/Users/Porras%20Lugo%20Karleidy/Downloads/Nueva%20carpeta%20(2)/js/data.js): Base de datos con los 260 perfumes y sus precios al detal.
  - [**app.js**](file:///c:/Users/Porras%20Lugo%20Karleidy/Downloads/Nueva%20carpeta%20(2)/js/app.js): Lógica de la tienda, búsqueda, carrito y pedidos.
  - [**admin.js**](file:///c:/Users/Porras%20Lugo%20Karleidy/Downloads/Nueva%20carpeta%20(2)/js/admin.js): Lógica del panel de administración.

---

## 🚀 ¿Cómo usar la tienda?

### 1. Ver la tienda
Haz doble clic en [**index.html**](file:///c:/Users/Porras%20Lugo%20Karleidy/Downloads/Nueva%20carpeta%20(2)/index.html) para abrirla en cualquier navegador (Google Chrome, Edge, etc.).

### 2. Modificar precios y tu teléfono (Método Visual - Más Fácil)
1. Abre [**admin.html**](file:///c:/Users/Porras%20Lugo%20Karleidy/Downloads/Nueva%20carpeta%20(2)/admin.html).
2. Ingresa el PIN por defecto: `1234`.
3. **Modificar Precios**:
   - En la pestaña **Modificar Precios**, busca cualquier perfume por nombre o marca.
   - Cambia el número en la casilla de precio y haz clic en **💾 Guardar** (o cambia varios y pulsa **Guardar Todos los Precios**).
   - También puedes pulsar **⚡ Ajuste Masivo** para sumar/restar un monto o porcentaje a todos los perfumes a la vez.
4. **Colocar tu número de WhatsApp y nombre**:
   - Ve a la pestaña **WhatsApp y Tienda**.
   - Coloca tu número de teléfono con código de país (ejemplo Venezuela: `584121234567`).
   - Cambia el nombre de la tienda si deseas otro.
   - Pulsa **Guardar Configuración**.
5. **Hacer permanentes los cambios para internet**:
   - Ve a la pestaña **Descargar / Exportar**.
   - Pulsa **Descargar data.js** y **Descargar config.js**.
   - Guarda o reemplaza esos dos archivos dentro de la carpeta `js/`.

### 3. Modificar precios en el archivo directamente (Método Manual)
Si prefieres editar el archivo directamente con Bloc de Notas o cualquier editor de código:
- Abre [**js/data.js**](file:///c:/Users/Porras%20Lugo%20Karleidy/Downloads/Nueva%20carpeta%20(2)/js/data.js).
- Verás cada perfume con su precio:
  ```javascript
  { id: 'p001', casa: 'Afnan', nombre: '9 AM Dive', precio: 25 },
  ```
- Solo cambia el número del precio por el que tú desees y guarda el archivo.
- Para cambiar tu teléfono manualmente, abre [**js/config.js**](file:///c:/Users/Porras%20Lugo%20Karleidy/Downloads/Nueva%20carpeta%20(2)/js/config.js) y edita `whatsapp: "584120000000"`.
