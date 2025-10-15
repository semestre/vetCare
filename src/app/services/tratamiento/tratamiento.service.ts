import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tratamiento } from 'src/app/models/tratamiento.model';

@Injectable({
  providedIn: 'root'
})
export class TratamientoService {

  private apiURL = 'https://blog-notes-wedding-ppm.trycloudflare.com/VetCare/api/tratamientos';

  constructor(private http: HttpClient) {}

  // Get all tratamientos
  getAllTratamientos(): Observable<Tratamiento[]> {
    return this.http.get<Tratamiento[]>(`${this.apiURL}/getAll`);
  }

  // Create a new tratamiento
  createTratamiento(tratamiento: Tratamiento): Observable<{ msg: string }> {
  // Ajusta nombres si tu GET devuelve otros (p.ej. 'id_paciente')
  const payload: Tratamiento = {
    idTratamiento: 0,
    descripcion: String(tratamiento.descripcion),
    tipo: String(tratamiento.tipo ?? ''),
    fecha: String(tratamiento.fecha),      // 'YYYY-MM-DD'
    idPaciente: Number(tratamiento.idPaciente)
  };

  // Nombre del campo en el form (cámbialo si tu backend usa otro):
  const FORM_FIELD = 'tratamiento';

  const body = new HttpParams().set(FORM_FIELD, JSON.stringify(payload));
  const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

  return this.http.post<{ msg: string }>(`${this.apiURL}/save`, body.toString(), { headers });
}

}
