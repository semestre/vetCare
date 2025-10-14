import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cita } from 'src/app/models/cita.model'; 

@Injectable({
  providedIn: 'root'
})
export class CitaService {

  private apiURL = 'https://blog-notes-wedding-ppm.trycloudflare.com/VetCare/api/citas'; 

  constructor(private http: HttpClient) {}

  // Get all citas
  getAllCitas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.apiURL}/getAll`);
  }

  // Create a new cita
  createCita(cita: Cita): Observable<{ msg: string }> {
    const body = new HttpParams().set('cita', JSON.stringify(cita));
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    return this.http.post<{ msg: string }>(`${this.apiURL}/save`, body.toString(), { headers });
  }

}
