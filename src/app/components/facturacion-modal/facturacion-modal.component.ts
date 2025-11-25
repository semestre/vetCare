import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonicModule,
  ModalController,
  ToastController,
  LoadingController
} from '@ionic/angular';
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
export class FacturacionModalComponent implements OnInit {

  private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController);
  private service = inject(FacturacionService);
  private toast = inject(ToastController);
  private loading = inject(LoadingController);
  private pacienteService = inject(PacienteService);

  // 👉 se llena cuando es edición
  factura?: Facturacion;

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

  ngOnInit() {
    this.loadPacientes();

    // Si viene factura -> modo edición
    if (this.factura) {
      this.form.patchValue({
        idPaciente: String(this.factura.idPaciente),
        servicios: this.factura.servicios,
        medicamentos: this.factura.medicamentos,
        total: String(this.factura.total),
        fecha: this.factura.fecha,
        metodoPago: this.factura.metodoPago
      });
    }
  }

  close() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  loadPacientes() {
    this.pacienteService.getAllPacientes().subscribe({
      next: (data) => {
        this.pacientes = data;
        this.pacientesFiltrados = [...data];

        // Si estamos editando, rellenar paciente seleccionado
        if (this.factura) {
          const p = this.pacientes.find(px => px.idPaciente === this.factura!.idPaciente);
          if (p) {
            this.selectedPaciente = p;
            this.form.patchValue({ idPaciente: String(p.idPaciente) });
          }
        }
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
      (p.nombreMascota || '').toLowerCase().includes(value) ||
      (p.especie || '').toLowerCase().includes(value) ||
      (p.raza || '').toLowerCase().includes(value) ||
      String(p.idPaciente).includes(value)
    );
  }

  // ✔️ SELECCIONAR PACIENTE
  selectPaciente(p: Paciente) {
    this.selectedPaciente = p;

    this.form.patchValue({
      idPaciente: String(p.idPaciente)
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

  // ✔️ GUARDAR FACTURA (crear o editar)
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

    const loader = await this.loading.create({
      message: this.factura ? 'Actualizando factura...' : 'Guardando factura...'
    });
    await loader.present();

    const { idPaciente, servicios, medicamentos, total, fecha, metodoPago } = this.form.value;

    const payload: Facturacion = {
      idFactura: this.factura?.idFactura ?? 0,
      idPaciente: Number(idPaciente),
      servicios: String(servicios),
      medicamentos: String(medicamentos ?? ''),
      total: parseFloat(String(total)),
      fecha: String(fecha),
      metodoPago: String(metodoPago)
    };

    const isEdit = !!this.factura;

    const request$ = isEdit
      ? this.service.updateFactura(payload)
      : this.service.createFactura(payload);

    request$.subscribe({
      next: async () => {
        await loader.dismiss();
        (await this.toast.create({
          message: isEdit ? 'Factura actualizada' : 'Factura creada',
          duration: 1500,
          color: 'success',
          icon: 'checkmark-circle-outline'
        })).present();

        // devolvemos la factura al padre
        this.modalCtrl.dismiss(payload, isEdit ? 'updated' : 'created');
      },
      error: async (err) => {
        await loader.dismiss();
        const msg = (typeof err?.error === 'string' && err.error.length < 200)
          ? err.error
          : (this.factura ? 'No se pudo actualizar la factura.' : 'No se pudo crear la factura.');

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
