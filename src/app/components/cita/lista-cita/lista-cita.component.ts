import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Cita } from 'src/app/models/cita.model';
import { CitaService } from 'src/app/services/cita/cita.service';
import { CitaModalComponent } from '../../cita-modal/cita-modal.component'; 
import { PacienteService } from 'src/app/services/paciente/paciente.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-lista-cita',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './lista-cita.component.html',
  styleUrls: ['./lista-cita.component.scss'],
})
export class ListaCitaComponent implements OnInit {
  private service = inject(CitaService);
  private pacienteService = inject(PacienteService);
  private modalCtrl = inject(ModalController);
  private toastCtrl = inject(ToastController);

  loading = true;
  error: string | null = null;

  citas: Cita[] = [];
  fallback: Cita[] = [
    { idCita: 1, fecha: '2025-10-12', hora: '10:00', motivo: 'Vacunación', idVeterinario: 101, idPaciente: 201 },
    { idCita: 2, fecha: '2025-10-13', hora: '15:30', motivo: 'Chequeo general', idVeterinario: 102, idPaciente: 202 }
  ];
  pacientes: any[] = [];

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

  forkJoin({
    citas: this.service.getAllCitas(),
    pacientes: this.pacienteService.getAllPacientes()
  }).subscribe({
    next: ({ citas, pacientes }) => {
      // Add pacienteNombre to each cita
      this.citas = citas.map(c => {
        const paciente = pacientes.find(p => p.idPaciente === c.idPaciente);
        return {
          ...c,
          pacienteNombre: paciente ? paciente.nombreMascota : 'Desconocido'
        };
      });

      this.pacientes = pacientes;

      this.loading = false;
      event?.detail.complete?.();
    },
    error: async (err) => {
      console.error('Error al cargar citas o pacientes:', err);
      this.error = 'No se pudieron cargar los datos.';
      this.loading = false;
      event?.detail.complete?.();
      (await this.toastCtrl.create({
        message: 'No se pudieron cargar las citas o pacientes.',
        duration: 1800,
        color: 'danger'
      })).present();
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
