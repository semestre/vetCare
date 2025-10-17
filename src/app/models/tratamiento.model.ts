export interface Tratamiento {
    idTratamiento: number;
    descripcion: string;
    tipo: string;
    fecha: string;
    idPaciente: number;
    pacienteNombre?: string; // 👈 add this line!
}
