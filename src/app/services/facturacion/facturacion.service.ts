import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Facturacion } from 'src/app/models/facturacion.model';
import { API_CONFIG } from 'src/app/config/api.config';

@Injectable({ providedIn: 'root' })
export class FacturacionService {
  private apiURL = `${API_CONFIG.baseURL}/facturacion`;

  constructor(private http: HttpClient) {}

  // GET /facturacion/getAll
  getAllFacturas(): Observable<Facturacion[]> {
    return this.http.get<Facturacion[]>(`${this.apiURL}/getAll`);
  }

  // POST /facturacion/save con x-www-form-urlencoded: factura=<json>
  createFactura(factura: Facturacion): Observable<{ msg: string }> {
    // Asegura tipos correctos
    const payload: Facturacion = {
      idFactura: 0, // lo asigna el backend
      idPaciente: Number(factura.idPaciente),
      servicios: String(factura.servicios ?? ''),
      medicamentos: String(factura.medicamentos ?? ''),
      total: Number(factura.total),
      fecha: String(factura.fecha),           // 'YYYY-MM-DD'
      metodoPago: String(factura.metodoPago), // 'Efectivo'|'Tarjeta'|'Transferencia'
    };

    const json = JSON.stringify(payload);
    const body = new HttpParams().set('facturacion', json);
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    return this.http.post<{ msg: string }>(`${this.apiURL}/save`, body.toString(), { headers });
  }
}
