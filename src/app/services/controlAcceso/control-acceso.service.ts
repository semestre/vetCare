import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ControlAcceso } from 'src/app/models/controlAcceso.model'; 

@Injectable({
  providedIn: 'root'
})
export class ControlAccesoService {

  private apiURL = 'https://blog-notes-wedding-ppm.trycloudflare.com/VetCare/api/usuarios';

  constructor(private http: HttpClient) {}

  // Get all users
  getAllUsuarios(): Observable<ControlAcceso[]> {
    return this.http.get<ControlAcceso[]>(`${this.apiURL}/getAll`);
  }

  // Create a new user
  createUsuario(usuario: ControlAcceso): Observable<ControlAcceso> {
    return this.http.post<ControlAcceso>(`${this.apiURL}/save`, usuario);
  }

}
