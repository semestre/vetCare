// src/app/models/controlAcceso.model.ts
export interface ControlAcceso {
  idUsuario: number;
  nombreUsuario: string;
  password: string | null;
  rol: string;
  email?: string | null;
  esGoogle?: boolean;
}
