import { Component, OnInit } from '@angular/core';
import { ControlAcceso } from 'src/app/models/controlAcceso.model';
import { ControlAccesoService } from 'src/app/services/controlAcceso/control-acceso.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lista-control-acceso',
  templateUrl: './lista-control-acceso.component.html',
  styleUrls: ['./lista-control-acceso.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class ListaControlAccesoComponent implements OnInit {

  usuarios: ControlAcceso[] = [
    { idUsuario: 1, nombreUsuario: 'admin', password: '1234', rol: 'Administrador' },
    { idUsuario: 2, nombreUsuario: 'veterinario01', password: 'abcd', rol: 'Veterinario' }
  ];

  constructor(private controlAccesoService: ControlAccesoService) {}

  ngOnInit(): void {
    // Later will fetch from API 👇
    this.controlAccesoService.getAllUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
        console.log('Usuarios cargados:', data);
      },
      error: (error) => console.error('Error al cargar los usuarios:', error)
    });
  }

}
