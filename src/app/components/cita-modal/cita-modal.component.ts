import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController, LoadingController } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CitaService } from 'src/app/services/cita/cita.service';
import { Cita } from 'src/app/models/cita.model';
import { Paciente } from 'src/app/models/paciente.model';
import { PacienteService } from 'src/app/services/paciente/paciente.service';
import { ControlAcceso } from 'src/app/models/controlAcceso.model';
import { ControlAccesoService } from 'src/app/services/controlAcceso/control-acceso.service';

@Component({
  selector: 'app-cita-modal',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './cita-modal.component.html',
  styleUrls: ['./cita-modal.component.scss'],
})
export class CitaModalComponent {
  private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController);
  private citaService = inject(CitaService);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);

  form = this.fb.group({
    fecha: ['', Validators.required],       // yyyy-MM-dd
    hora: ['', Validators.required],        // HH:mm
    motivo: ['', [Validators.required, Validators.minLength(3)]],
    idVeterinario: ['', [Validators.required]],
    idPaciente: ['', [Validators.required]],
  });

  close() {
    this.modalCtrl.dismiss(null, 'cancel');
  }







  veterinarios: ControlAcceso[] = [];
  pacientes: Paciente[] = [];

  constructor(
    private controlAccesoService: ControlAccesoService,
    private pacienteService: PacienteService
  ) { }

  ngOnInit() {
    this.loadVeterinarios();
    this.loadPacientes();
  }

  loadVeterinarios() {
    this.controlAccesoService.getAllUsuarios().subscribe({
      next: (data) => {
        console.log('✅ All users:', data);
        this.veterinarios = data.filter(u => u.rol.toLowerCase() === 'veterinario');
        console.log('🩺 Filtered veterinarios:', this.veterinarios);
      },
      error: (err) => {
        console.error('❌ Error loading veterinarios:', err);
      }
    });
  }

  loadPacientes() {
    this.pacienteService.getAllPacientes().subscribe({
      next: (data) => {
        console.log('✅ Pacientes loaded:', data);
        this.pacientes = data;
      },
      error: (err) => {
        console.error('❌ Error loading pacientes:', err);
      }
    });
  }






  

  async save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      (await this.toastCtrl.create({
        message: 'Revisa los campos obligatorios.',
        duration: 2000,
        color: 'warning',
        icon: 'alert-circle-outline'
      })).present();
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Guardando...' });
    await loading.present();

    const { fecha, hora, motivo, idVeterinario, idPaciente } = this.form.value;

    const payload: Cita = {
      idCita: 0,
      fecha: String(fecha),
      hora: String(hora),
      motivo: String(motivo),
      idVeterinario: Number(idVeterinario),
      idPaciente: Number(idPaciente),
    };

    this.citaService.createCita(payload).subscribe({
      next: async (res) => {
        await loading.dismiss();
        (await this.toastCtrl.create({
          message: res?.msg ?? 'Cita creada',
          duration: 1600,
          color: 'success',
          icon: 'checkmark-circle-outline'
        })).present();
        // No regresa la cita, solo el msg -> pedimos a la lista que recargue
        this.modalCtrl.dismiss(true, 'created'); // true = indicador para recargar
      },
      error: async (err) => {
        await loading.dismiss();
        console.error('createCita error:', {
          status: err?.status,
          statusText: err?.statusText,
          body: err?.error
        });
        const msg = (typeof err?.error === 'string' && err.error.length < 200)
          ? err.error
          : 'No se pudo crear la cita.';
        (await this.toastCtrl.create({
          message: msg,
          duration: 2500,
          color: 'danger',
          icon: 'close-circle-outline'
        })).present();
      }
    });
  }
}