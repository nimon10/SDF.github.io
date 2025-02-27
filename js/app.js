// ✅ Verificar si LocalStorage está disponible
function verificarLocalStorage() {
    if (typeof(Storage) !== "undefined") {
        console.log("LocalStorage disponible.");
    } else {
        console.error("Este navegador no soporta LocalStorage.");
    }
}

// ✅ Mostrar sección seleccionada
function mostrarSeccion(seccionId) {
    document.querySelectorAll(".seccion").forEach(seccion => seccion.style.display = "none");
    document.getElementById(seccionId).style.display = "block";
}

// ✅ Guardar y obtener ventas en LocalStorage
function guardarVenta(venta) {
    let ventas = JSON.parse(localStorage.getItem("ventas")) || [];
    ventas.push(venta);
    localStorage.setItem("ventas", JSON.stringify(ventas));
    console.log("Venta guardada:", venta);
}

function obtenerVentas() {
    return JSON.parse(localStorage.getItem("ventas")) || [];
}

// ✅ Mostrar ventas en la tabla
function mostrarVentas() {
    let ventas = obtenerVentas();
    let tabla = document.getElementById("tablaVentas");
    tabla.innerHTML = ventas.map(venta => `
        <tr>
            <td>${venta.cliente}</td>
            <td>${venta.contacto}</td>
            <td>${venta.vendedor}</td>
            <td>${venta.fecha}</td>
            <td>${venta.revista}</td>
            <td>${venta.estado}</td>
            <td>$${venta.valor.toFixed(2)}</td>
        </tr>
    `).join("");
}

// ✅ Buscar producto en inventario
function buscarProducto() {
    let input = document.getElementById("busquedaProducto").value.toLowerCase();
    let inventario = JSON.parse(localStorage.getItem("inventario")) || [];
    let producto = inventario.find(item => item.producto.toLowerCase() === input);

    let resultadoDiv = document.getElementById("resultadoBusqueda");
    if (producto) {
        resultadoDiv.innerHTML = `
            <p><strong>Revista:</strong> ${producto.revista}</p>
            <p><strong>Cantidad:</strong> ${producto.cantidad}</p>
            <p><strong>Precio de compra:</strong> $${producto.precio_compra}</p>
            <button onclick="realizarVenta('${producto.producto}', ${producto.precio_compra})">Realizar Venta</button>
        `;
    } else {
        resultadoDiv.innerHTML = "<p>Producto no encontrado.</p>";
    }
}

// ✅ Realizar venta directa
function realizarVenta(producto, precio) {
    let cliente = prompt("Ingrese el nombre del cliente:");
    let contacto = prompt("Ingrese el número de contacto:");
    if (!cliente || !contacto) return alert("Debe completar todos los campos.");

    let vendedor = "Gladys";
    let fecha = new Date().toISOString().split("T")[0];
    let estado = "Pendiente";

    let nuevaVenta = { cliente, contacto, vendedor, fecha, revista: producto, estado, valor: precio };
    guardarVenta(nuevaVenta);
    actualizarInventario(producto, 1);
    mostrarVentas();
}

// ✅ Realizar venta con descuento
function realizarVentaConDescuento(producto, precio) {
    let descuento = parseFloat(document.getElementById("descuento").value) || 0;
    let precioFinal = precio - descuento;
    if (precioFinal < 0) return alert("El descuento no puede ser mayor al precio.");

    let cliente = prompt("Ingrese el nombre del cliente:");
    let contacto = prompt("Ingrese el número de contacto:");
    if (!cliente || !contacto) return alert("Debe completar todos los campos.");

    let vendedor = "David";
    let fecha = new Date().toISOString().split("T")[0];
    let estado = "Pendiente";

    let nuevaVenta = { cliente, contacto, vendedor, fecha, revista: producto, estado, valor: precioFinal };
    guardarVenta(nuevaVenta);
    actualizarInventario(producto, 1);
    mostrarVentas();
}

// ✅ Agregar producto al inventario
function agregarInventario() {
    let revista = prompt("Ingrese la revista:");
    let nombre = document.getElementById("nombreProducto").value.trim();
    let cantidad = parseInt(document.getElementById("cantidadProducto").value);
    let precio = parseFloat(document.getElementById("precioProducto").value);

    if (!nombre || isNaN(cantidad) || isNaN(precio) || cantidad <= 0 || precio <= 0) {
        return alert("Debe ingresar valores válidos.");
    }

    let inventario = JSON.parse(localStorage.getItem("inventario")) || [];
    inventario.push({ revista, producto: nombre, cantidad, precio_compra: precio });
    localStorage.setItem("inventario", JSON.stringify(inventario));

    mostrarInventario();
}

// ✅ Mostrar inventario
function mostrarInventario() {
    let inventario = JSON.parse(localStorage.getItem("inventario")) || [];
    let tabla = document.getElementById("tablaInventario");
    tabla.innerHTML = inventario.map(item => `
        <tr>
            <td>${item.revista}</td>
            <td>${item.producto}</td>
            <td>${item.cantidad}</td>
            <td>$${item.precio_compra.toFixed(2)}</td>
        </tr>
    `).join("");
}

// ✅ Actualizar inventario tras una venta
function actualizarInventario(producto, cantidadVendida) {
    let inventario = JSON.parse(localStorage.getItem("inventario")) || [];
    let index = inventario.findIndex(item => item.producto === producto);

    if (index !== -1) {
        inventario[index].cantidad -= cantidadVendida;
        if (inventario[index].cantidad <= 0) {
            inventario.splice(index, 1);
        }
        localStorage.setItem("inventario", JSON.stringify(inventario));
        mostrarInventario();
    } else {
        alert("Error: Producto no encontrado en el inventario.");
    }
}

// ✅ Cargar productos en el select de ajuste de inventario
function cargarProductosSelect() {
    let inventario = JSON.parse(localStorage.getItem("inventario")) || [];
    let selectProducto = document.getElementById("producto");

    selectProducto.innerHTML = '<option value="">Seleccione un producto</option>';
    inventario.forEach(producto => {
        let option = document.createElement('option');
        option.value = producto.producto;
        option.textContent = producto.producto;
        selectProducto.appendChild(option);
    });
}

// ✅ Cargar historial de movimientos
function cargarMovimientos() {
    let movimientos = JSON.parse(localStorage.getItem("movimientos")) || [];
    let tbody = document.getElementById("movimientos-body");
    tbody.innerHTML = movimientos.map(mov => `
        <tr>
            <td>${mov.fecha}</td>
            <td>${mov.producto}</td>
            <td>${mov.tipo}</td>
            <td>${mov.cantidad}</td>
            <td>${mov.motivo}</td>
        </tr>
    `).join("");
}

// ✅ Inicialización
verificarLocalStorage();
mostrarInventario();
mostrarVentas();
cargarProductosSelect();
cargarMovimientos();
