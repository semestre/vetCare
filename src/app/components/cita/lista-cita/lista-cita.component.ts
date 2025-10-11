import { Component, OnInit } from '@angular/core';
import { Cita } from 'src/app/models/cita.model'; 
import { CitaService } from 'src/app/services/cita/cita.service';  
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lista-cita',
  templateUrl: './lista-cita.component.html',
  styleUrls: ['./lista-cita.component.scss'],
  imports: [IonicModule, CommonModule]
})
export class ListaCitaComponent implements OnInit {

  citas: Cita[] = [
    {
      idCita: 1,
      fecha: '2025-10-12',
      hora: '10:00',
      motivo: 'Vacunación',
      idVeterinario: 101,
      idPaciente: 201
    },
    {
      idCita: 2,
      fecha: '2025-10-13',
      hora: '15:30',
      motivo: 'Chequeo general',
      idVeterinario: 102,
      idPaciente: 202
    }
  ];

  constructor(private citaService: CitaService) {}

  ngOnInit(): void {
    this.citaService.getAllCitas().subscribe({
      next: (data) => {
        this.citas = data;
        console.log('Citas cargadas:', data);
      },
      error: (err) => {
        console.error('Error al cargar las citas:', err);
      }
    });
  }
}
