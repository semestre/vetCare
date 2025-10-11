import { Component, OnInit } from '@angular/core';
import { Paciente } from 'src/app/models/paciente.model';
import { PacienteService } from 'src/app/services/paciente/paciente.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lista-paciente',
  templateUrl: './lista-paciente.component.html',
  styleUrls: ['./lista-paciente.component.scss'],
  imports: [IonicModule, CommonModule]
})
export class ListaPacienteComponent implements OnInit {

  pacientes: Paciente[] = [
    {
      idPaciente: 201,
      nombreMascota: 'Firulais',
      especie: 'Perro',
      raza: 'Labrador',
      edad: 3,
      historialMedico: 'Vacunación completa',
      idPropietario: 101
    },
    {
      idPaciente: 202,
      nombreMascota: 'Mishi',
      especie: 'Gato',
      raza: 'Siamés',
      edad: 2,
      historialMedico: 'Alergia a ciertos alimentos',
      idPropietario: 102
    }
  ];

  constructor(private pacienteService: PacienteService) {}

  ngOnInit(): void {
    this.pacienteService.getAllPacientes().subscribe({
      next: (data) => {
        this.pacientes = data;
        console.log('Pacientes cargados:', data);
      },
      error: (error) => console.error('Error al cargar pacientes:', error)
    });
  }

}
