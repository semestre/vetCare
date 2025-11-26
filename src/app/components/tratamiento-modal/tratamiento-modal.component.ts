import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController, LoadingController } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Tratamiento } from 'src/app/models/tratamiento.model';
import { TratamientoService } from 'src/app/services/tratamiento/tratamiento.service';
import { Paciente } from 'src/app/models/paciente.model';
import { PacienteService } from 'src/app/services/paciente/paciente.service';

@Component({
  selector: 'app-tratamiento-modal',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './tratamiento-modal.component.html',
  styleUrls: ['./tratamiento-modal.component.scss'],
})
export class TratamientoModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private modal = inject(ModalController);
  private service = inject(TratamientoService);
  private toast = inject(ToastController);
  private loading = inject(LoadingController);

  private pacienteService = inject(PacienteService);

  @Input() tratamiento: Tratamiento | null = null;
  isEdit = false;

  hoy = new Date().toISOString().slice(0, 10);

  form = this.fb.group({
    descripcion: ['', [Validators.required, Validators.minLength(3)]],
    tipo: ['vacuna', Validators.required],
    fecha: [this.hoy, Validators.required],
    idPaciente: ['', [Validators.required]],
  });

  pacientes: Paciente[] = [];
  pacientesFiltrados: Paciente[] = [];
  selectedPaciente: Paciente | null = null;
  searchPacienteTerm = '';

  ngOnInit() {
    this.loadPacientes();

    if (this.tratamiento && this.tratamiento.idTratamiento && this.tratamiento.idTratamiento !== 0) {
      this.isEdit = true;

      this.form.patchValue({
        descripcion: this.tratamiento.descripcion,
        tipo: this.tratamiento.tipo,
        fecha: this.tratamiento.fecha,
        idPaciente: String(this.tratamiento.idPaciente),
      });
    }
  }

  close() {
    this.modal.dismiss(null, 'cancel');
  }


  pacienteSelectorAbierto = false;
  pacienteBusqueda = '';
  pacienteSeleccionadoLabel = '';

  loadPacientes() {
    this.pacienteService.getAllPacientes().subscribe({
      next: (data) => {
        this.pacientes = data;
        this.pacientesFiltrados = [...data];

        // Si estamos en edición → mostrar label correcto
        if (this.tratamiento) {
          const p = this.pacientes.find(x => x.idPaciente === this.tratamiento!.idPaciente);
          if (p) {
            this.pacienteSeleccionadoLabel = `#${p.idPaciente} - ${p.nombreMascota}`;
          }
        }
      },
      error: (err) => console.error('❌ Error loading pacientes:', err)
    });
  }

  togglePacienteSelector() {
    this.pacienteSelectorAbierto = !this.pacienteSelectorAbierto;

    if (this.pacienteSelectorAbierto) {
      this.pacientesFiltrados = [...this.pacientes];
      this.pacienteBusqueda = '';
    }
  }

  onPacienteSearch(ev: any) {
    const value = (ev?.detail?.value || '').toLowerCase();
    this.pacienteBusqueda = value;

    this.pacientesFiltrados = this.pacientes.filter(p =>
      String(p.idPaciente).includes(value) ||
      (p.nombreMascota || '').toLowerCase().includes(value) ||
      (p.especie || '').toLowerCase().includes(value) ||
      (p.raza || '').toLowerCase().includes(value)
    );
  }

  seleccionarPaciente(p: Paciente) {
    this.form.patchValue({ idPaciente: String(p.idPaciente) });
    this.pacienteSeleccionadoLabel = `#${p.idPaciente} - ${p.nombreMascota}`;
    this.pacienteSelectorAbierto = false;
  }


  // ❌ Limpiar selección
  clearPacienteSelection() {
    this.selectedPaciente = null;
    this.form.patchValue({ idPaciente: '' });
    this.pacientesFiltrados = [...this.pacientes];
  }

  async save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      (await this.toast.create({
        message: 'Completa los campos obligatorios.',
        duration: 1800,
        color: 'warning'
      })).present();
      return;
    }

    const loader = await this.loading.create({
      message: this.isEdit ? 'Actualizando tratamiento...' : 'Guardando tratamiento...'
    });
    await loader.present();

    const v = this.form.value;
    const payload: Tratamiento = {
      idTratamiento: this.tratamiento?.idTratamiento ?? 0,
      descripcion: String(v.descripcion),
      tipo: String(v.tipo),
      fecha: String(v.fecha),
      idPaciente: Number(v.idPaciente),
    };

    const req$ = this.isEdit
      ? this.service.updateTratamiento(payload)
      : this.service.createTratamiento(payload);

    req$.subscribe({
      next: async () => {
        await loader.dismiss();
        (await this.toast.create({
          message: this.isEdit ? 'Tratamiento actualizado' : 'Tratamiento creado',
          duration: 1500,
          color: 'success'
        })).present();
        this.modal.dismiss(payload, this.isEdit ? 'updated' : 'created');
      },
      error: async (err) => {
        await loader.dismiss();
        console.error('save/update Tratamiento error:', { status: err?.status, body: err?.error });
        const msg =
          (typeof err?.error === 'string' && err.error.length < 200)
            ? err.error
            : (this.isEdit ? 'No se pudo actualizar el tratamiento.' : 'No se pudo crear el tratamiento.');
        (await this.toast.create({
          message: msg,
          duration: 2200,
          color: 'danger'
        })).present();
      }
    });
  }
}
