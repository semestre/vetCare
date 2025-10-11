import { Component, OnInit } from '@angular/core';
import { Tratamiento } from 'src/app/models/tratamiento.model';
import { TratamientoService } from 'src/app/services/tratamiento/tratamiento.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lista-tratamiento',
  templateUrl: './lista-tratamiento.component.html',
  styleUrls: ['./lista-tratamiento.component.scss'],
  imports: [IonicModule, CommonModule]
})
export class ListaTratamientoComponent implements OnInit {

  tratamientos: Tratamiento[] = [
    {
      idTratamiento: 301,
      descripcion: 'Vacuna antirrábica',
      tipo: 'Vacuna',
      fecha: '2025-10-12',
      idPaciente: 201
    },
    {
      idTratamiento: 302,
      descripcion: 'Limpieza dental',
      tipo: 'Higiene',
      fecha: '2025-10-13',
      idPaciente: 202
    }
  ];

  constructor(private tratamientoService: TratamientoService) {}

  ngOnInit(): void {
    this.tratamientoService.getAllTratamientos().subscribe({
      next: (data) => {
        this.tratamientos = data;
        console.log('Tratamientos cargados:', data);
      },
      error: (error) => console.error('Error al cargar tratamientos:', error)
    });
  }

}
