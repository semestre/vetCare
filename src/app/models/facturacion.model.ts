export interface Facturacion {
    idFactura: number;
    idPaciente: number;
    servicios: string;
    medicamentos: string;
    total: number;
    fecha: string;
    metodoPago: string;
    pacienteNombre?: string;
}
