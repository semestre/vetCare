import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Paciente } from 'src/app/models/paciente.model';
import { API_CONFIG } from 'src/app/config/api.config';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {

  private apiURL = `${API_CONFIG.baseURL}/pacientes`;

  constructor(private http: HttpClient) {}

  // GET: todos los pacientes
  getAllPacientes(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(`${this.apiURL}/getAll`);
  }

  // POST: crear paciente
  createPaciente(paciente: Paciente): Observable<{ msg: string }> {
    const body = new HttpParams().set('paciente', JSON.stringify(paciente));
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    return this.http.post<{ msg: string }>(
      `${this.apiURL}/save`,
      body.toString(),
      { headers }
    );
  }

  // PUT: actualizar paciente
  updatePaciente(paciente: Paciente): Observable<{ msg: string }> {
    const body = new HttpParams().set('paciente', JSON.stringify(paciente));
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    return this.http.put<{ msg: string }>(
      `${this.apiURL}/update`,
      body.toString(),
      { headers }
    );
  }

  // DELETE: eliminar paciente
  deletePaciente(idPaciente: number): Observable<{ msg: string }> {
    return this.http.delete<{ msg: string }>(`${this.apiURL}/delete/${idPaciente}`);
  }
}
