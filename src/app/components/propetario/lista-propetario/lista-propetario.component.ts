import { Component, OnInit } from '@angular/core';
import { Propietario } from 'src/app/models/propetario.model';
import { PropietarioService } from 'src/app/services/propetario/propetario.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lista-propetario',
  templateUrl: './lista-propetario.component.html',
  styleUrls: ['./lista-propetario.component.scss'],
  imports: [IonicModule, CommonModule]
})
export class ListaPropetarioComponent implements OnInit {

  propietarios: Propietario[] = [
    {
      idPropietario: 101,
      nombre: 'Juan Pérez',
      telefono: '555-1234',
      direccion: 'Calle Falsa 123, Ciudad'
    },
    {
      idPropietario: 102,
      nombre: 'María López',
      telefono: '555-5678',
      direccion: 'Av. Siempre Viva 456, Ciudad'
    }
  ];

  constructor(private propietarioService: PropietarioService) {}

  ngOnInit(): void {
    this.propietarioService.getAllPropietarios().subscribe({
      next: (data) => {
        this.propietarios = data;
        console.log('Propietarios cargados:', data);
      },
      error: (error) => console.error('Error al cargar propietarios:', error)
    });
  }

}
