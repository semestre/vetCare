import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Inventario } from 'src/app/models/inventario.model'; 

@Injectable({
  providedIn: 'root'
})
export class InventarioService {

  private apiURL = 'https://blog-notes-wedding-ppm.trycloudflare.com/VetCare/api/inventario';

  constructor(private http: HttpClient) {}

  // Get all items in inventario
  getAllItems(): Observable<Inventario[]> {
    return this.http.get<Inventario[]>(`${this.apiURL}/getAll`);
  }

  // Create a new inventario item
  createItem(item: Inventario): Observable<Inventario> {
    return this.http.post<Inventario>(`${this.apiURL}/save`, item);
  }

}
