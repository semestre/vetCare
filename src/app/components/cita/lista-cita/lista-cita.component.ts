import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Cita } from 'src/app/models/cita.model';
import { CitaService } from 'src/app/services/cita/cita.service';
import { CitaModalComponent } from '../../cita-modal/cita-modal.component'; 

@Component({
  selector: 'app-lista-cita',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './lista-cita.component.html',
  styleUrls: ['./lista-cita.component.scss'],
})
export class ListaCitaComponent implements OnInit {
  private modalCtrl = inject(ModalController);
  private toastCtrl = inject(ToastController);

  loading = true;
  error: string | null = null;

  citas: Cita[] = [];
  fallback: Cita[] = [
    { idCita: 1, fecha: '2025-10-12', hora: '10:00', motivo: 'Vacunación', idVeterinario: 101, idPaciente: 201 },
    { idCita: 2, fecha: '2025-10-13', hora: '15:30', motivo: 'Chequeo general', idVeterinario: 102, idPaciente: 202 }
  ];

  searchTerm = signal<string>('');
  filteredCitas = computed(() => {
    const q = this.searchTerm().trim().toLowerCase();
    if (!q) return this.citas;
    return this.citas.filter(c =>
      (c.motivo ?? '').toLowerCase().includes(q) ||
      String(c.idVeterinario).includes(q) ||
      String(c.idPaciente).includes(q) ||
      (c.fecha ?? '').includes(q) ||
      (c.hora ?? '').includes(q)
    );
  });

  constructor(private citaService: CitaService) {}

  ngOnInit(): void {
    this.load();
  }

  load(event?: CustomEvent) {
    this.loading = !event;
    this.error = null;

    this.citaService.getAllCitas().subscribe({
      next: (data) => {
        this.citas = Array.isArray(data) ? data : [];
        if (!this.citas.length) this.citas = this.fallback;
        this.loading = false;
        event?.detail.complete();
      },
      error: (err) => {
        console.error('Error al cargar las citas:', err);
        this.error = 'No se pudieron cargar las citas. Intenta nuevamente.';
        this.citas = this.fallback;
        this.loading = false;
        event?.detail.complete();
      }
    });
  }

  onSearchChange(ev: any) {
    this.searchTerm.set(ev?.detail?.value ?? '');
  }
  async nuevaCita() {
    const modal = await this.modalCtrl.create({
      component: CitaModalComponent,
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
}
