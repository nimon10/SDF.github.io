// ✅ Verificar si LocalStorage está disponible
function verificarLocalStorage() {
    if (typeof(Storage) !== "undefined") {
        console.log("LocalStorage disponible.");
        return true;
    } else {
        console.error("Este navegador no soporta LocalStorage.");
        alert("Este navegador no soporta LocalStorage. La aplicación puede no funcionar correctamente.");
        return false;
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
    
    if (ventas.length === 0) {
        tabla.innerHTML = `<tr><td colspan="7" class="text-center">No hay ventas registradas</td></tr>`;
        return;
    }
    
    tabla.innerHTML = ventas.map(venta => {
        // Determinar clase para el estado
        let estadoClass = '';
        if (venta.estado === 'Pagado') {
            estadoClass = 'estado-pagado';
        } else if (venta.estado === 'Pendiente') {
            estadoClass = 'estado-pendiente';
        }
        
        return `
        <tr>
            <td>${venta.cliente}</td>
            <td>${venta.contacto}</td>
            <td>${venta.vendedor}</td>
            <td>${venta.fecha}</td>
            <td>${venta.revista}</td>
            <td><span class="${estadoClass}">${venta.estado}</span></td>
            <td>$${venta.valor.toFixed(2)}</td>
        </tr>
        `;
    }).join("");
}

// ✅ Buscar producto en inventario
function buscarProducto() {
    try {
        let input = document.getElementById("busquedaProducto").value.trim().toLowerCase();
        
        if (!input) {
            document.getElementById("resultadoBusqueda").innerHTML = "<p class='error'>Por favor ingrese un nombre de producto.</p>";
            return;
        }
        
        let inventario = JSON.parse(localStorage.getItem("inventario")) || [];
        
        // Búsqueda mejorada: ahora busca coincidencias parciales
        let productos = inventario.filter(item => item.producto.toLowerCase().includes(input));
        
        let resultadoDiv = document.getElementById("resultadoBusqueda");
        
        if (productos.length > 0) {
            // Si hay coincidencias exactas, priorizar esas
            let coincidenciaExacta = productos.find(item => item.producto.toLowerCase() === input);
            
            if (coincidenciaExacta) {
                productos = [coincidenciaExacta];
            }
            
            // Mostrar resultados
            resultadoDiv.innerHTML = productos.map(producto => `
                <div class="resultado-item">
                    <p><strong>Revista:</strong> ${producto.revista}</p>
                    <p><strong>Producto:</strong> ${producto.producto}</p>
                    <p><strong>Cantidad:</strong> <span class="${producto.cantidad < 5 ? 'stock-bajo' : ''}">${producto.cantidad}</span></p>
                    <p><strong>Precio de compra:</strong> $${producto.precio_compra.toFixed(2)}</p>
                    ${producto.cantidad > 0 ? 
                        `<button onclick="realizarVenta('${producto.producto}', ${producto.precio_compra})" class="btn-primary">Realizar Venta</button>` : 
                        `<p class="error">Sin stock disponible</p>`
                    }
                </div>
            `).join('');
        } else {
            resultadoDiv.innerHTML = "<p class='error'>Producto no encontrado. Verifique el nombre e intente nuevamente.</p>";
        }
    } catch (error) {
        console.error("Error al buscar producto:", error);
        document.getElementById("resultadoBusqueda").innerHTML = "<p class='error'>Error al buscar producto. Intente nuevamente.</p>";
    }
}

// ✅ Realizar venta directa
function realizarVenta(producto, precio) {
    try {
        // Validación de entrada
        let cliente = prompt("Ingrese el nombre del cliente:");
        if (!cliente || cliente.trim() === "") {
            alert("Debe ingresar un nombre de cliente válido.");
            return false;
        }
        
        let contacto = prompt("Ingrese el número de contacto:");
        if (!contacto || contacto.trim() === "") {
            alert("Debe ingresar un número de contacto válido.");
            return false;
        }
        
        // Formatear datos
        cliente = cliente.trim();
        contacto = contacto.trim();
        
        let vendedor = "Gladys";
        let fecha = new Date().toISOString().split("T")[0];
        let estado = "Pendiente";
        
        // Crear objeto de venta
        let nuevaVenta = { 
            cliente, 
            contacto, 
            vendedor, 
            fecha, 
            revista: producto, 
            estado, 
            valor: parseFloat(precio),
            timestamp: new Date().toISOString()
        };
        
        // Guardar venta y actualizar inventario
        guardarVenta(nuevaVenta);
        const resultado = actualizarInventario(producto, 1);
        
        if (resultado !== false) {
            mostrarVentas();
            alert(`Venta registrada correctamente para ${cliente}.`);
            return true;
        } else {
            alert("Error al actualizar el inventario. La venta no se ha completado.");
            return false;
        }
    } catch (error) {
        console.error("Error al realizar venta:", error);
        alert("Ha ocurrido un error al procesar la venta. Intente nuevamente.");
        return false;
    }
}

// ✅ Realizar venta con descuento
function realizarVentaConDescuento(producto, precio) {
    try {
        // Validar descuento
        let descuento = parseFloat(document.getElementById("descuento").value) || 0;
        if (isNaN(descuento) || descuento < 0) {
            alert("Por favor ingrese un valor de descuento válido.");
            return false;
        }
        
        let precioFinal = precio - descuento;
        if (precioFinal < 0) {
            alert("El descuento no puede ser mayor al precio.");
            return false;
        }
        
        // Validación de cliente y contacto
        let cliente = prompt("Ingrese el nombre del cliente:");
        if (!cliente || cliente.trim() === "") {
            alert("Debe ingresar un nombre de cliente válido.");
            return false;
        }
        
        let contacto = prompt("Ingrese el número de contacto:");
        if (!contacto || contacto.trim() === "") {
            alert("Debe ingresar un número de contacto válido.");
            return false;
        }
        
        // Formatear datos
        cliente = cliente.trim();
        contacto = contacto.trim();
        
        let vendedor = "David";
        let fecha = new Date().toISOString().split("T")[0];
        let estado = "Pendiente";
        
        // Crear objeto de venta
        let nuevaVenta = { 
            cliente, 
            contacto, 
            vendedor, 
            fecha, 
            revista: producto, 
            estado, 
            valor: precioFinal,
            descuento: descuento,
            precioOriginal: precio,
            timestamp: new Date().toISOString()
        };
        
        // Guardar venta y actualizar inventario
        guardarVenta(nuevaVenta);
        const resultado = actualizarInventario(producto, 1);
        
        if (resultado !== false) {
            mostrarVentas();
            alert(`Venta con descuento registrada correctamente para ${cliente}. Precio final: $${precioFinal.toFixed(2)}`);
            return true;
        } else {
            alert("Error al actualizar el inventario. La venta no se ha completado.");
            return false;
        }
    } catch (error) {
        console.error("Error al realizar venta con descuento:", error);
        alert("Ha ocurrido un error al procesar la venta. Intente nuevamente.");
        return false;
    }
}

// ✅ Agregar producto al inventario
function agregarInventario() {
    try {
        // Obtener y validar datos
        let revista = prompt("Ingrese la revista:");
        if (!revista || revista.trim() === "") {
            alert("Debe ingresar un nombre de revista válido.");
            return false;
        }
        
        let nombre = document.getElementById("nombreProducto").value.trim();
        if (!nombre) {
            alert("Debe ingresar un nombre de producto válido.");
            return false;
        }
        
        let cantidad = parseInt(document.getElementById("cantidadProducto").value);
        if (isNaN(cantidad) || cantidad <= 0) {
            alert("La cantidad debe ser un número mayor a cero.");
            return false;
        }
        
        let precio = parseFloat(document.getElementById("precioProducto").value);
        if (isNaN(precio) || precio <= 0) {
            alert("El precio debe ser un número mayor a cero.");
            return false;
        }
        
        // Formatear datos
        revista = revista.trim();
        
        // Verificar si el producto ya existe en el inventario
        let inventario = JSON.parse(localStorage.getItem("inventario")) || [];
        let productoExistente = inventario.findIndex(item => 
            item.producto.toLowerCase() === nombre.toLowerCase() && 
            item.revista.toLowerCase() === revista.toLowerCase()
        );
        
        if (productoExistente !== -1) {
            // Actualizar cantidad si el producto ya existe
            inventario[productoExistente].cantidad += cantidad;
            // Actualizar precio si es diferente (opcional)
            if (inventario[productoExistente].precio_compra !== precio) {
                if (confirm(`El precio del producto ha cambiado. ¿Desea actualizar el precio de $${inventario[productoExistente].precio_compra.toFixed(2)} a $${precio.toFixed(2)}?`)) {
                    inventario[productoExistente].precio_compra = precio;
                }
            }
            alert(`Se han agregado ${cantidad} unidades al producto existente. Total actual: ${inventario[productoExistente].cantidad} unidades.`);
        } else {
            // Agregar nuevo producto
            inventario.push({ 
                revista, 
                producto: nombre, 
                cantidad, 
                precio_compra: precio,
                fecha_ingreso: new Date().toISOString().split("T")[0]
            });
            alert(`Nuevo producto agregado al inventario: ${nombre} (${cantidad} unidades).`);
        }
        
        // Guardar cambios
        localStorage.setItem("inventario", JSON.stringify(inventario));
        mostrarInventario();
        
        // Limpiar formulario
        document.getElementById("nombreProducto").value = "";
        document.getElementById("cantidadProducto").value = "";
        document.getElementById("precioProducto").value = "";
        
        return true;
    } catch (error) {
        console.error("Error al agregar producto al inventario:", error);
        alert("Ha ocurrido un error al agregar el producto. Intente nuevamente.");
        return false;
    }
}

// ✅ Mostrar inventario
function mostrarInventario() {
    try {
        let inventario = JSON.parse(localStorage.getItem("inventario")) || [];
        let tabla = document.getElementById("tablaInventario");
        
        if (inventario.length === 0) {
            tabla.innerHTML = `<tr><td colspan="5" class="text-center">No hay productos en el inventario</td></tr>`;
            return;
        }
        
        // Ordenar inventario por cantidad (ascendente) para mostrar primero los de menor stock
        inventario.sort((a, b) => a.cantidad - b.cantidad);
        
        tabla.innerHTML = inventario.map(item => {
            // Determinar clase para el stock bajo
            const stockBajoClass = item.cantidad < 5 ? 'stock-bajo' : '';
            const valorTotal = item.cantidad * item.precio_compra;
            
            return `
            <tr>
                <td>${item.revista}</td>
                <td>${item.producto}</td>
                <td class="${stockBajoClass}">${item.cantidad} ${item.cantidad < 5 ? '<span class="badge-warning">¡Stock bajo!</span>' : ''}</td>
                <td>$${item.precio_compra.toFixed(2)}</td>
                <td>$${valorTotal.toFixed(2)}</td>
            </tr>
            `;
        }).join("");
        
        // Calcular y mostrar el valor total del inventario
        const valorTotalInventario = inventario.reduce((total, item) => total + (item.cantidad * item.precio_compra), 0);
        const elementoTotal = document.getElementById("valorTotalInventario");
        if (elementoTotal) {
            elementoTotal.textContent = `$${valorTotalInventario.toFixed(2)}`;
        }
    } catch (error) {
        console.error("Error al mostrar inventario:", error);
        document.getElementById("tablaInventario").innerHTML = `<tr><td colspan="5" class="text-center error">Error al cargar el inventario</td></tr>`;
    }
}

// ✅ Actualizar inventario tras una venta
function actualizarInventario(producto, cantidadVendida) {
    try {
        if (!producto || typeof cantidadVendida !== 'number' || cantidadVendida <= 0) {
            console.error("Datos inválidos para actualizar inventario");
            return false;
        }

        let inventario = JSON.parse(localStorage.getItem("inventario")) || [];
        let index = inventario.findIndex(item => item.producto === producto);

        if (index !== -1) {
            // Verificar si hay suficiente stock
            if (inventario[index].cantidad < cantidadVendida) {
                alert(`Error: Stock insuficiente. Solo quedan ${inventario[index].cantidad} unidades disponibles.`);
                return false;
            }
            
            // Actualizar cantidad
            inventario[index].cantidad -= cantidadVendida;
            
            // Si la cantidad llega a cero, eliminar el producto o marcarlo como agotado
            if (inventario[index].cantidad <= 0) {
                console.log(`Producto ${producto} agotado y eliminado del inventario`);
                inventario.splice(index, 1);
            }
            
            // Guardar cambios
            localStorage.setItem("inventario", JSON.stringify(inventario));
            mostrarInventario();
            return true;
        } else {
            console.error(`Producto ${producto} no encontrado en el inventario`);
            alert("Error: Producto no encontrado en el inventario.");
            return false;
        }
    } catch (error) {
        console.error("Error al actualizar inventario:", error);
        alert("Error al actualizar el inventario. Por favor, intente nuevamente.");
        return false;
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
