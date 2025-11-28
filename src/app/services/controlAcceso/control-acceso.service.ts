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

  // Obtener todos los usuarios
  getAllUsuarios(): Observable<ControlAcceso[]> {
    return this.http.get<ControlAcceso[]>(`${this.apiURL}/getAll`);
  }
<<<<<<< HEAD

  // Crear usuario
  createUsuario(usuario: ControlAcceso): Observable<{ msg: string }> {
    const body = new HttpParams().set('controlAcceso', JSON.stringify(usuario));
=======

  createUsuario(usuario: ControlAcceso): Observable<{ msg: string }> {
    const json = JSON.stringify({
      idUsuario: 0,
      nombreUsuario: usuario.nombreUsuario,
      password: usuario.password,
      rol: usuario.rol,
      email: usuario.email,
      esGoogle: usuario.esGoogle ?? false
    });

    const body = new HttpParams().set('controlAcceso', json);
>>>>>>> 1bbf81e (login con google)
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    return this.http.post<{ msg: string }>(
      `${this.apiURL}/save`,
      body.toString(),
      { headers }
    );
  }

  // 🔹 LOGIN GOOGLE → llama al endpoint nuevo
  loginGoogle(email: string): Observable<ControlAcceso> {
    return this.http.post<ControlAcceso>(`${this.apiURL}/login-google`, {
      email
    });
  }

  // Actualizar usuario
  updateUsuario(usuario: ControlAcceso): Observable<{ msg: string }> {
    const body = new HttpParams().set('controlAcceso', JSON.stringify(usuario));
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    return this.http.put<{ msg: string }>(`${this.apiURL}/update`, body.toString(), { headers });
  }

  // Eliminar usuario
  deleteUsuario(idUsuario: number): Observable<{ msg: string }> {
    return this.http.delete<{ msg: string }>(`${this.apiURL}/delete/${idUsuario}`);
  }
}
