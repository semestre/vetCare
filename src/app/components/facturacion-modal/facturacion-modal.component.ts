import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController, LoadingController } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FacturacionService } from 'src/app/services/facturacion/facturacion.service';
import { Facturacion } from 'src/app/models/facturacion.model';
import { Paciente } from 'src/app/models/paciente.model';
import { PacienteService } from 'src/app/services/paciente/paciente.service';

@Component({
  selector: 'app-facturacion-modal',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './facturacion-modal.component.html',
  styleUrls: ['./facturacion-modal.component.scss'],
})
export class FacturacionModalComponent {

  private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController);
  private service = inject(FacturacionService);
  private toast = inject(ToastController);
  private loading = inject(LoadingController);

  form = this.fb.group({
    idPaciente: ['', [Validators.required]],
    servicios: ['', [Validators.required, Validators.minLength(3)]],
    medicamentos: [''],
    total: ['', [Validators.required, Validators.min(0)]],
    fecha: ['', [Validators.required]],
    metodoPago: ['Efectivo', Validators.required],
  });

  pacientes: Paciente[] = [];
  pacientesFiltrados: Paciente[] = [];
  selectedPaciente: Paciente | null = null;
  searchPacienteTerm = '';

  constructor(private pacienteService: PacienteService) {}

  ngOnInit() {
    this.loadPacientes();
  }

  close() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  loadPacientes() {
    this.pacienteService.getAllPacientes().subscribe({
      next: (data) => {
        this.pacientes = data;
        this.pacientesFiltrados = [...data];
      },
      error: (err) => console.error('❌ Error loading pacientes:', err)
    });
  }

  // 🔍 BUSCAR
  onSearchPaciente(event: any) {
    const value = (event.target.value || '').toLowerCase().trim();
    this.searchPacienteTerm = value;

    if (!value) {
      this.pacientesFiltrados = [...this.pacientes];
      return;
    }

    this.pacientesFiltrados = this.pacientes.filter(p =>
      p.nombreMascota.toLowerCase().includes(value) ||
      p.especie.toLowerCase().includes(value) ||
      p.raza.toLowerCase().includes(value) ||
      String(p.idPaciente).includes(value)
    );
  }

  // ✔️ SELECCIONAR PACIENTE
  selectPaciente(p: Paciente) {
    this.selectedPaciente = p;

    this.form.patchValue({
      idPaciente: String(p.idPaciente)  // Lo guardamos como STRING para el form
    });

    // Ocultar panel de búsqueda
    this.searchPacienteTerm = '';
    this.pacientesFiltrados = [];
  }

  // ❌ LIMPIAR SELECCIÓN
  clearPacienteSelection() {
    this.selectedPaciente = null;
    this.form.patchValue({ idPaciente: '' });
  }

  // ✔️ GUARDAR FACTURA
  async save() {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      (await this.toast.create({
        message: 'Revisa los campos obligatorios.',
        duration: 1800,
        color: 'warning',
        icon: 'alert-circle-outline'
      })).present();
      return;
    }

    const loader = await this.loading.create({ message: 'Guardando factura...' });
    await loader.present();

    const { idPaciente, servicios, medicamentos, total, fecha, metodoPago } = this.form.value;

    const payload: Facturacion = {
      idFactura: 0,
      idPaciente: Number(idPaciente),
      servicios: String(servicios),
      medicamentos: String(medicamentos ?? ''),
      total: parseFloat(String(total)),
      fecha: String(fecha),
      metodoPago: String(metodoPago)
    };

    this.service.createFactura(payload).subscribe({
      next: async () => {
        await loader.dismiss();
        (await this.toast.create({
          message: 'Factura creada',
          duration: 1500,
          color: 'success',
          icon: 'checkmark-circle-outline'
        })).present();

        this.modalCtrl.dismiss(true, 'created');
      },
      error: async (err) => {
        await loader.dismiss();
        const msg = (typeof err?.error === 'string' && err.error.length < 200)
          ? err.error
          : 'No se pudo crear la factura.';

        (await this.toast.create({
          message: msg,
          duration: 2500,
          color: 'danger',
          icon: 'close-circle-outline'
        })).present();
      }
    });
  }
}