import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Inventario } from 'src/app/models/inventario.model';

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private apiURL = 'https://blog-notes-wedding-ppm.trycloudflare.com/VetCare/api/inventario';

  constructor(private http: HttpClient) {}

  getAllItems(): Observable<Inventario[]> {
    return this.http.get<Inventario[]>(`${this.apiURL}/getAll`);
  }

  // POST /inventario/save -> @FormParam("inventario")
  createItem(item: Inventario): Observable<{ msg: string }> {
    const payload: Inventario = {
      idItem: 0, // lo asigna el backend
      nombreItem: String(item.nombreItem),
      cantidad: Number(item.cantidad),
      categoria: String(item.categoria ?? ''),
      fechaActualizacion: String(item.fechaActualizacion) // 'YYYY-MM-DD'
    };

    const body = new HttpParams().set('inventario', JSON.stringify(payload));
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    return this.http.post<{ msg: string }>(`${this.apiURL}/save`, body.toString(), { headers });
  }
}
