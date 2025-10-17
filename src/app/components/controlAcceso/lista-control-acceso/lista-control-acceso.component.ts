import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ControlAcceso } from 'src/app/models/controlAcceso.model';
import { ControlAccesoService } from 'src/app/services/controlAcceso/control-acceso.service';
import { ControlAccesoModalComponent } from '../../control-acceso-modal/control-acceso-modal.component';

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
  async nuevoUsuario() {
    const modal = await this.modalCtrl.create({
      component: ControlAccesoModalComponent,
      breakpoints: [0, 0.6, 1],
      initialBreakpoint: 0.6,
      cssClass: 'rounded-modal'
    });

    await modal.present();

    const { role } = await modal.onDidDismiss();
    if (role === 'created') {
      this.load(); 
    }
  }

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
