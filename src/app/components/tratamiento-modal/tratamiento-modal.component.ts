import { Component, inject } from '@angular/core';
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
export class TratamientoModalComponent {
  private fb = inject(FormBuilder);
  private modal = inject(ModalController);
  private service = inject(TratamientoService);
  private toast = inject(ToastController);
  private loading = inject(LoadingController);

  hoy = new Date().toISOString().slice(0, 10);

  // 🔹 OJO: idPaciente como string en el form (convertimos a number al guardar)
  form = this.fb.group({
    descripcion: ['', [Validators.required, Validators.minLength(3)]],
    tipo: ['vacuna', Validators.required],         // valores: vacuna | medicamento | procedimiento
    fecha: [this.hoy, Validators.required],        // YYYY-MM-DD
    idPaciente: ['', [Validators.required]],       // string en el form
  });

  // 🔹 Datos de pacientes y búsqueda
  pacientes: Paciente[] = [];
  pacientesFiltrados: Paciente[] = [];
  selectedPaciente: Paciente | null = null;
  searchPacienteTerm = '';

  constructor(private pacienteService: PacienteService) {}

  ngOnInit() {
    this.loadPacientes();
  }

  close() {
    this.modal.dismiss(null, 'cancel');
  }

  loadPacientes() {
    this.pacienteService.getAllPacientes().subscribe({
      next: (data) => {
        console.log('✅ Pacientes loaded:', data);
        this.pacientes = data;
        this.pacientesFiltrados = [...data];
      },
      error: (err) => {
        console.error('❌ Error loading pacientes:', err);
      }
    });
  }

  // 🔍 Buscar pacientes
  onSearchPaciente(event: any) {
    const value = (event.target.value || '').toLowerCase().trim();
    this.searchPacienteTerm = value;

    if (!value) {
      this.pacientesFiltrados = [...this.pacientes];
      return;
    }

    this.pacientesFiltrados = this.pacientes.filter(p =>
      (p.nombreMascota || '').toLowerCase().includes(value) ||
      (p.especie || '').toLowerCase().includes(value) ||
      (p.raza || '').toLowerCase().includes(value) ||
      String(p.idPaciente).includes(value)
    );
  }

  // ✅ Seleccionar paciente (se convierte en chip y se esconde el buscador)
  selectPaciente(p: Paciente) {
    this.selectedPaciente = p;

    this.form.patchValue({
      idPaciente: String(p.idPaciente)
    });

    // Ocultamos resultados y limpiamos cadena
    this.searchPacienteTerm = '';
    this.pacientesFiltrados = [];
  }

  // ❌ Limpiar selección y volver al buscador
  clearPacienteSelection() {
    this.selectedPaciente = null;
    this.form.patchValue({ idPaciente: '' });
    // restaurar listado completo
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

    const loader = await this.loading.create({ message: 'Guardando tratamiento...' });
    await loader.present();

    const v = this.form.value;
    const payload: Tratamiento = {
      idTratamiento: 0, // lo asigna backend
      descripcion: String(v.descripcion),
      tipo: String(v.tipo),
      fecha: String(v.fecha),
      idPaciente: Number(v.idPaciente), // 👈 aquí lo convertimos a número para el backend
    };

    this.service.createTratamiento(payload).subscribe({
      next: async () => {
        await loader.dismiss();
        (await this.toast.create({
          message: 'Tratamiento creado',
          duration: 1500,
          color: 'success'
        })).present();
        this.modal.dismiss(true, 'created'); // para recargar lista
      },
      error: async (err) => {
        await loader.dismiss();
        console.error('createTratamiento error:', { status: err?.status, body: err?.error });
        const msg = (typeof err?.error === 'string' && err.error.length < 200)
          ? err.error
          : 'No se pudo crear el tratamiento.';
        (await this.toast.create({
          message: msg,
          duration: 2200,
          color: 'danger'
        })).present();
      }
    });
  }
}
