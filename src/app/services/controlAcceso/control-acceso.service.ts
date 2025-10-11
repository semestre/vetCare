import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ControlAcceso } from 'src/app/models/controlAcceso.model'; 

@Injectable({
  providedIn: 'root'
})
export class ControlAccesoService {

  private apiURL = ''; // <-- put your API URL here

  constructor(private http: HttpClient) {}

  // Get all users
  getAllUsuarios(): Observable<ControlAcceso[]> {
    return this.http.get<ControlAcceso[]>(`${this.apiURL}`);
  }

  // Create a new user
  createUsuario(usuario: ControlAcceso): Observable<ControlAcceso> {
    return this.http.post<ControlAcceso>(`${this.apiURL}`, usuario);
  }

}
