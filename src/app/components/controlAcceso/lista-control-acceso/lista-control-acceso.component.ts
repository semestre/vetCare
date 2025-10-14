import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ControlAcceso } from 'src/app/models/controlAcceso.model';
import { ControlAccesoService } from 'src/app/services/controlAcceso/control-acceso.service';

@Component({
  selector: 'app-lista-control-acceso',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './lista-control-acceso.component.html',
  styleUrls: ['./lista-control-acceso.component.scss'],
})
export class ListaControlAccesoComponent implements OnInit {
  private controlAccesoService = inject(ControlAccesoService);
  private toast = inject(ToastController);
  private modalCtrl = inject(ModalController); // por si después abres modal de crear

  usuarios: ControlAcceso[] = [];
  fallback: ControlAcceso[] = [
    { idUsuario: 1, nombreUsuario: 'admin',        password: '••••', rol: 'Administrador' },
    { idUsuario: 2, nombreUsuario: 'veterinario01', password: '••••', rol: 'Veterinario' }
  ];

  // ui state
  loading = true;
  error: string | null = null;

  // search
  searchTerm = '';

  ngOnInit(): void {
    this.load();
  }

  load(event?: CustomEvent) {
    this.loading = !event;
    this.error = null;

    this.controlAccesoService.getAllUsuarios().subscribe({
      next: (data) => {
        // Enmascaro password si viene del backend
        this.usuarios = (Array.isArray(data) ? data : []).map(u => ({
          ...u,
          password: '••••••' // nunca mostrar en UI
        }));
        if (!this.usuarios.length) this.usuarios = this.fallback;
        this.loading = false;
        event?.detail.complete();
      },
      error: async (err) => {
        console.error('Error al cargar los usuarios:', err);
        this.error = 'No se pudieron cargar los usuarios.';
        this.usuarios = this.fallback; // mostramos algo para no dejar vacío
        this.loading = false;
        event?.detail.complete();
        (await this.toast.create({
          message: 'No se pudieron cargar los usuarios.',
          duration: 1800,
          color: 'danger'
        })).present();
      }
    });
  }

  get filteredUsuarios(): ControlAcceso[] {
    const q = this.searchTerm.trim().toLowerCase();
    if (!q) return this.usuarios;
    return this.usuarios.filter(u =>
      String(u.idUsuario).includes(q) ||
      (u.nombreUsuario ?? '').toLowerCase().includes(q) ||
      (u.rol ?? '').toLowerCase().includes(q)
    );
  }

  // acciones (placeholders)
  nuevoUsuario() {
    // aquí abrirías tu modal o navegación
    console.log('Nuevo usuario');
  }
  ver(u: ControlAcceso)   { console.log('Ver', u); }
  editar(u: ControlAcceso){ console.log('Editar', u); }
  eliminar(u: ControlAcceso){ console.log('Eliminar', u); }

  // util para inicial del avatar
  initial(name: string) {
    return (name?.trim()?.charAt(0) || '?').toUpperCase();
  }

  roleClass(rol: string | undefined) {
    const r = (rol || '').toLowerCase();
    if (r.includes('admin')) return 'role-admin';
    if (r.includes('vet'))   return 'role-vet';
    if (r.includes('recep')) return 'role-recep';
    return 'role-generic';
  }
}
