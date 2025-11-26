import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonicModule,
  ToastController,
  ModalController,
  AlertController
} from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Tratamiento } from 'src/app/models/tratamiento.model';
import { TratamientoService } from 'src/app/services/tratamiento/tratamiento.service';
import { TratamientoModalComponent } from 'src/app/components/tratamiento-modal/tratamiento-modal.component';
import { forkJoin } from 'rxjs';
import { PacienteService } from 'src/app/services/paciente/paciente.service';

@Component({
  selector: 'app-lista-tratamiento',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './lista-tratamiento.component.html',
  styleUrls: ['./lista-tratamiento.component.scss'],
})
export class ListaTratamientoComponent implements OnInit {
  private service = inject(TratamientoService);
  private pacienteService = inject(PacienteService);
  private toast = inject(ToastController);
  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);

  tratamientos: Tratamiento[] = [
    { idTratamiento: 301, descripcion: 'Vacuna antirrábica', tipo: 'Vacuna',  fecha: '2025-10-12', idPaciente: 201 },
    { idTratamiento: 302, descripcion: 'Limpieza dental',     tipo: 'Higiene', fecha: '2025-10-13', idPaciente: 202 },
  ];
  pacientes: any[] = [];

  loading = true;
  error: string | null = null;

  searchTerm = '';
  tipoFiltro = 'Todos';
  tipos: string[] = ['Todos'];

  ngOnInit(): void {
    this.load();
  }

  load(event?: CustomEvent) {
    this.loading = !event;
    this.error = null;

    forkJoin({
      tratamientos: this.service.getAllTratamientos(),
      pacientes: this.pacienteService.getAllPacientes()
    }).subscribe({
      next: ({ tratamientos, pacientes }) => {
        this.pacientes = pacientes;

        this.tratamientos = tratamientos.map(t => {
          const paciente = pacientes.find((p: any) => p.idPaciente === t.idPaciente);
          return {
            ...t,
            pacienteNombre: paciente ? paciente.nombreMascota : 'Desconocido'
          };
        });

        // ordenar por fecha DESC
        this.tratamientos.sort((a, b) => this.dateNum(b.fecha) - this.dateNum(a.fecha));

        this.refreshTipos();
        this.loading = false;
        event?.detail.complete?.();
      },
      error: async (err) => {
        console.error('Error al cargar tratamientos o pacientes:', err);
        this.error = 'No se pudieron cargar los datos.';
        this.loading = false;
        event?.detail.complete?.();
        (await this.toast.create({
          message: 'No se pudieron cargar los tratamientos o pacientes.',
          duration: 1800,
          color: 'danger'
        })).present();
      }
    });
  }

  refreshTipos() {
    const set = new Set(this.tratamientos.map(t => t.tipo).filter(Boolean));
    this.tipos = ['Todos', ...Array.from(set)];
    if (!this.tipos.includes(this.tipoFiltro)) this.tipoFiltro = 'Todos';
  }

  get filtered(): Tratamiento[] {
    const q = this.searchTerm.trim().toLowerCase();
    return this.tratamientos.filter(t => {
      const byTipo = this.tipoFiltro === 'Todos' || (t.tipo ?? '') === this.tipoFiltro;
      const byText =
        String(t.idTratamiento).includes(q) ||
        String(t.idPaciente).includes(q) ||
        (t.descripcion ?? '').toLowerCase().includes(q) ||
        (t.tipo ?? '').toLowerCase().includes(q) ||
        (t.fecha ?? '').includes(q) ||
        (t.pacienteNombre ?? '').toLowerCase().includes(q);
      return byTipo && (!q || byText);
    });
  }

  iconForTipo(tipo?: string) {
    const k = (tipo || '').toLowerCase();
    if (k.includes('vacuna')) return 'medkit-outline';
    if (k.includes('higien')) return 'sparkles-outline';
    if (k.includes('ciru'))   return 'bandage-outline';
    if (k.includes('despara'))return 'bug-outline';
    if (k.includes('control'))return 'checkmark-circle-outline';
    return 'flask-outline';
  }

  tipoClass(tipo?: string) {
    const k = (tipo || '').toLowerCase();
    if (k.includes('vacuna')) return 't-vacuna';
    if (k.includes('higien')) return 't-higiene';
    if (k.includes('ciru'))   return 't-cirugia';
    if (k.includes('despara'))return 't-despara';
    if (k.includes('control'))return 't-control';
    return 't-otro';
  }

  statusByFecha(fecha?: string): 'pasado' | 'hoy' | 'proximo' {
    const d = this.dateNum(fecha);
    const today = this.dateNum(new Date().toISOString().slice(0,10));
    if (!d) return 'pasado';
    if (d === today) return 'hoy';
    return d > today ? 'proximo' : 'pasado';
  }

  dateNum(fecha?: string): number {
    if (!fecha) return 0;
    const clean = fecha.replace(/-/g, '');
    return Number(clean) || 0;
  }

  // ➕ Nuevo
  async nuevoTratamiento() {
    const modal = await this.modalCtrl.create({
      component: TratamientoModalComponent,
      cssClass: 'center-modal',
      mode: 'md',
      backdropDismiss: false,
      animated: true
    });
    await modal.present();

    const { role } = await modal.onDidDismiss();
    if (role === 'created') this.load();
  }

  // ✏️ Editar
  async editarTratamiento(t: Tratamiento) {
    const modal = await this.modalCtrl.create({
      component: TratamientoModalComponent,
      cssClass: 'center-modal',
      mode: 'md',
      backdropDismiss: false,
      animated: true,
      componentProps: {
        tratamiento: { ...t }
      }
    });
    await modal.present();

    const { role, data } = await modal.onDidDismiss();
    if (role === 'updated' && data) {
      const updated = data as Tratamiento;

      // recalcular nombre de paciente
      const p = this.pacientes.find((x: any) => x.idPaciente === updated.idPaciente);
      const pacienteNombre = p ? p.nombreMascota : 'Desconocido';

      this.tratamientos = this.tratamientos.map(tr =>
        tr.idTratamiento === updated.idTratamiento
          ? { ...tr, ...updated, pacienteNombre }
          : tr
      );

      (await this.toast.create({
        message: 'Tratamiento actualizado.',
        duration: 1500,
        color: 'success'
      })).present();
    }
  }

  // 🗑️ Eliminar
  async eliminarTratamiento(t: Tratamiento) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar tratamiento',
      subHeader: 'Esta acción no se puede deshacer',
      message: `¿Seguro que quieres eliminar el tratamiento #${t.idTratamiento}?`,
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
      this.service.deleteTratamiento(t.idTratamiento).subscribe({
        next: async () => {
          this.tratamientos = this.tratamientos.filter(x => x.idTratamiento !== t.idTratamiento);
          (await this.toast.create({
            message: 'Tratamiento eliminado.',
            duration: 1500,
            color: 'success'
          })).present();
        },
        error: async (err) => {
          console.error('Error al eliminar tratamiento:', err);
          (await this.toast.create({
            message: 'No se pudo eliminar el tratamiento.',
            duration: 2000,
            color: 'danger'
          })).present();
        }
      });
    }
  }
}
