import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Facturacion } from 'src/app/models/facturacion.model';
import { API_CONFIG } from 'src/app/config/api.config';

@Injectable({
  providedIn: 'root'
})
export class FacturacionService {

  private apiURL = `${API_CONFIG.baseURL}/facturacion`;

  constructor(private http: HttpClient) {}

  // Obtener todas las facturas
  getAllFacturas(): Observable<Facturacion[]> {
    return this.http.get<Facturacion[]>(`${this.apiURL}/getAll`);
  }

  // Crear factura
  createFactura(factura: Facturacion): Observable<{ msg: string }> {
    const body = new HttpParams().set('facturacion', JSON.stringify(factura));
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    return this.http.post<{ msg: string }>(
      `${this.apiURL}/save`,
      body.toString(),
      { headers }
    );
  }

  // Actualizar factura
  updateFactura(factura: Facturacion): Observable<{ msg: string }> {
    const body = new HttpParams().set('facturacion', JSON.stringify(factura));
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    return this.http.put<{ msg: string }>(
      `${this.apiURL}/update`,
      body.toString(),
      { headers }
    );
  }

  // Eliminar factura
  deleteFactura(idFactura: number): Observable<{ msg: string }> {
    return this.http.delete<{ msg: string }>(`${this.apiURL}/delete/${idFactura}`);
  }
}
