export interface Cita {
    idCita: number;
    fecha: string;
    hora: string;
    motivo: string;
    idVeterinario: number;
    idPaciente: number;
    pacienteNombre?: string;
    status?: string;
}
