import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Paciente } from 'src/app/models/paciente.model';
import { PacienteService } from 'src/app/services/paciente/paciente.service';
import { ModalController } from '@ionic/angular';
import { PacienteModalComponent } from 'src/app/components/paciente-modal/paciente-modal.component';
import { PropietarioService } from 'src/app/services/propetario/propetario.service';
import { Propietario } from 'src/app/models/propetario.model';
import { PropietarioInfoModalComponent } from 'src/app/components/propietario-info-modal/propietario-info-modal.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-lista-paciente',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './lista-paciente.component.html',
  styleUrls: ['./lista-paciente.component.scss']
})
export class ListaPacienteComponent implements OnInit {

  private pacienteService = inject(PacienteService);
  private propietarioService = inject(PropietarioService);
  private toast = inject(ToastController);
  private modalCtrl = inject(ModalController);

  pacientes: Paciente[] = [
    { idPaciente: 201, nombreMascota: 'Firulais', especie: 'Perro', raza: 'Labrador', edad: 3, historialMedico: 'Vacunación completa', idPropietario: 101 },
    { idPaciente: 202, nombreMascota: 'Mishi',    especie: 'Gato',  raza: 'Siamés',   edad: 2, historialMedico: 'Alergia a ciertos alimentos', idPropietario: 102 }
  ];

  propietarios: Propietario[] = [];

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

    // Carga propietarios + pacientes en paralelo
    forkJoin({
      propietarios: this.propietarioService.getAllPropietarios(),
      pacientes: this.pacienteService.getAllPacientes()
    }).subscribe({
      next: ({ propietarios, pacientes }) => {
        this.propietarios = propietarios;

        // Match cada paciente con nombre de propietario
        this.pacientes = pacientes.map(p => {
          const propietario = propietarios.find(pr => pr.idPropietario === p.idPropietario);
          return {
            ...p,
            propietarioNombre: propietario ? propietario.nombre : 'Desconocido'
          };
        });

        this.refreshEspecies();
        this.loading = false;
        event?.detail.complete();
      },
      error: async (err) => {
        console.error('Error al cargar pacientes o propietarios:', err);
        this.error = 'No se pudieron cargar los datos.';
        this.loading = false;
        event?.detail.complete();
        (await this.toast.create({
          message: 'No se pudieron cargar los pacientes o propietarios.',
          duration: 1800,
          color: 'danger'
        })).present();
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
        (p.historialMedico ?? '').toLowerCase().includes(q) ||
        (p.propietarioNombre ?? '').toLowerCase().includes(q);
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

  async nuevoPaciente() {
    const modal = await this.modalCtrl.create({
      component: PacienteModalComponent,
      cssClass: 'center-modal',
      mode: 'md',
      backdropDismiss: false,
      animated: true
    });
    await modal.present();

    const { role } = await modal.onDidDismiss();
    if (role === 'created') this.load(); // recarga lista si se creó
  }

  // 🔹 NUEVO: abrir modal con info del propietario
  async verPropietario(paciente: Paciente) {
    const propietario = this.propietarios.find(pr => pr.idPropietario === paciente.idPropietario);

    if (!propietario) {
      (await this.toast.create({
        message: 'No se encontró el propietario para este paciente.',
        duration: 1800,
        color: 'warning'
      })).present();
      return;
    }

    const modal = await this.modalCtrl.create({
      component: PropietarioInfoModalComponent,
      componentProps: { propietario },
      cssClass: 'owner-modal',
      mode: 'md',
      backdropDismiss: true,
      animated: true
    });

    await modal.present();
  }
}
