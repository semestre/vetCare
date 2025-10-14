import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Paciente } from 'src/app/models/paciente.model';
import { PacienteService } from 'src/app/services/paciente/paciente.service';

@Component({
  selector: 'app-lista-paciente',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './lista-paciente.component.html',
  styleUrls: ['./lista-paciente.component.scss']
})
export class ListaPacienteComponent implements OnInit {

  private pacienteService = inject(PacienteService);
  private toast = inject(ToastController);

  pacientes: Paciente[] = [
    { idPaciente: 201, nombreMascota: 'Firulais', especie: 'Perro', raza: 'Labrador', edad: 3, historialMedico: 'Vacunación completa', idPropietario: 101 },
    { idPaciente: 202, nombreMascota: 'Mishi',    especie: 'Gato',  raza: 'Siamés',   edad: 2, historialMedico: 'Alergia a ciertos alimentos', idPropietario: 102 }
  ];

  loading = true;
  error: string | null = null;

  searchTerm = '';
  especieFiltro = 'Todas';
  especies: string[] = ['Todas'];

  ngOnInit(): void {
    this.load();
  }

  load(event?: CustomEvent) {
    this.loading = !event;
    this.error = null;

    this.pacienteService.getAllPacientes().subscribe({
      next: (data) => {
        if (Array.isArray(data) && data.length) this.pacientes = data;
        this.refreshEspecies();
        this.loading = false;
        event?.detail.complete();
      },
      error: async (err) => {
        console.error('Error al cargar pacientes:', err);
        this.error = 'No se pudieron cargar los pacientes.';
        this.refreshEspecies();
        this.loading = false;
        event?.detail.complete();
        (await this.toast.create({ message: 'No se pudieron cargar los pacientes.', duration: 1800, color: 'danger' })).present();
      }
    });
  }

  refreshEspecies() {
    const set = new Set(this.pacientes.map(p => p.especie).filter(Boolean));
    this.especies = ['Todas', ...Array.from(set)];
    if (!this.especies.includes(this.especieFiltro)) this.especieFiltro = 'Todas';
  }

  get filtered(): Paciente[] {
    const q = this.searchTerm.trim().toLowerCase();
    return this.pacientes.filter(p => {
      const byEspecie = this.especieFiltro === 'Todas' || (p.especie ?? '') === this.especieFiltro;
      const byText =
        (p.nombreMascota ?? '').toLowerCase().includes(q) ||
        (p.especie ?? '').toLowerCase().includes(q) ||
        (p.raza ?? '').toLowerCase().includes(q) ||
        String(p.idPaciente).includes(q) ||
        String(p.idPropietario).includes(q) ||
        (p.historialMedico ?? '').toLowerCase().includes(q);
      return byEspecie && (!q || byText);
    });
  }

  petEmoji(especie?: string) {
    const e = (especie || '').toLowerCase();
    if (e.includes('perro')) return '🐶';
    if (e.includes('gato'))  return '🐱';
    if (e.includes('ave'))   return '🦜';
    if (e.includes('cone'))  return '🐰';
    if (e.includes('ham'))   return '🐹';
    return '🐾';
  }

  // acciones (placeholders)
  ver(p: Paciente) { console.log('Ver', p); }
  editar(p: Paciente) { console.log('Editar', p); }
  eliminar(p: Paciente) { console.log('Eliminar', p); }
}
