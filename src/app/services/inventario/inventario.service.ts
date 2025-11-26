import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Inventario } from 'src/app/models/inventario.model';
import { API_CONFIG } from 'src/app/config/api.config';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {

  private apiURL = `${API_CONFIG.baseURL}/inventario`;

  constructor(private http: HttpClient) {}

  // Obtener todos los ítems
  getAllItems(): Observable<Inventario[]> {
    return this.http.get<Inventario[]>(`${this.apiURL}/getAll`);
  }

  // Crear ítem
  createItem(item: Inventario): Observable<{ msg: string }> {
    const body = new HttpParams().set('inventario', JSON.stringify(item));
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    return this.http.post<{ msg: string }>(
      `${this.apiURL}/save`,
      body.toString(),
      { headers }
    );
  }

  // Actualizar ítem
  updateItem(item: Inventario): Observable<{ msg: string }> {
    const body = new HttpParams().set('inventario', JSON.stringify(item));
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    return this.http.put<{ msg: string }>(
      `${this.apiURL}/update`,
      body.toString(),
      { headers }
    );
  }

  // Eliminar ítem
  deleteItem(idItem: number): Observable<{ msg: string }> {
    return this.http.delete<{ msg: string }>(`${this.apiURL}/delete/${idItem}`);
  }
}
