import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tratamiento } from 'src/app/models/tratamiento.model';

@Injectable({
  providedIn: 'root'
})
export class TratamientoService {

  private apiURL = ''; // <-- put your API URL here

  constructor(private http: HttpClient) {}

  // Get all tratamientos
  getAllTratamientos(): Observable<Tratamiento[]> {
    return this.http.get<Tratamiento[]>(`${this.apiURL}`);
  }

  // Create a new tratamiento
  createTratamiento(tratamiento: Tratamiento): Observable<Tratamiento> {
    return this.http.post<Tratamiento>(`${this.apiURL}`, tratamiento);
  }

}
