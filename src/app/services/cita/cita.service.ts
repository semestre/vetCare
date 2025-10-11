import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cita } from 'src/app/models/cita.model'; 

@Injectable({
  providedIn: 'root'
})
export class CitaService {

  private apiURL = ''; 

  constructor(private http: HttpClient) {}

  // Get all citas
  getAllCitas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.apiURL}`);
  }

  // Create a new cita
  createCita(cita: Cita): Observable<Cita> {
    return this.http.post<Cita>(`${this.apiURL}`, cita);
  }

}
