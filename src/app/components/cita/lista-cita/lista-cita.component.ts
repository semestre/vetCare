import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonicModule,
  ModalController,
  ToastController,
  AlertController
} from '@ionic/angular';
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
  private alertCtrl = inject(AlertController);
  statusPopoverOpen = false;
  statusPopoverEvent: any = null;
  selectedCitaForStatus: Cita | null = null;

  // 🔹 Mapeo de estados a SOLO 3 valores internos:
  //   - pendiente
  //   - completada
  //   - cancelada
  private mapStatus(raw?: string): string {
    if (!raw) return 'pendiente';
    const r = raw.toLowerCase();

    // Todo lo que sea "programada" o "en proceso" lo mandamos a pendiente
    if (['started', 'programada', 'pendiente', 'en proceso', 'approval', 'pending'].includes(r)) {
      return 'pendiente';
    }

    if (['completed', 'completada', 'hecha', 'realizada'].includes(r)) {
      return 'completada';
    }

    if (['cancelled', 'cancelada'].includes(r)) {
      return 'cancelada';
    }

    return raw;
  }

  // 🔹 Texto bonito para mostrar en el chip
  getStatusLabel(status?: string): string {
    const st = this.mapStatus(status);
    if (st === 'pendiente') return 'Pendiente';
    if (st === 'completada') return 'Completada';
    if (st === 'cancelada') return 'Cancelada';
    return status || 'Sin estado';
  }

  loading = true;
  error: string | null = null;

  citas: Cita[] = [];
  fallback: Cita[] = [
    {
      idCita: 1,
      fecha: '2025-10-12',
      hora: '10:00',
      motivo: 'Vacunación',
      idVeterinario: 101,
      idPaciente: 201,
      status: 'pendiente'
    },
    {
      idCita: 2,
      fecha: '2025-10-13',
      hora: '15:30',
      motivo: 'Chequeo general',
      idVeterinario: 102,
      idPaciente: 202,
      status: 'pendiente'
    }
  ];
  pacientes: any[] = [];

  // Búsqueda por texto
  searchTerm = signal<string>('');

  // Filtro por estado
  // values: 'todas' | 'pendiente' | 'completada' | 'cancelada'
  statusFilter = signal<string>('todas');

  // Citas filtradas (búsqueda + estado)
  filteredCitas() {
    const q = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();

    return this.citas.filter(c => {
      const matchesSearch =
        (!q) ||
        (c.motivo ?? '').toLowerCase().includes(q) ||
        String(c.idVeterinario).includes(q) ||
        String(c.idPaciente).includes(q) ||
        (c.fecha ?? '').includes(q) ||
        (c.hora ?? '').includes(q);

      const st = (c.status ?? '').toLowerCase();
      const matchesStatus =
        status === 'todas' ||
        st === status.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }

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
        this.citas = citas.map(c => {
          const paciente = pacientes.find((p: any) => p.idPaciente === c.idPaciente);
          return {
            ...c,
            status: this.mapStatus(c.status),
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

  // Búsqueda libre (searchbar)
  onSearchChange(ev: any) {
    this.searchTerm.set(ev?.detail?.value ?? '');
  }

  // Filtro por estado (segment en español)
  onStatusFilterChange(ev: any) {
    this.statusFilter.set(ev?.detail?.value ?? 'todas');
  }

  // Color del chip de estado
  getStatusColor(status?: string): string {
    const st = this.mapStatus(status);
    if (st === 'pendiente') return 'warning';    // En proceso / pendiente
    if (st === 'completada') return 'success';
    if (st === 'cancelada') return 'danger';
    return 'medium';
  }

  async nuevaCita() {
    const modal = await this.modalCtrl.create({
      component: CitaModalComponent,
      cssClass: 'center-modal',
      mode: 'md',
      backdropDismiss: false,
      animated: true
    });

    await modal.present();

    const { role } = await modal.onDidDismiss();
    if (role === 'created') {
      this.load();
    }
  }

  // Editar cita completa
  async editarCita(cita: Cita) {
    const modal = await this.modalCtrl.create({
      component: CitaModalComponent,
      cssClass: 'center-modal',
      backdropDismiss: false,
      componentProps: { cita }
    });

    await modal.present();

    const { role, data } = await modal.onDidDismiss();

    if (role === 'updated' && data) {
      // update rápido local
      const index = this.citas.findIndex(c => c.idCita === data.idCita);
      if (index !== -1) {
        this.citas[index] = {
          ...data,
          status: this.mapStatus(data.status)
        };
      }

      // refresh completo
      if (role === 'updated') {
        setTimeout(() => {
          this.load();
        }, 900);
      }
    }
  }

  // Eliminar cita
  async eliminarCita(cita: Cita) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar cita',
      message: `¿Seguro que quieres eliminar la cita "${cita.motivo}"?`,
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
      this.service.deleteCita(cita.idCita).subscribe({
        next: async () => {
          this.citas = this.citas.filter(c => c.idCita !== cita.idCita);
          this.load();
          (await this.toastCtrl.create({
            message: 'Cita eliminada.',
            duration: 1600,
            color: 'success'
          })).present();
        },
        error: async (err) => {
          console.error('Error al eliminar cita:', err);
          (await this.toastCtrl.create({
            message: 'No se pudo eliminar la cita.',
            duration: 2000,
            color: 'danger'
          })).present();
        }
      });
    }
  }

  openStatusPopover(ev: Event, cita: Cita) {
    this.statusPopoverEvent = ev;
    this.selectedCitaForStatus = cita;
    this.statusPopoverOpen = true;
  }

  onStatusPopoverDismiss() {
    this.statusPopoverOpen = false;
    this.selectedCitaForStatus = null;
  }

  currentStatusIs(value: string): boolean {
    if (!this.selectedCitaForStatus) return false;
    return this.mapStatus(this.selectedCitaForStatus.status) === value;
  }

  async changeStatusFromPopover(newStatus: string) {
    const cita = this.selectedCitaForStatus;
    this.statusPopoverOpen = false;

    if (!cita) return;

    const normalized = this.mapStatus(newStatus);

    // Actualización optimista en la lista
    const index = this.citas.findIndex(c => c.idCita === cita.idCita);
    if (index !== -1) {
      this.citas[index] = {
        ...this.citas[index],
        status: normalized
      };
    }

    this.service.updateCita({
      ...cita,
      status: normalized
    }).subscribe({
      next: async () => {
        (await this.toastCtrl.create({
          message: `Estado actualizado a "${this.getStatusLabel(normalized)}".`,
          duration: 1500,
          color: 'success',
          icon: 'checkmark-circle-outline'
        })).present();
      },
      error: async (err) => {
        console.error('Error al cambiar estado:', err);
        this.load(); // recarga para no dejarlo mal
        (await this.toastCtrl.create({
          message: 'No se pudo cambiar el estado.',
          duration: 2000,
          color: 'danger',
          icon: 'close-circle-outline'
        })).present();
      }
    });
  }
}