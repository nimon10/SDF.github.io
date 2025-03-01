// scripts/script.js
import { db } from "./firebase-config.js";
import { 
    collection, addDoc, getDocs, doc, getDoc,
    updateDoc, deleteDoc, query, where, 
    orderBy, onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ✅ Verificar si Firebase está disponible
function verificarFirebase() {
    if (db) {
        console.log("Firebase está disponible");
    } else {
        console.error("Error al conectar con Firebase");
    }
}

// ✅ Validar datos de venta
function validarDatosVenta(venta) {
    return venta.cliente && venta.contacto && venta.vendedor && venta.fecha && venta.valor;
}

// ✅ Guardar venta en Firebase
async function guardarVenta(venta) {
    if (!validarDatosVenta(venta)) {
        console.error("Datos de venta incompletos");
        return false;
    }

    try {
        venta.timestamp = new Date().toISOString();
        venta.abonos = [];
        venta.saldo = parseFloat(venta.valor);
        venta.estado = venta.estado || "Pendiente";

        const docRef = await addDoc(collection(db, "ventas"), venta);
        console.log("Venta guardada con ID: ", docRef.id);
        return true;
    } catch (error) {
        console.error("Error al guardar venta: ", error);
        return false;
    }
}

// ✅ Obtener todas las ventas
async function obtenerVentas() {
    try {
        const ventasSnapshot = await getDocs(collection(db, "ventas"));
        const ventas = [];
        ventasSnapshot.forEach((doc) => {
            ventas.push({ id: doc.id, ...doc.data() });
        });
        return ventas;
    } catch (error) {
        console.error("Error al obtener ventas: ", error);
        return [];
    }
}

// ✅ Escuchar cambios en ventas (tiempo real)
function escucharVentas(callback) {
    const q = query(collection(db, "ventas"), orderBy("timestamp", "desc"));
    return onSnapshot(q, (querySnapshot) => {
        const ventas = [];
        querySnapshot.forEach((doc) => {
            ventas.push({ id: doc.id, ...doc.data() });
        });
        callback(ventas);
    });
}

// ✅ Buscar ventas por cliente
async function buscarVentasPorCliente(nombreCliente) {
    try {
        const q = query(
            collection(db, "ventas"), 
            where("cliente", ">=", nombreCliente),
            where("cliente", "<=", nombreCliente + '\uf8ff')
        );
        const querySnapshot = await getDocs(q);
        const ventas = [];
        querySnapshot.forEach((doc) => {
            ventas.push({ id: doc.id, ...doc.data() });
        });
        return ventas;
    } catch (error) {
        console.error("Error al buscar ventas: ", error);
        return [];
    }
}

// ✅ Buscar clientes por nombre
async function buscarClientesPorNombre(nombreCliente) {
    try {
        const q = query(
            collection(db, "ventas"), 
            where("cliente", ">=", nombreCliente),
            where("cliente", "<=", nombreCliente + '\uf8ff')
        );
        const querySnapshot = await getDocs(q);
        const clientes = [];
        
        // Usar un Set para evitar duplicados
        const clientesUnicos = new Set();
        
        querySnapshot.forEach((doc) => {
            const venta = doc.data();
            // Crear un identificador único para cada combinación cliente-contacto
            const clienteId = `${venta.cliente}|${venta.contacto}`;
            
            if (!clientesUnicos.has(clienteId)) {
                clientesUnicos.add(clienteId);
                clientes.push({
                    nombre: venta.cliente,
                    contacto: venta.contacto
                });
            }
        });
        
        return clientes;
    } catch (error) {
        console.error("Error al buscar clientes:", error);
        return [];
    }
}

// ✅ Buscar una venta por ID
async function buscarVenta(idVenta) {
    try {
        const docRef = doc(db, "ventas", idVenta);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            console.log("No se encontró la venta");
            return null;
        }
    } catch (error) {
        console.error("Error al buscar venta: ", error);
        return null;
    }
}

// ✅ Agregar un abono a una venta específica
async function agregarAbono(idVenta, montoAbono) {
    try {
        // Obtener la venta actual
        const docRef = doc(db, "ventas", idVenta);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
            console.error("Venta no encontrada");
            return false;
        }
        
        const venta = docSnap.data();
        
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
        
        // Crear el nuevo abono
        const nuevoAbono = {
            monto: montoAbono,
            fecha: new Date().toISOString().split("T")[0]
        };
        
        // Actualizar los abonos y el saldo
        const abonos = [...(venta.abonos || []), nuevoAbono];
        const totalAbonado = abonos.reduce((total, abono) => total + abono.monto, 0);
        const saldoRestante = parseFloat(venta.valor) - totalAbonado;
        const estado = saldoRestante <= 0 ? "Pagado" : "Pendiente";
        
        // Actualizar la venta en Firestore
        await updateDoc(docRef, {
            abonos: abonos,
            saldo: saldoRestante,
            estado: estado
        });
        
        console.log("Abono agregado:", nuevoAbono);
        return true;
    } catch (error) {
        console.error("Error al agregar abono: ", error);
        return false;
    }
}

// ✅ Registrar movimiento de inventario
async function registrarMovimientoInventario(productoId, tipo, cantidad, motivo) {
    try {
        // Obtener información del producto
        const docRef = doc(db, "inventario", productoId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
            console.error("Producto no encontrado");
            return false;
        }
        
        const producto = docSnap.data();
        
        // Calcular la cantidad ajustada (positiva para entrada, negativa para salida)
        const cantidadAjustada = tipo === 'entrada' ? parseInt(cantidad) : -parseInt(cantidad);
        
        // Verificar que no se intente retirar más de lo disponible
        if (tipo === 'salida' && parseInt(cantidad) > parseInt(producto.cantidad)) {
            console.error("No hay suficiente stock para realizar esta salida");
            return false;
        }
        
        // Actualizar el stock
        const nuevoStock = Math.max(0, parseInt(producto.cantidad) + cantidadAjustada);
        
        await updateDoc(docRef, {
            cantidad: nuevoStock
        });
        
        // Registrar el movimiento en una colección separada
        const movimiento = {
            productoId: productoId,
            nombreProducto: producto.nombre,
            tipo: tipo,
            cantidad: parseInt(cantidad),
            motivo: motivo,
            fecha: new Date().toISOString(),
            usuario: "sistema" // Esto podría ser dinámico si implementas autenticación
        };
        
        await addDoc(collection(db, "movimientos_inventario"), movimiento);
        
        console.log(`Movimiento registrado: ${tipo} de ${cantidad} unidades`);
        return true;
    } catch (error) {
        console.error("Error al registrar movimiento: ", error);
        return false;
    }
}

// ✅ Obtener movimientos de inventario
async function obtenerMovimientosInventario() {
    try {
        const q = query(
            collection(db, "movimientos_inventario"),
            orderBy("fecha", "desc")
        );
        const querySnapshot = await getDocs(q);
        const movimientos = [];
        
        querySnapshot.forEach((doc) => {
            movimientos.push({ id: doc.id, ...doc.data() });
        });
        
        return movimientos;
    } catch (error) {
        console.error("Error al obtener movimientos de inventario: ", error);
        return [];
    }
}

// ✅ Marcar una venta como pagada
async function marcarComoPagado(idVenta) {
    try {
        // Obtener la venta actual
        const docRef = doc(db, "ventas", idVenta);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
            console.error("Venta no encontrada");
            return false;
        }
        
        const venta = docSnap.data();
        
        // Si ya está pagada, no hacer nada
        if (venta.estado === "Pagado" && venta.saldo === 0) {
            return true;
        }
        
        // Preparar los datos actualizados
        const datosActualizados = {
            estado: "Pagado",
            saldo: 0
        };
        
        // Agregar un abono por el saldo restante si es necesario
        if (venta.saldo > 0) {
            const nuevoAbono = {
                monto: venta.saldo,
                fecha: new Date().toISOString().split("T")[0]
            };
            
            datosActualizados.abonos = [...(venta.abonos || []), nuevoAbono];
        }
        
        // Actualizar la venta en Firestore
        await updateDoc(docRef, datosActualizados);
        
        console.log("Venta marcada como pagada");
        return true;
    } catch (error) {
        console.error("Error al marcar como pagado: ", error);
        return false;
    }
}

// ✅ Eliminar una venta por ID
async function eliminarVenta(idVenta) {
    try {
        await deleteDoc(doc(db, "ventas", idVenta));
        console.log("Venta eliminada");
        return true;
    } catch (error) {
        console.error("Error al eliminar venta: ", error);
        return false;
    }
}

// ✅ Guardar producto en inventario
async function guardarProducto(producto) {
    if (!producto.nombre || !producto.precio || !producto.cantidad) {
        console.error("Datos de producto incompletos");
        return false;
    }

    try {
        const docRef = await addDoc(collection(db, "inventario"), producto);
        console.log("Producto guardado con ID: ", docRef.id);
        return true;
    } catch (error) {
        console.error("Error al guardar producto: ", error);
        return false;
    }
}

// ✅ Obtener inventario
async function obtenerInventario() {
    try {
        const inventarioSnapshot = await getDocs(collection(db, "inventario"));
        const inventario = [];
        inventarioSnapshot.forEach((doc) => {
            inventario.push({ id: doc.id, ...doc.data() });
        });
        return inventario;
    } catch (error) {
        console.error("Error al obtener inventario: ", error);
        return [];
    }
}

// ✅ Escuchar cambios en inventario (tiempo real)
function escucharInventario(callback) {
    const q = query(collection(db, "inventario"));
    return onSnapshot(q, (querySnapshot) => {
        const inventario = [];
        querySnapshot.forEach((doc) => {
            inventario.push({ id: doc.id, ...doc.data() });
        });
        callback(inventario);
    });
}

// ✅ Actualizar stock en inventario
async function actualizarStock(productoId, cantidad) {
    try {
        const docRef = doc(db, "inventario", productoId);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
            console.error("Producto no encontrado");
            return false;
        }
        
        const producto = docSnap.data();
        const nuevoStock = Math.max(0, parseInt(producto.cantidad) + parseInt(cantidad));
        
        await updateDoc(docRef, {
            cantidad: nuevoStock
        });
        
        return true;
    } catch (error) {
        console.error("Error al actualizar stock: ", error);
        return false;
    }
}

// ✅ Eliminar producto
async function eliminarProducto(idProducto) {
    try {
        await deleteDoc(doc(db, "inventario", idProducto));
        console.log("Producto eliminado");
        return true;
    } catch (error) {
        console.error("Error al eliminar producto: ", error);
        return false;
    }
}

// ✅ Buscar producto por nombre
async function buscarProductoPorNombre(nombre) {
    try {
        const q = query(
            collection(db, "inventario"), 
            where("nombre", ">=", nombre),
            where("nombre", "<=", nombre + '\uf8ff')
        );
        const querySnapshot = await getDocs(q);
        const productos = [];
        querySnapshot.forEach((doc) => {
            productos.push({ id: doc.id, ...doc.data() });
        });
        return productos;
    } catch (error) {
        console.error("Error al buscar productos: ", error);
        return [];
    }
}

// ✅ Obtener productos con stock bajo
async function obtenerProductosStockBajo(limite = 10) {
    try {
        const inventario = await obtenerInventario();
        return inventario.filter(producto => parseInt(producto.cantidad) < limite);
    } catch (error) {
        console.error("Error al obtener productos con stock bajo: ", error);
        return [];
    }
}

// ✅ Calcular valor total del inventario
async function calcularValorInventario() {
    try {
        const inventario = await obtenerInventario();
        return inventario.reduce((total, producto) => {
            return total + (parseFloat(producto.precio) * parseInt(producto.cantidad));
        }, 0);
    } catch (error) {
        console.error("Error al calcular valor del inventario: ", error);
        return 0;
    }
}

// ✅ Filtrar ventas por fecha
async function filtrarVentasPorFecha(fechaInicio, fechaFin) {
    try {
        const ventas = await obtenerVentas();
        return ventas.filter(venta => {
            const fechaVenta = new Date(venta.fecha);
            const inicio = new Date(fechaInicio);
            const fin = new Date(fechaFin);
            fin.setHours(23, 59, 59); // Incluir todo el día final
            return fechaVenta >= inicio && fechaVenta <= fin;
        });
    } catch (error) {
        console.error("Error al filtrar ventas por fecha: ", error);
        return [];
    }
}

// Exportar las funciones
export {
    verificarFirebase,
    guardarVenta,
    obtenerVentas,
    escucharVentas,
    buscarVentasPorCliente,
    buscarClientesPorNombre,
    buscarVenta,
    agregarAbono,
    marcarComoPagado,
    eliminarVenta,
    guardarProducto,
    obtenerInventario,
    escucharInventario,
    actualizarStock,
    eliminarProducto,
    buscarProductoPorNombre,
    obtenerProductosStockBajo,
    calcularValorInventario,
    filtrarVentasPorFecha,
    registrarMovimientoInventario,
    obtenerMovimientosInventario
};

