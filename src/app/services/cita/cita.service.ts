import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cita } from 'src/app/models/cita.model';
import { API_CONFIG } from 'src/app/config/api.config';

@Injectable({
  providedIn: 'root'
})
export class CitaService {

  private apiURL = `${API_CONFIG.baseURL}/citas`;

  constructor(private http: HttpClient) {}

  // Obtener todas las citas
  getAllCitas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.apiURL}/getAll`);
  }

  // Crear nueva cita
  createCita(cita: Cita): Observable<{ msg: string }> {
    const body = new HttpParams().set('cita', JSON.stringify(cita));
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    return this.http.post<{ msg: string }>(`${this.apiURL}/save`, body.toString(), { headers });
  }

  // Actualizar cita
  updateCita(cita: Cita): Observable<{ msg: string }> {
    const body = new HttpParams().set('cita', JSON.stringify(cita));
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    return this.http.put<{ msg: string }>(`${this.apiURL}/update`, body.toString(), { headers });
  }

  // Eliminar cita
  deleteCita(idCita: number): Observable<{ msg: string }> {
    return this.http.delete<{ msg: string }>(`${this.apiURL}/delete/${idCita}`);
  }
}
