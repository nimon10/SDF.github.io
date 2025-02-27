// Funciones específicas para inventario

// Buscar producto por nombre
function buscarProductoPorNombre(nombre) {
    const inventario = obtenerInventario();
    return inventario.filter(producto => 
        producto.nombre.toLowerCase().includes(nombre.toLowerCase())
    );
}

// Obtener productos con stock bajo
function obtenerProductosStockBajo(limite = 10) {
    const inventario = obtenerInventario();
    return inventario.filter(producto => parseInt(producto.cantidad) < limite);
}

// Calcular valor total del inventario
function calcularValorInventario() {
    const inventario = obtenerInventario();
    return inventario.reduce((total, producto) => {
        return total + (parseFloat(producto.precio) * parseInt(producto.cantidad));
    }, 0);
}

// Registrar movimiento de inventario
function registrarMovimientoInventario(productoId, tipo, cantidad, motivo) {
    const movimiento = {
        id: Date.now().toString(),
        productoId,
        tipo, // 'entrada' o 'salida'
        cantidad,
        motivo,
        fecha: new Date().toISOString()
    };
    
    let movimientos = JSON.parse(localStorage.getItem('movimientos_inventario')) || [];
    movimientos.push(movimiento);
    localStorage.setItem('movimientos_inventario', JSON.stringify(movimientos));
    
    // Actualizar stock
    return actualizarStock(productoId, tipo === 'entrada' ? cantidad : -cantidad);
}

// Obtener historial de movimientos
function obtenerMovimientosInventario() {
    return JSON.parse(localStorage.getItem('movimientos_inventario')) || [];
}
