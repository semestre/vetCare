import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Propietario } from 'src/app/models/propetario.model';
import { API_CONFIG } from 'src/app/config/api.config';

@Injectable({
  providedIn: 'root'
})
export class PropietarioService {

  private apiURL = `${API_CONFIG.baseURL}/propietarios`;

  constructor(private http: HttpClient) {}

  // GET: todos los propietarios
  getAllPropietarios(): Observable<Propietario[]> {
    return this.http.get<Propietario[]>(`${this.apiURL}/getAll`);
  }

  // POST: crear propietario
  createPropietario(prop: Propietario): Observable<{ msg: string }> {
    const body = new HttpParams().set('propietario', JSON.stringify(prop));
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    return this.http.post<{ msg: string }>(
      `${this.apiURL}/save`,
      body.toString(),
      { headers }
    );
  }

  // PUT: actualizar propietario
  updatePropietario(prop: Propietario): Observable<{ msg: string }> {
    const body = new HttpParams().set('propietario', JSON.stringify(prop));
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    return this.http.put<{ msg: string }>(
      `${this.apiURL}/update`,
      body.toString(),
      { headers }
    );
  }

  // DELETE: eliminar propietario
  deletePropietario(idPropietario: number): Observable<{ msg: string }> {
    return this.http.delete<{ msg: string }>(`${this.apiURL}/delete/${idPropietario}`);
  }
}
