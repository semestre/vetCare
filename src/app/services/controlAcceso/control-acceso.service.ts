import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ControlAcceso } from 'src/app/models/controlAcceso.model'; 
import { API_CONFIG } from 'src/app/config/api.config';

@Injectable({
  providedIn: 'root'
})
export class ControlAccesoService {

  private apiURL = `${API_CONFIG.baseURL}/usuarios`;

  constructor(private http: HttpClient) {}

  getAllUsuarios(): Observable<ControlAcceso[]> {
    return this.http.get<ControlAcceso[]>(`${this.apiURL}/getAll`);
  }
  
createUsuario(usuario: ControlAcceso): Observable<{ msg: string }> {
    // 1) Armamos el JSON que el backend convierte a objeto ControlAcceso
    const json = JSON.stringify({
      idUsuario: 0, 
      nombreUsuario: usuario.nombreUsuario,
      password: usuario.password,
      rol: usuario.rol
    });

    // 2) Lo enviamos como un campo de form: controlAcceso=<json>
    const body = new HttpParams().set('controlAcceso', json);

    // 3) Indicamos que es x-www-form-urlencoded
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    return this.http.post<{ msg: string }>(`${this.apiURL}/save`, body.toString(), { headers });
  }
}
