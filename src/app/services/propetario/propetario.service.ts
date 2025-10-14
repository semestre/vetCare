import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Propietario } from 'src/app/models/propetario.model'; 

@Injectable({
  providedIn: 'root'
})
export class PropietarioService {

  private apiURL = 'https://blog-notes-wedding-ppm.trycloudflare.com/VetCare/api/propietarios';
  constructor(private http: HttpClient) {}

  // Get all propietarios
  getAllPropietarios(): Observable<Propietario[]> {
    return this.http.get<Propietario[]>(`${this.apiURL}/getAll`);
  }

  // Create a new propietario
  createPropietario(propietario: Propietario): Observable<Propietario> {
    return this.http.post<Propietario>(`${this.apiURL}/save`, propietario);
  }

}
