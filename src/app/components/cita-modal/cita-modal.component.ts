import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonicModule,
  ModalController,
  ToastController,
  LoadingController
} from '@ionic/angular';
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
export class CitaModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController);
  private citaService = inject(CitaService);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);

  cita?: Cita; // se llena cuando es editar

  form = this.fb.group({
    fecha: ['', Validators.required],
    hora: ['', Validators.required],
    motivo: ['', [Validators.required, Validators.minLength(3)]],
    idVeterinario: [null as number | null, [Validators.required]],
    idPaciente: [null as number | null, [Validators.required]],
    status: ['Programada', [Validators.required]]
  });

  veterinarios: ControlAcceso[] = [];
  pacientes: Paciente[] = [];

  // Buscador de pacientes (nuevo diseño)
  pacienteSelectorAbierto = false;
  pacienteBusqueda = '';
  pacientesFiltrados: Paciente[] = [];
  pacienteSeleccionadoLabel = '';

  constructor(
    private controlAccesoService: ControlAccesoService,
    private pacienteService: PacienteService
  ) {}

  ngOnInit(): void {
    this.loadVeterinarios();
    this.loadPacientes();

    if (this.cita) {
      this.form.patchValue({
        fecha: this.cita.fecha,
        hora: this.cita.hora,
        motivo: this.cita.motivo,
        idVeterinario: this.cita.idVeterinario,
        idPaciente: this.cita.idPaciente,
        status: this.mapStatus(this.cita.status)
      });

      this.pacienteSeleccionadoLabel = `Paciente #${this.cita.idPaciente}`;
    }
  }

  private mapStatus(raw?: string): string {
    if (!raw) return 'Programada';
    const r = raw.toLowerCase();
    if (r === 'started' || r === 'programada') return 'Programada';
    if (r === 'approval' || r === 'en proceso') return 'En proceso';
    if (r === 'completed' || r === 'completada') return 'Completada';
    if (r === 'cancelled' || r === 'cancelada') return 'Cancelada';
    return raw;
  }

  close() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  loadVeterinarios() {
    this.controlAccesoService.getAllUsuarios().subscribe({
      next: (data) => {
        this.veterinarios = data.filter(
          u => (u.rol || '').toLowerCase() === 'veterinario'
        );

        // si ya hay cita, el form ya tiene idVeterinario y el select se auto-mapea
      },
      error: (err) => console.error('❌ Error loading veterinarios:', err)
    });
  }

  loadPacientes() {
    this.pacienteService.getAllPacientes().subscribe({
      next: (data) => {
        this.pacientes = data;
        this.pacientesFiltrados = [...data];

        if (this.cita) {
          const p = this.pacientes.find(p => p.idPaciente === this.cita!.idPaciente);
          if (p) {
            this.pacienteSeleccionadoLabel = `${p.idPaciente} - ${p.nombreMascota}`;
          }
        }
      },
      error: (err) => console.error('❌ Error loading pacientes:', err)
    });
  }

  // Abre/cierra el selector de pacientes
  togglePacienteSelector() {
    this.pacienteSelectorAbierto = !this.pacienteSelectorAbierto;
    if (this.pacienteSelectorAbierto) {
      this.pacientesFiltrados = [...this.pacientes];
      this.pacienteBusqueda = '';
    }
  }

  // Buscar paciente
  onPacienteSearch(ev: any) {
    const value = (ev?.detail?.value || '').toLowerCase();
    this.pacienteBusqueda = value;

    this.pacientesFiltrados = this.pacientes.filter(p =>
      String(p.idPaciente).includes(value) ||
      (p.nombreMascota || '').toLowerCase().includes(value)
    );
  }

  // Seleccionar paciente
  seleccionarPaciente(p: Paciente) {
    this.form.patchValue({ idPaciente: p.idPaciente });
    this.pacienteSeleccionadoLabel = `${p.idPaciente} - ${p.nombreMascota}`;
    this.pacienteSelectorAbierto = false;
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

    const { fecha, hora, motivo, idVeterinario, idPaciente, status } = this.form.value;

    const payload: Cita = {
      idCita: this.cita?.idCita ?? 0,
      fecha: String(fecha),
      hora: String(hora),
      motivo: String(motivo),
      idVeterinario: Number(idVeterinario),
      idPaciente: Number(idPaciente),
      status: String(status)
    };

    const isEdit = !!this.cita;

    const request$ = isEdit
      ? this.citaService.updateCita(payload)
      : this.citaService.createCita(payload);

    request$.subscribe({
      next: async (res) => {
        await loading.dismiss();
        (await this.toastCtrl.create({
          message: res?.msg ?? (isEdit ? 'Cita actualizada' : 'Cita creada'),
          duration: 1600,
          color: 'success',
          icon: 'checkmark-circle-outline'
        })).present();

        // 👇 devolvemos la cita actualizada al padre
        this.modalCtrl.dismiss(
          payload,                      // data
          isEdit ? 'updated' : 'created' // role
        );
      },
      error: async (err) => {
        await loading.dismiss();
        const msg = (typeof err?.error === 'string' && err.error.length < 200)
          ? err.error
          : (isEdit ? 'No se pudo actualizar la cita.' : 'No se pudo crear la cita.');
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
