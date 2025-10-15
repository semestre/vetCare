import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController, LoadingController } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Propietario } from 'src/app/models/propetario.model';
import { PropietarioService } from 'src/app/services/propetario/propetario.service';

@Component({
  selector: 'app-propietario-modal',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './propietario-modal.component.html',
  styleUrls: ['./propietario-modal.component.scss'],
})
export class PropietarioModalComponent {
  private fb = inject(FormBuilder);
  private modal = inject(ModalController);
  private service = inject(PropietarioService);
  private toast = inject(ToastController);
  private loading = inject(LoadingController);

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    telefono: ['', [Validators.required]],
    direccion: ['', [Validators.required, Validators.minLength(5)]],
  });

  close() { this.modal.dismiss(null, 'cancel'); }

  async save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      (await this.toast.create({ message: 'Completa los campos requeridos.', duration: 1800, color: 'warning' })).present();
      return;
    }

    const loader = await this.loading.create({ message: 'Guardando propietario...' });
    await loader.present();

    const payload: Propietario = {
      idPropietario: 0, // lo asigna el backend
      nombre: String(this.form.value.nombre),
      telefono: String(this.form.value.telefono),
      direccion: String(this.form.value.direccion)
    };

    this.service.createPropietario(payload).subscribe({
      next: async () => {
        await loader.dismiss();
        (await this.toast.create({ message: 'Propietario creado', duration: 1500, color: 'success' })).present();
        this.modal.dismiss(true, 'created'); // para recargar la lista
      },
      error: async (err) => {
        await loader.dismiss();
        console.error('createPropietario error:', { status: err?.status, body: err?.error });
        const msg = (typeof err?.error === 'string' && err.error.length < 200) ? err.error : 'No se pudo crear el propietario.';
        (await this.toast.create({ message: msg, duration: 2200, color: 'danger' })).present();
      }
    });
  }
}
