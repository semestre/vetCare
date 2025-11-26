import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonicModule,
  ToastController,
  ModalController,
  AlertController
} from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Propietario } from 'src/app/models/propetario.model';
import { PropietarioService } from 'src/app/services/propetario/propetario.service';
import { PropietarioModalComponent } from 'src/app/components/propietario-modal/propietario-modal.component';

@Component({
  selector: 'app-lista-propetario',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './lista-propetario.component.html',
  styleUrls: ['./lista-propetario.component.scss'],
})
export class ListaPropetarioComponent implements OnInit {
  private service = inject(PropietarioService);
  private toast = inject(ToastController);
  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);

  propietarios: Propietario[] = [
    { idPropietario: 101, nombre: 'Juan Pérez',  telefono: '555-1234', direccion: 'Calle Falsa 123, Ciudad' },
    { idPropietario: 102, nombre: 'María López', telefono: '555-5678', direccion: 'Av. Siempre Viva 456, Ciudad' }
  ];

  // UI state
  loading = true;
  error: string | null = null;

  // búsqueda
  searchTerm = '';

  ngOnInit(): void {
    this.load();
  }

  load(event?: CustomEvent) {
    this.loading = !event;
    this.error = null;

    this.service.getAllPropietarios().subscribe({
      next: (data) => {
        if (Array.isArray(data) && data.length) {
          this.propietarios = data;
        }
        this.loading = false;
        event?.detail.complete?.();
      },
      error: async (err) => {
        console.error('Error al cargar propietarios:', err);
        this.error = 'No se pudieron cargar los propietarios.';
        this.loading = false;
        event?.detail.complete?.();
        (await this.toast.create({
          message: 'No se pudieron cargar los propietarios.',
          duration: 1800,
          color: 'danger'
        })).present();
      }
    });
  }

  get filtered(): Propietario[] {
    const q = this.searchTerm.trim().toLowerCase();
    if (!q) return this.propietarios;
    return this.propietarios.filter(p =>
      String(p.idPropietario).includes(q) ||
      (p.nombre ?? '').toLowerCase().includes(q) ||
      (p.telefono ?? '').toLowerCase().includes(q) ||
      (p.direccion ?? '').toLowerCase().includes(q)
    );
  }

  initial(name?: string) {
    return (name?.trim()?.charAt(0) || '?').toUpperCase();
  }

  telHref(t?: string) {
    if (!t) return '#';
    return 'tel:' + t.replace(/[^\d+]/g, '');
  }

  // ➕ nuevo propietario
  async nuevoPropietario() {
    const modal = await this.modalCtrl.create({
      component: PropietarioModalComponent,
      cssClass: 'center-modal',
      mode: 'md',
      backdropDismiss: false,
      animated: true
    });
    await modal.present();

    const { role, data } = await modal.onDidDismiss();
    if (role === 'created') {
      this.load();
    }
  }

  // ✏️ editar propietario
  async editarPropietario(prop: Propietario) {
    const modal = await this.modalCtrl.create({
      component: PropietarioModalComponent,
      cssClass: 'center-modal',
      mode: 'md',
      backdropDismiss: false,
      animated: true,
      componentProps: {
        propietario: { ...prop }  // copia para no mutar directamente
      }
    });
    await modal.present();

    const { role, data } = await modal.onDidDismiss();
    if (role === 'updated' && data) {
      const updated = data as Propietario;
      this.propietarios = this.propietarios.map(p =>
        p.idPropietario === updated.idPropietario ? { ...p, ...updated } : p
      );

      (await this.toast.create({
        message: 'Propietario actualizado.',
        duration: 1500,
        color: 'success'
      })).present();
    }
  }

  // 🗑️ eliminar propietario
  async eliminarPropietario(prop: Propietario) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar propietario',
      subHeader: 'Esta acción no se puede deshacer',
      message: `¿Seguro que quieres eliminar a "${prop.nombre}" (ID #${prop.idPropietario})?`,
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
      this.service.deletePropietario(prop.idPropietario).subscribe({
        next: async () => {
          this.propietarios = this.propietarios.filter(p => p.idPropietario !== prop.idPropietario);
          (await this.toast.create({
            message: 'Propietario eliminado.',
            duration: 1500,
            color: 'success'
          })).present();
        },
        error: async (err) => {
          console.error('Error al eliminar propietario:', err);
          (await this.toast.create({
            message: 'No se pudo eliminar el propietario.',
            duration: 2000,
            color: 'danger'
          })).present();
        }
      });
    }
  }
}
