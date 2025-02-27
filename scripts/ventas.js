// Funciones específicas para ventas

// Filtrar ventas por fecha
function filtrarVentasPorFecha(fechaInicio, fechaFin) {
    const ventas = obtenerVentas();
    return ventas.filter(venta => {
        const fechaVenta = new Date(venta.fecha);
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        return fechaVenta >= inicio && fechaVenta <= fin;
    });
}

// Exportar ventas a CSV
function exportarVentasCSV() {
    const ventas = obtenerVentas();
    if (ventas.length === 0) {
        alert("No hay ventas para exportar");
        return;
    }
    
    // Crear encabezados CSV
    let csv = 'Cliente,Contacto,Vendedor,Fecha,Revista,Estado,Valor\n';
    
    // Agregar filas
    ventas.forEach(venta => {
        csv += `"${venta.cliente}","${venta.contacto}","${venta.vendedor}","${venta.fecha}","${venta.revista || ''}","${venta.estado}","${venta.valor}"\n`;
    });
    
    // Crear y descargar el archivo
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'ventas.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
