import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Paciente } from 'src/app/models/paciente.model';
import { PacienteService } from 'src/app/services/paciente/paciente.service';

@Component({
  selector: 'app-paciente-modal',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './paciente-modal.component.html',
  styleUrls: ['./paciente-modal.component.scss'],
})
export class PacienteModalComponent {
  private modalCtrl = inject(ModalController);
  private toast = inject(ToastController);
  private pacienteService = inject(PacienteService);

  paciente: Paciente = {
    idPaciente: 0,
    nombreMascota: '',
    especie: '',
    raza: '',
    edad: 0,
    historialMedico: '',
    idPropietario: 0
  };

  cargando = false;

  async guardar() {
    if (!this.paciente.nombreMascota || !this.paciente.especie) {
      (await this.toast.create({
        message: 'Por favor, completa al menos nombre y especie.',
        duration: 1800,
        color: 'warning'
      })).present();
      return;
    }

    this.cargando = true;

    this.pacienteService.createPaciente(this.paciente).subscribe({
      next: async (res) => {
        this.cargando = false;
        (await this.toast.create({
          message: 'Paciente registrado correctamente ✅',
          duration: 1500,
          color: 'success'
        })).present();
        this.modalCtrl.dismiss(null, 'created'); // avisa que se creó
      },
      error: async (err) => {
        console.error('Error al guardar paciente:', err);
        this.cargando = false;
        (await this.toast.create({
          message: 'Error al registrar paciente ❌',
          duration: 1800,
          color: 'danger'
        })).present();
      }
    });
  }

  cerrar() {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
