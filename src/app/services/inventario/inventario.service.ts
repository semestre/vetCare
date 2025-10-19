import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Inventario } from 'src/app/models/inventario.model';
import { API_CONFIG } from 'src/app/config/api.config';

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private apiURL = `${API_CONFIG.baseURL}/inventario`;

  constructor(private http: HttpClient) {}

  getAllItems(): Observable<Inventario[]> {
    return this.http.get<Inventario[]>(`${this.apiURL}/getAll`);
  }

  // POST /inventario/save -> @FormParam("inventario") Inventario inventario
  createItem(item: Inventario): Observable<{ msg: string }> {
  const payload: Inventario = {
    idItem: 0,
    nombreItem: String(item.nombreItem),
    cantidad: Number(item.cantidad),
    categoria: String(item.categoria ?? ''),
    fechaActualizacion: String(item.fechaActualizacion)
  };

  // 🔹 Generar el body EXACTO que Postman envía
  const formBody = new URLSearchParams();
  formBody.set('inventario', JSON.stringify(payload));

  return this.http.post<{ msg: string }>(
    `${this.apiURL}/save`,
    formBody.toString(),
    {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded'
      }),
      responseType: 'json' as const
    }
  );
}

}
