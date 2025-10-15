import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController, LoadingController } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Tratamiento } from 'src/app/models/tratamiento.model';
import { TratamientoService } from 'src/app/services/tratamiento/tratamiento.service';

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

  hoy = new Date().toISOString().slice(0,10);

  form = this.fb.group({
    descripcion: ['', [Validators.required, Validators.minLength(3)]],
    tipo: ['Vacuna', Validators.required], // Vacuna | Higiene | Cirugía | Desparasitación | Control | Otro
    fecha: [this.hoy, Validators.required], // YYYY-MM-DD
    idPaciente: [null as unknown as number, [Validators.required, Validators.min(1)]],
  });

  close() { this.modal.dismiss(null, 'cancel'); }

  async save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      (await this.toast.create({ message: 'Completa los campos obligatorios.', duration: 1800, color: 'warning' })).present();
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
      idPaciente: Number(v.idPaciente),
    };

    this.service.createTratamiento(payload).subscribe({
      next: async () => {
        await loader.dismiss();
        (await this.toast.create({ message: 'Tratamiento creado', duration: 1500, color: 'success' })).present();
        this.modal.dismiss(true, 'created'); // para recargar lista
      },
      error: async (err) => {
        await loader.dismiss();
        console.error('createTratamiento error:', { status: err?.status, body: err?.error });
        const msg = (typeof err?.error === 'string' && err.error.length < 200) ? err.error : 'No se pudo crear el tratamiento.';
        (await this.toast.create({ message: msg, duration: 2200, color: 'danger' })).present();
      }
    });
  }
}
