import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Tratamiento } from 'src/app/models/tratamiento.model';
import { TratamientoService } from 'src/app/services/tratamiento/tratamiento.service';
import { ModalController } from '@ionic/angular';
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

  tratamientos: Tratamiento[] = [
    { idTratamiento: 301, descripcion: 'Vacuna antirrábica', tipo: 'Vacuna',  fecha: '2025-10-12', idPaciente: 201 },
    { idTratamiento: 302, descripcion: 'Limpieza dental',     tipo: 'Higiene', fecha: '2025-10-13', idPaciente: 202 },
  ];
  pacientes: any[] = [];

  // UI
  loading = true;
  error: string | null = null;

  // búsqueda + filtro por tipo
  searchTerm = '';
  tipoFiltro = 'Todos'; // Todos | Vacuna | Higiene | Cirugía | Desparasitación | Control | Otro
  tipos: string[] = ['Todos'];

  ngOnInit(): void { this.load(); }

  load(event?: CustomEvent) {
  this.loading = !event;
  this.error = null;

  forkJoin({
    tratamientos: this.service.getAllTratamientos(),
    pacientes: this.pacienteService.getAllPacientes()
  }).subscribe({
    next: ({ tratamientos, pacientes }) => {
      this.pacientes = pacientes;

      // Add pacienteNombre
      this.tratamientos = tratamientos.map(t => {
        const paciente = pacientes.find(p => p.idPaciente === t.idPaciente);
        return {
          ...t,
          pacienteNombre: paciente ? paciente.nombreMascota : 'Desconocido'
        };
      });

      // Optional: sort by fecha DESC
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
        (t.fecha ?? '').includes(q);
      return byTipo && (!q || byText);
    });
  }

  // helpers visuales
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


  async nuevoTratamiento() {
  const modal = await this.modalCtrl.create({
    component: TratamientoModalComponent,
    breakpoints: [0, 0.6, 1],
    initialBreakpoint: 0.6,
    cssClass: 'rounded-modal'
  });
  await modal.present();

  const { role } = await modal.onDidDismiss();
  if (role === 'created') this.load();
}
}
