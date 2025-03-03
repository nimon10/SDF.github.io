// scripts/inventario.js
import { 
    obtenerInventario, 
    buscarProductoPorNombre, 
    obtenerProductosStockBajo, 
    calcularValorInventario,
    actualizarStock
} from "./script.js";

// Registrar movimiento de inventario
async function registrarMovimientoInventario(productoId, tipo, cantidad, motivo) {
    try {
        // Actualizar stock (positivo para entrada, negativo para salida)
        const cantidadAjustada = tipo === 'entrada' ? cantidad : -cantidad;
        const resultado = await actualizarStock(productoId, cantidadAjustada);
        
        if (resultado) {
            // Aquí podrías registrar el movimiento en una colección separada si lo deseas
            console.log(`Movimiento registrado: ${tipo} de ${cantidad} unidades`);
        }
        
        return resultado;
    } catch (error) {
        console.error("Error al registrar movimiento: ", error);
        return false;
    }
}

export {
    registrarMovimientoInventario
};