import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController, LoadingController } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FacturacionService } from 'src/app/services/facturacion/facturacion.service';
import { Facturacion } from 'src/app/models/facturacion.model';

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
    fecha: ['', [Validators.required]],               // YYYY-MM-DD
    metodoPago: ['Efectivo', Validators.required],   // Efectivo | Tarjeta | Transferencia
  });

  close() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  async save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      (await this.toast.create({
        message: 'Revisa los campos obligatorios.',
        duration: 1800, color: 'warning', icon: 'alert-circle-outline'
      })).present();
      return;
    }

    const loader = await this.loading.create({ message: 'Guardando factura...' });
    await loader.present();

    const { idPaciente, servicios, medicamentos, total, fecha, metodoPago } = this.form.value;

    // Payload para tu modelo
    const payload: Facturacion = {
      idFactura: 0, // lo asigna el backend
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
          duration: 1500, color: 'success', icon: 'checkmark-circle-outline'
        })).present();
        // avisamos a la lista para recargar
        this.modalCtrl.dismiss(true, 'created');
      },
      error: async (err) => {
        await loader.dismiss();
        console.error('createFactura error:', { status: err?.status, body: err?.error });
        const msg = (typeof err?.error === 'string' && err.error.length < 200) ? err.error : 'No se pudo crear la factura.';
        (await this.toast.create({
          message: msg, duration: 2500, color: 'danger', icon: 'close-circle-outline'
        })).present();
      }
    });
  }
}
