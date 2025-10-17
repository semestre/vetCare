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

  // Get all propietarios
  getAllPropietarios(): Observable<Propietario[]> {
    return this.http.get<Propietario[]>(`${this.apiURL}/getAll`);
  }

  // Create a new propietario
  createPropietario(propietario: Propietario): Observable<{ msg: string }> {
    const payload: Propietario = {
      idPropietario: 0,
      nombre: String(propietario.nombre),
      telefono: String(propietario.telefono),
      direccion: String(propietario.direccion)
    };

    const body = new HttpParams().set('propietario', JSON.stringify(payload));
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    return this.http.post<{ msg: string }>(`${this.apiURL}/save`, body.toString(), { headers });
  }

}
