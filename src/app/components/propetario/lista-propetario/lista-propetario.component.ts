import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Propietario } from 'src/app/models/propetario.model';
import { PropietarioService } from 'src/app/services/propetario/propetario.service';
import { ModalController } from '@ionic/angular';
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

  propietarios: Propietario[] = [
    { idPropietario: 101, nombre: 'Juan Pérez',  telefono: '555-1234', direccion: 'Calle Falsa 123, Ciudad' },
    { idPropietario: 102, nombre: 'María López', telefono: '555-5678', direccion: 'Av. Siempre Viva 456, Ciudad' }
  ];

  // UI state
  loading = true;
  error: string | null = null;

  // búsqueda
  searchTerm = '';

  ngOnInit(): void { this.load(); }

  load(event?: CustomEvent) {
    this.loading = !event;
    this.error = null;

    this.service.getAllPropietarios().subscribe({
      next: (data) => {
        if (Array.isArray(data) && data.length) this.propietarios = data;
        this.loading = false;
        event?.detail.complete();
      },
      error: async (err) => {
        console.error('Error al cargar propietarios:', err);
        this.error = 'No se pudieron cargar los propietarios.';
        this.loading = false;
        event?.detail.complete();
        (await this.toast.create({ message: 'No se pudieron cargar los propietarios.', duration: 1800, color: 'danger' })).present();
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

  async nuevoPropietario() {
    const modal = await this.modalCtrl.create({
      component: PropietarioModalComponent,
      breakpoints: [0, 0.6, 1],
      initialBreakpoint: 0.6,
      cssClass: 'rounded-modal'
    });
    await modal.present();

    const { role } = await modal.onDidDismiss();
    if (role === 'created') this.load();
  }
}
