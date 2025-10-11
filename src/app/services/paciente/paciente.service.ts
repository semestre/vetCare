import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Paciente } from 'src/app/models/paciente.model';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {

  private apiURL = ''; // <-- put your API URL here

  constructor(private http: HttpClient) {}

  // Get all pacientes
  getAllPacientes(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(`${this.apiURL}`);
  }

  // Create a new paciente
  createPaciente(paciente: Paciente): Observable<Paciente> {
    return this.http.post<Paciente>(`${this.apiURL}`, paciente);
  }

}
