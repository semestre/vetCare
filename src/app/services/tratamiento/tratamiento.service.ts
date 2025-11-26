import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tratamiento } from 'src/app/models/tratamiento.model';
import { API_CONFIG } from 'src/app/config/api.config';

@Injectable({
  providedIn: 'root'
})
export class TratamientoService {

  private apiURL = `${API_CONFIG.baseURL}/tratamientos`;
  private FORM_FIELD = 'tratamiento';

  constructor(private http: HttpClient) {}

  // GET: todos los tratamientos
  getAllTratamientos(): Observable<Tratamiento[]> {
    return this.http.get<Tratamiento[]>(`${this.apiURL}/getAll`);
  }

  // POST: crear tratamiento
  createTratamiento(tratamiento: Tratamiento): Observable<{ msg: string }> {
    const payload: Tratamiento = {
      idTratamiento: 0,
      descripcion: String(tratamiento.descripcion),
      tipo: String(tratamiento.tipo ?? ''),
      fecha: String(tratamiento.fecha),
      idPaciente: Number(tratamiento.idPaciente),
    };

    const body = new HttpParams().set(this.FORM_FIELD, JSON.stringify(payload));
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    return this.http.post<{ msg: string }>(
      `${this.apiURL}/save`,
      body.toString(),
      { headers }
    );
  }

  // PUT: actualizar tratamiento
  updateTratamiento(tratamiento: Tratamiento): Observable<{ msg: string }> {
    const payload: Tratamiento = {
      idTratamiento: Number(tratamiento.idTratamiento),
      descripcion: String(tratamiento.descripcion),
      tipo: String(tratamiento.tipo ?? ''),
      fecha: String(tratamiento.fecha),
      idPaciente: Number(tratamiento.idPaciente),
    };

    const body = new HttpParams().set(this.FORM_FIELD, JSON.stringify(payload));
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    return this.http.put<{ msg: string }>(
      `${this.apiURL}/update`,
      body.toString(),
      { headers }
    );
  }

  // DELETE: eliminar tratamiento
  deleteTratamiento(idTratamiento: number): Observable<{ msg: string }> {
    return this.http.delete<{ msg: string }>(`${this.apiURL}/delete/${idTratamiento}`);
  }
}
