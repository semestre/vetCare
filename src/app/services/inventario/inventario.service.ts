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
  const json = JSON.stringify({
    idItem: 0,
    nombreItem: String(item.nombreItem),
    cantidad: Number(item.cantidad),
    categoria: String(item.categoria ?? ''),
    fechaActualizacion: String(item.fechaActualizacion)
  });

  // ✅ Igual que en Usuarios: HttpParams de Angular
  const body = new HttpParams().set('inventario', json);

  // ✅ Headers mínimos, sin charset ni responseType extra
  const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

  console.log('POST URL =>', `${this.apiURL}/save`);
  console.log('FORM (HttpParams).toString() =>', body.toString()); // debe ser inventario={...}

  return this.http.post<{ msg: string }>(`${this.apiURL}/save`, body.toString(), { headers });
}


}
