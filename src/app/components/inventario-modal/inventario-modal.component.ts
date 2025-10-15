import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController, LoadingController } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { InventarioService } from 'src/app/services/inventario/inventario.service';
import { Inventario } from 'src/app/models/inventario.model';

@Component({
  selector: 'app-inventario-modal',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './inventario-modal.component.html',
  styleUrls: ['./inventario-modal.component.scss'],
})
export class InventarioModalComponent {
  private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController);
  private service = inject(InventarioService);
  private toast = inject(ToastController);
  private loading = inject(LoadingController);

  hoy = new Date().toISOString().slice(0,10); // YYYY-MM-DD

  form = this.fb.group({
    nombreItem: ['', [Validators.required, Validators.minLength(2)]],
    cantidad: [0, [Validators.required, Validators.min(0)]],
    categoria: ['Medicamento', Validators.required],
    fechaActualizacion: [this.hoy, Validators.required]
  });

  close() { this.modalCtrl.dismiss(null, 'cancel'); }

  async save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      (await this.toast.create({
        message: 'Revisa los campos obligatorios.',
        duration: 1800, color: 'warning', icon: 'alert-circle-outline'
      })).present();
      return;
    }

    const loader = await this.loading.create({ message: 'Guardando ítem...' });
    await loader.present();

    const payload: Inventario = {
      idItem: 0,
      nombreItem: String(this.form.value.nombreItem),
      cantidad: Number(this.form.value.cantidad),
      categoria: String(this.form.value.categoria),
      fechaActualizacion: String(this.form.value.fechaActualizacion)
    };

    this.service.createItem(payload).subscribe({
      next: async () => {
        await loader.dismiss();
        (await this.toast.create({
          message: 'Ítem creado', duration: 1500, color: 'success', icon: 'checkmark-circle-outline'
        })).present();
        this.modalCtrl.dismiss(true, 'created'); // avisa para recargar
      },
      error: async (err) => {
        await loader.dismiss();
        console.error('createItem error:', { status: err?.status, body: err?.error });
        const msg = (typeof err?.error === 'string' && err.error.length < 200) ? err.error : 'No se pudo crear el ítem.';
        (await this.toast.create({
          message: msg, duration: 2500, color: 'danger', icon: 'close-circle-outline'
        })).present();
      }
    });
  }
}
