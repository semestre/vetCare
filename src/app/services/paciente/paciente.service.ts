import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Paciente } from 'src/app/models/paciente.model';

@Injectable({ providedIn: 'root' })
export class PacienteService {
  private apiURL = 'https://blog-notes-wedding-ppm.trycloudflare.com/VetCare/api/pacientes';

  constructor(private http: HttpClient) {}

  getAllPacientes(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(`${this.apiURL}/getAll`);
  }

  // POST /pacientes/save -> @FormParam("paciente")
  createPaciente(paciente: Paciente): Observable<{ msg: string }> {
    // Asegura tipos y forma esperada por el backend
    const payload: Paciente = {
      idPaciente: 0, // lo asigna el backend
      nombreMascota: String(paciente.nombreMascota),
      especie: String(paciente.especie ?? ''),
      raza: String(paciente.raza ?? ''),
      edad: Number(paciente.edad ?? 0),
      historialMedico: String(paciente.historialMedico ?? ''),
      idPropietario: Number(paciente.idPropietario)
    };

    // Se envía como formulario: paciente=<JSON>
    const body = new HttpParams().set('paciente', JSON.stringify(payload));
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    return this.http.post<{ msg: string }>(`${this.apiURL}/save`, body.toString(), { headers });
  }
}
