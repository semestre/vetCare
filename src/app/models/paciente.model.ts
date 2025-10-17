export interface Paciente {
    idPaciente: number;
    nombreMascota: string;
    especie: string;
    raza: string;
    edad: number;
    historialMedico: string;
    idPropietario: number;
    propietarioNombre?: string; // 👈 add this line!
}

