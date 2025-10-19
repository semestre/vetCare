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
  private modalCtrl = inject(ModalController);

  usuarios: ControlAcceso[] = [];
  fallback: ControlAcceso[] = [
    { idUsuario: 1, nombreUsuario: 'admin', password: '••••', rol: 'Administrador' },
    { idUsuario: 2, nombreUsuario: 'veterinario01', password: '••••', rol: 'Veterinario' },
  ];

  loading = true;
  error: string | null = null;

  // setters para búsqueda y filtros
  private _searchTerm = '';
  get searchTerm() { return this._searchTerm; }
  set searchTerm(v: string) {
    this._searchTerm = (v || '').trim();
    this.applyFilters();
  }

  private _rol: string = 'Todos';
  get rol() { return this._rol; }
  set rol(v: string) {
    this._rol = v || 'Todos';
    this.applyFilters();
  }

  filteredUsuarios: ControlAcceso[] = [];

  ngOnInit(): void {
    this.load();
  }

  load(event?: CustomEvent) {
    this.loading = !event;
    this.error = null;

    this.controlAccesoService.getAllUsuarios().subscribe({
      next: (data) => {
        this.usuarios = (Array.isArray(data) ? data : []).map(u => ({ ...u }));
        if (!this.usuarios.length) this.usuarios = this.fallback;
        this.applyFilters();
        this.loading = false;
        event?.detail.complete();
      },
      error: async (err) => {
        console.error('Error al cargar los usuarios:', err);
        this.error = 'No se pudieron cargar los usuarios.';
        this.usuarios = this.fallback;
        this.applyFilters();
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

  private normalize(t: any): string {
    return (t ?? '').toString().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  }

  applyFilters(): void {
  const term = this.normalize(this.searchTerm);
  const rolSel = this.normalize(this.rol);

  this.filteredUsuarios = (this.usuarios || []).filter(u => {
    const rolUser = this.normalize(u.rol);

    // ✅ Rol: acepta igualdad o coincidencia parcial (por si hay variantes)
    const matchRol = rolSel === this.normalize('Todos')
      ? true
      : (rolUser === rolSel || rolUser.includes(rolSel));

    // ✅ Texto: busca en id, nombre y rol
    const matchTexto =
      !term ||
      this.normalize(u.nombreUsuario).includes(term) ||
      rolUser.includes(term) ||
      this.normalize(u.idUsuario).includes(term);

    return matchRol && matchTexto;
  });
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

  initial(name: string) {
    return (name?.trim()?.charAt(0) || '?').toUpperCase();
  }

  roleClass(rol: string | undefined) {
    const r = (rol || '').toLowerCase();
    if (r.includes('admin')) return 'role-admin';
    if (r.includes('vet')) return 'role-vet';
    if (r.includes('asis')) return 'role-asistente';
    return 'role-generic';
  }
}
