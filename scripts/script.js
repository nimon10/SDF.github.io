// ✅ Verificar si LocalStorage está disponible
function verificarLocalStorage() {
    if (typeof(Storage) !== "undefined") {
        console.log("LocalStorage está disponible");
    } else {
        console.error("Este navegador no soporta LocalStorage");
    }
}

// ✅ Validar datos de venta
function validarDatosVenta(venta) {
    return venta.cliente && venta.contacto && venta.vendedor && venta.fecha && venta.valor;
}

// ✅ Guardar venta en LocalStorage con ID único
function guardarVenta(venta) {
    if (!validarDatosVenta(venta)) {
        console.error("Datos de venta incompletos");
        return false;
    }

    venta.id = Date.now().toString();
    venta.timestamp = new Date().toISOString();
    venta.abonos = [];
    venta.saldo = parseFloat(venta.valor);
    venta.estado = venta.estado || "Pendiente";

    let ventas = obtenerVentas();
    ventas.push(venta);
    localStorage.setItem("ventas", JSON.stringify(ventas));
    return true;
}

// ✅ Obtener todas las ventas
function obtenerVentas() {
    return JSON.parse(localStorage.getItem("ventas")) || [];
}

// ✅ Buscar ventas por cliente
function buscarVentasPorCliente(nombreCliente) {
    let ventas = obtenerVentas();
    return ventas.filter(venta => venta.cliente.toLowerCase().includes(nombreCliente.toLowerCase()));
}

// ✅ Buscar una venta por ID
function buscarVenta(idVenta) {
    let ventas = obtenerVentas();
    return ventas.find(venta => venta.id === idVenta) || null;
}

// ✅ Agregar un abono a una venta específica
function agregarAbono(idVenta, montoAbono) {
    let ventas = obtenerVentas();
    let ventaIndex = ventas.findIndex(venta => venta.id === idVenta);

    if (ventaIndex === -1) {
        console.error("Venta no encontrada");
        return false;
    }

    let venta = ventas[ventaIndex];
    let abonos = venta.abonos || [];
    
    // Validar que el monto del abono sea válido
    montoAbono = parseFloat(montoAbono);
    if (isNaN(montoAbono) || montoAbono <= 0) {
        console.error("Monto de abono inválido");
        return false;
    }
    
    // Validar que el abono no sea mayor que el saldo pendiente
    if (montoAbono > venta.saldo) {
        console.error("El abono no puede ser mayor que el saldo pendiente");
        return false;
    }

    abonos.push({
        monto: montoAbono,
        fecha: new Date().toISOString().split("T")[0]
    });

    let totalAbonado = abonos.reduce((total, abono) => total + abono.monto, 0);
    let saldoRestante = parseFloat(venta.valor) - totalAbonado;

    venta.abonos = abonos;
    venta.saldo = saldoRestante;
    venta.estado = saldoRestante <= 0 ? "Pagado" : "Pendiente";

    ventas[ventaIndex] = venta;
    localStorage.setItem("ventas", JSON.stringify(ventas));

    console.log("Abono agregado:", venta);
    return true;
}

// ✅ Marcar una venta como pagada
function marcarComoPagado(idVenta) {
    let ventas = obtenerVentas();
    let ventaIndex = ventas.findIndex(venta => venta.id === idVenta);

    if (ventaIndex === -1) {
        console.error("Venta no encontrada");
        return false;
    }

    let venta = ventas[ventaIndex];
    
    // Si ya está pagada, no hacer nada
    if (venta.estado === "Pagado" && venta.saldo === 0) {
        return true;
    }
    
    // Agregar un abono por el saldo restante
    if (venta.saldo > 0) {
        venta.abonos.push({
            monto: venta.saldo,
            fecha: new Date().toISOString().split("T")[0]
        });
    }
    
    venta.estado = "Pagado";
    venta.saldo = 0;

    ventas[ventaIndex] = venta;
    localStorage.setItem("ventas", JSON.stringify(ventas));
    console.log("Venta marcada como pagada:", venta);
    return true;
}

// ✅ Eliminar una venta por ID
function eliminarVenta(idVenta) {
    let ventas = obtenerVentas();
    let nuevasVentas = ventas.filter(venta => venta.id !== idVenta);
    localStorage.setItem("ventas", JSON.stringify(nuevasVentas));
    return nuevasVentas.length < ventas.length;
}

// ✅ Guardar producto en inventario
function guardarProducto(producto) {
    if (!producto.nombre || !producto.precio || !producto.cantidad) {
        console.error("Datos de producto incompletos");
        return false;
    }

    producto.id = Date.now().toString();

    let inventario = obtenerInventario();
    inventario.push(producto);
    localStorage.setItem("inventario", JSON.stringify(inventario));
    return true;
}

// ✅ Obtener inventario
function obtenerInventario() {
    return JSON.parse(localStorage.getItem("inventario")) || [];
}

// ✅ Buscar producto en inventario
function buscarProducto() {
    let input = document.getElementById("busquedaProducto").value.toLowerCase();
    let inventario = obtenerInventario();
    let resultado = inventario.find(item => item.producto.toLowerCase() === input);

    let resultadoDiv = document.getElementById("resultadoBusqueda");
    if (resultado) {
        resultadoDiv.innerHTML = `
            <p><strong>Revista:</strong> ${resultado.revista}</p>
            <p><strong>Cantidad:</strong> ${resultado.cantidad}</p>
            <p><strong>Precio de compra:</strong> $${resultado.precio_compra}</p>
            <button onclick="realizarVenta('${resultado.producto}', ${resultado.precio_compra})">Realizar Venta</button>
        `;
    } else {
        resultadoDiv.innerHTML = "<p>Producto no encontrado.</p>";
    }
}

// ✅ Actualizar stock en inventario
function actualizarStock(productoId, cantidad) {
    let inventario = obtenerInventario();
    let productoIndex = inventario.findIndex(p => p.id === productoId);

    if (productoIndex === -1) {
        return false;
    }

    inventario[productoIndex].cantidad = Math.max(0, parseInt(inventario[productoIndex].cantidad) + parseInt(cantidad));
    localStorage.setItem("inventario", JSON.stringify(inventario));
    return true;
}

// ✅ Mostrar inventario en tabla
function mostrarInventario() {
    let inventario = obtenerInventario();
    let tabla = document.getElementById("tablaInventario");
    if (tabla) {
        tabla.innerHTML = "";

        inventario.forEach(item => {
            let fila = `<tr>
                <td>${item.revista}</td>
                <td>${item.producto}</td>
                <td>${item.cantidad}</td>
                <td>${item.precio_compra}</td>
            </tr>`;
            tabla.innerHTML += fila;
        });
    }
}

// ✅ Mostrar ventas en tabla
function mostrarVentas() {
    let ventas = obtenerVentas();
    let tabla = document.getElementById("tablaVentas");
    if (tabla) {
        tabla.innerHTML = "";

        ventas.forEach(venta => {
            let fila = `<tr>
                <td>${venta.cliente}</td>
                <td>${venta.contacto}</td>
                <td>${venta.vendedor}</td>
                <td>${venta.fecha}</td>
                <td>${venta.revista}</td>
                <td>${venta.estado}</td>
                <td>${venta.valor}</td>
            </tr>`;
            tabla.innerHTML += fila;
        });
    }
}

// ✅ Funciones específicas para la página de abonos
function buscarVentaAbonos() {
    const busqueda = document.getElementById("buscarVenta").value.trim();
    if (!busqueda) {
        alert("Por favor ingrese un ID o nombre de cliente para buscar");
        return;
    }

    const ventas = obtenerVentas();
    let ventaEncontrada = null;

    // Primero buscar por ID exacto
    ventaEncontrada = ventas.find(venta => venta.id === busqueda);

    // Si no se encuentra por ID, buscar por nombre de cliente
    if (!ventaEncontrada) {
        const ventasPorCliente = ventas.filter(venta => 
            venta.cliente.toLowerCase().includes(busqueda.toLowerCase())
        );

        if (ventasPorCliente.length > 0) {
            // Si hay múltiples coincidencias, mostrar la más reciente
            ventaEncontrada = ventasPorCliente[ventasPorCliente.length - 1];
        }
    }

    if (ventaEncontrada) {
        mostrarDetalleVenta(ventaEncontrada);
    } else {
        alert("No se encontró ninguna venta con ese ID o nombre de cliente");
    }
}

function mostrarDetalleVenta(venta) {
    document.getElementById("detalleVenta").style.display = "block";
    document.getElementById("cliente").textContent = venta.cliente;
    document.getElementById("vendedor").textContent = venta.vendedor;
    document.getElementById("fecha").textContent = new Date(venta.fecha).toLocaleDateString();
    document.getElementById("estado").textContent = venta.estado;
    document.getElementById("valorTotal").textContent = parseFloat(venta.valor).toLocaleString();
    document.getElementById("saldoPendiente").textContent = parseFloat(venta.saldo || venta.valor).toLocaleString();
    
    // Guardar el ID de la venta actual en un atributo data para usarlo en otras funciones
    document.getElementById("detalleVenta").setAttribute("data-venta-id", venta.id);
    
    // Mostrar historial de abonos
    mostrarHistorialAbonos(venta);
}

function mostrarHistorialAbonos(venta) {
    const listaAbonos = document.getElementById("listaAbonos");
    listaAbonos.innerHTML = "";
    
    if (!venta.abonos || venta.abonos.length === 0) {
        listaAbonos.innerHTML = "<li>No hay abonos registrados</li>";
        return;
    }
    
    venta.abonos.forEach(abono => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${new Date(abono.fecha).toLocaleDateString()}</strong>: $${parseFloat(abono.monto).toLocaleString()}`;
        listaAbonos.appendChild(li);
    });
}

function agregarAbonoVenta() {
    const idVenta = document.getElementById("detalleVenta").getAttribute("data-venta-id");
    const montoAbono = document.getElementById("montoAbono").value;
    
    if (!montoAbono || parseFloat(montoAbono) <= 0) {
        alert("Por favor ingrese un monto válido para el abono");
        return;
    }
    
    if (agregarAbono(idVenta, montoAbono)) {
        alert("Abono registrado correctamente");
        document.getElementById("montoAbono").value = "";
        
        // Actualizar la información mostrada
        const ventaActualizada = buscarVenta(idVenta);
        mostrarDetalleVenta(ventaActualizada);
    } else {
        alert("Error al registrar el abono. Verifique que el monto no sea mayor al saldo pendiente.");
    }
}

function marcarVentaPagada() {
    const idVenta = document.getElementById("detalleVenta").getAttribute("data-venta-id");
    
    if (confirm("¿Está seguro de marcar esta venta como pagada? Esto registrará un abono por el saldo pendiente.")) {
        if (marcarComoPagado(idVenta)) {
            alert("Venta marcada como pagada correctamente");
            
            // Actualizar la información mostrada
            const ventaActualizada = buscarVenta(idVenta);
            mostrarDetalleVenta(ventaActualizada);
        } else {
            alert("Error al marcar la venta como pagada");
        }
    }
}

// ✅ Inicialización
document.addEventListener("DOMContentLoaded", function() {
    verificarLocalStorage();
    
    // Inicializar componentes según la página actual
    if (document.getElementById("tablaInventario")) {
        mostrarInventario();
    }
    
    if (document.getElementById("tablaVentas")) {
        mostrarVentas();
    }
});
