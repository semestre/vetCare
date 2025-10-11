import { Component, OnInit } from '@angular/core';
import { Inventario } from 'src/app/models/inventario.model';
import { InventarioService } from 'src/app/services/inventario/inventario.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lista-inventario',
  templateUrl: './lista-inventario.component.html',
  styleUrls: ['./lista-inventario.component.scss'],
  imports: [IonicModule, CommonModule]
})
export class ListaInventarioComponent implements OnInit {

  items: Inventario[] = [
    {
      idItem: 1,
      nombreItem: 'Vacuna antirrábica',
      cantidad: 20,
      categoria: 'Medicamento',
      fechaActualizacion: '2025-10-10'
    },
    {
      idItem: 2,
      nombreItem: 'Guantes de látex',
      cantidad: 100,
      categoria: 'Material quirúrgico',
      fechaActualizacion: '2025-10-08'
    }
  ];

  constructor(private inventarioService: InventarioService) {}

  ngOnInit(): void {
    this.inventarioService.getAllItems().subscribe({
      next: (data) => {
        this.items = data;
        console.log('Inventario cargado:', data);
      },
      error: (error) => console.error('Error al cargar inventario:', error)
    });
  }

}
