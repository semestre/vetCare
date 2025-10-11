import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Facturacion } from 'src/app/models/facturacion.model';

@Injectable({
  providedIn: 'root'
})
export class FacturacionService {

  private apiURL = ''; // <-- put your API URL here

  constructor(private http: HttpClient) {}

  // Get all facturas
  getAllFacturas(): Observable<Facturacion[]> {
    return this.http.get<Facturacion[]>(`${this.apiURL}`);
  }

  // Create a new factura
  createFactura(factura: Facturacion): Observable<Facturacion> {
    return this.http.post<Facturacion>(`${this.apiURL}`, factura);
  }

}
