import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonicModule,
  ToastController,
  ModalController,
  AlertController
} from '@ionic/angular';
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
  private alertCtrl = inject(AlertController);

  usuarios: ControlAcceso[] = [];
  fallback: ControlAcceso[] = [
    { idUsuario: 1, nombreUsuario: 'admin', password: '••••', rol: 'Administrador' },
    { idUsuario: 2, nombreUsuario: 'veterinario01', password: '••••', rol: 'Veterinario' },
  ];

  loading = true;
  error: string | null = null;

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
        event?.detail.complete?.();
      },
      error: async (err) => {
        console.error('Error al cargar los usuarios:', err);
        this.error = 'No se pudieron cargar los usuarios.';
        this.usuarios = this.fallback;
        this.applyFilters();
        this.loading = false;
        event?.detail.complete?.();
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

      const matchRol = rolSel === this.normalize('Todos')
        ? true
        : (rolUser === rolSel || rolUser.includes(rolSel));

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
      cssClass: 'center-modal',
      mode: 'md',
      backdropDismiss: false,
      animated: true
    });

    await modal.present();

    const { role, data } = await modal.onDidDismiss();

    if (role === 'created') {
      // recargamos todo (por si backend agrega cosas, ids, etc.)
      this.load();
    }
  }

  // 📝 Editar usuario
  async editarUsuario(user: ControlAcceso) {
    const modal = await this.modalCtrl.create({
      component: ControlAccesoModalComponent,
      cssClass: 'center-modal',
      mode: 'md',
      backdropDismiss: false,
      animated: true,
      componentProps: {
        usuario: { ...user }
      }
    });

    await modal.present();

    const { role, data } = await modal.onDidDismiss();

    if (role === 'updated' && data) {
      const updated = data as ControlAcceso;

      this.usuarios = this.usuarios.map(u =>
        u.idUsuario === updated.idUsuario ? { ...u, ...updated } : u
      );
      this.applyFilters();

      (await this.toast.create({
        message: 'Usuario actualizado en la lista.',
        duration: 1300,
        color: 'success'
      })).present();
    }
  }

  // 🗑️ Eliminar usuario
  async eliminarUsuario(user: ControlAcceso) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar usuario',
      subHeader: 'Esta acción no se puede deshacer',
      message: `¿Seguro que quieres eliminar al usuario "${user.nombreUsuario}" (ID #${user.idUsuario})?`,
      cssClass: 'user-delete-alert',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'confirm',
          cssClass: 'danger'
        }
      ]
    });

    await alert.present();
    const { role } = await alert.onDidDismiss();

    if (role === 'confirm') {
      this.controlAccesoService.deleteUsuario(user.idUsuario).subscribe({
        next: async () => {
          this.usuarios = this.usuarios.filter(u => u.idUsuario !== user.idUsuario);
          this.applyFilters();
          (await this.toast.create({
            message: 'Usuario eliminado.',
            duration: 1500,
            color: 'success'
          })).present();
        },
        error: async (err: any) => {
          console.error('Error al eliminar usuario:', err);
          (await this.toast.create({
            message: 'No se pudo eliminar el usuario.',
            duration: 2000,
            color: 'danger'
          })).present();
        }
      });
    }
  }

  initial(name: string) {
    return (name?.trim()?.charAt(0) || '?').toUpperCase();
  }

  roleEmoji(rol?: string): string {
    const r = (rol || '').toLowerCase().trim();

    if (r.includes('admin')) return '👑';
    if (r.includes('vet')) return '🐾';
    if (r.includes('asis')) return '🧑‍💼';

    return '';
  }
}
