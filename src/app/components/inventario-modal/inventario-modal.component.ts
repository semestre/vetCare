import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonicModule,
  ModalController,
  ToastController,
  LoadingController
} from '@ionic/angular';
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
export class InventarioModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController);
  private service = inject(InventarioService);
  private toast = inject(ToastController);
  private loading = inject(LoadingController);

  // 👉 se llena cuando abrimos en modo edición
  item?: Inventario;

  hoy = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  form = this.fb.group({
    nombreItem: ['', [Validators.required, Validators.minLength(2)]],
    cantidad: [0, [Validators.required, Validators.min(0)]],
    categoria: ['Medicamento', Validators.required],
    fechaActualizacion: [this.hoy, Validators.required]
  });

  ngOnInit(): void {
    if (this.item) {
      this.form.patchValue({
        nombreItem: this.item.nombreItem,
        cantidad: this.item.cantidad,
        categoria: this.item.categoria,
        fechaActualizacion: this.item.fechaActualizacion
      });
    }
  }

  close() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

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
      message: this.item ? 'Actualizando ítem...' : 'Guardando ítem...'
    });
    await loader.present();

    const payload: Inventario = {
      idItem: this.item?.idItem ?? 0,
      nombreItem: String(this.form.value.nombreItem),
      cantidad: Number(this.form.value.cantidad),
      categoria: String(this.form.value.categoria),
      fechaActualizacion: String(this.form.value.fechaActualizacion)
    };

    const isEdit = !!this.item;

    const req$ = isEdit
      ? this.service.updateItem(payload)
      : this.service.createItem(payload);

    req$.subscribe({
      next: async () => {
        await loader.dismiss();
        (await this.toast.create({
          message: isEdit ? 'Ítem actualizado' : 'Ítem creado',
          duration: 1500,
          color: 'success',
          icon: 'checkmark-circle-outline'
        })).present();

        // devolvemos el ítem al padre
        this.modalCtrl.dismiss(payload, isEdit ? 'updated' : 'created');
      },
      error: async (err) => {
        await loader.dismiss();
        console.error('create/update item error:', { status: err?.status, body: err?.error });
        const msg =
          (typeof err?.error === 'string' && err.error.length < 200)
            ? err.error
            : (this.item ? 'No se pudo actualizar el ítem.' : 'No se pudo crear el ítem.');

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
