import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Cita } from 'src/app/models/cita.model';
import { CitaService } from 'src/app/services/cita/cita.service';

@Component({
  selector: 'app-lista-cita',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './lista-cita.component.html',
  styleUrls: ['./lista-cita.component.scss'],
})
export class ListaCitaComponent implements OnInit {
  loading = true;
  error: string | null = null;

  citas: Cita[] = [];
  // demo 
  fallback: Cita[] = [
    { idCita: 1, fecha: '2025-10-12', hora: '10:00', motivo: 'Vacunación', idVeterinario: 101, idPaciente: 201 },
    { idCita: 2, fecha: '2025-10-13', hora: '15:30', motivo: 'Chequeo general', idVeterinario: 102, idPaciente: 202 }
  ];

  // búsqueda reactiva
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
        if (!this.citas.length) {
          this.citas = this.fallback;
        }
        this.loading = false;
        event?.detail.complete();
      },
      error: (err) => {
        console.error('Error al cargar las citas:', err);
        this.error = 'No se pudieron cargar las citas. Intenta nuevamente.';
        // mostramos demo para no dejar la pantalla vacía
        this.citas = this.fallback;
        this.loading = false;
        event?.detail.complete();
      }
    });
  }

  onSearchChange(ev: any) {
    this.searchTerm.set(ev?.detail?.value ?? '');
  }
  nuevaCita() {
    // aquí podrías abrir modal o navegar a /citas/nueva
    console.log('Nueva cita');
  }

}
