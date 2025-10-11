import { Component, OnInit } from '@angular/core';
import { Facturacion } from 'src/app/models/facturacion.model';
import { FacturacionService } from 'src/app/services/facturacion/facturacion.service'; 
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lista-facturacion',
  templateUrl: './lista-facturacion.component.html',
  styleUrls: ['./lista-facturacion.component.scss'],
  imports: [IonicModule, CommonModule]
})
export class ListaFacturacionComponent implements OnInit {

  facturas: Facturacion[] = [
    {
      idFactura: 1,
      idPaciente: 201,
      servicios: 'Consulta general',
      medicamentos: 'Vacuna antirrábica',
      total: 500,
      fecha: '2025-10-12',
      metodoPago: 'Efectivo'
    },
    {
      idFactura: 2,
      idPaciente: 202,
      servicios: 'Cirugía menor',
      medicamentos: 'Anestesia local',
      total: 1500,
      fecha: '2025-10-13',
      metodoPago: 'Tarjeta'
    }
  ];

  constructor(private facturacionService: FacturacionService) {}

  ngOnInit(): void {
    this.facturacionService.getAllFacturas().subscribe({
      next: (data) => {
        this.facturas = data;
        console.log('Facturas cargadas:', data);
      },
      error: (error) => console.error('Error al cargar las facturas:', error)
    });
  }

}
