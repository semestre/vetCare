import { Component, Input, OnInit, inject } from '@angular/core';
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
export class PropietarioModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private modal = inject(ModalController);
  private service = inject(PropietarioService);
  private toast = inject(ToastController);
  private loading = inject(LoadingController);

  // 👉 si viene desde "editar", el padre inyecta el propietario aquí
  @Input() propietario: Propietario | null = null;

  isEdit = false;

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    telefono: ['', [Validators.required]],
    direccion: ['', [Validators.required, Validators.minLength(5)]],
  });

  ngOnInit(): void {
    if (this.propietario && this.propietario.idPropietario && this.propietario.idPropietario !== 0) {
      this.isEdit = true;
      this.form.patchValue({
        nombre: this.propietario.nombre,
        telefono: this.propietario.telefono,
        direccion: this.propietario.direccion,
      });
    }
  }

  close() {
    this.modal.dismiss(null, 'cancel');
  }

  async save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      (await this.toast.create({
        message: 'Completa los campos requeridos.',
        duration: 1800,
        color: 'warning'
      })).present();
      return;
    }

    const loader = await this.loading.create({
      message: this.isEdit ? 'Actualizando propietario...' : 'Guardando propietario...'
    });
    await loader.present();

    const base: Propietario = {
      idPropietario: this.propietario?.idPropietario ?? 0,
      nombre: String(this.form.value.nombre),
      telefono: String(this.form.value.telefono),
      direccion: String(this.form.value.direccion)
    };

    const req$ = this.isEdit
      ? this.service.updatePropietario(base)
      : this.service.createPropietario(base);

    req$.subscribe({
      next: async () => {
        await loader.dismiss();
        (await this.toast.create({
          message: this.isEdit ? 'Propietario actualizado' : 'Propietario creado',
          duration: 1500,
          color: 'success'
        })).present();
        this.modal.dismiss(base, this.isEdit ? 'updated' : 'created');
      },
      error: async (err) => {
        await loader.dismiss();
        console.error('propietario save/update error:', { status: err?.status, body: err?.error });
        const msg =
          (typeof err?.error === 'string' && err.error.length < 200)
            ? err.error
            : (this.isEdit ? 'No se pudo actualizar el propietario.' : 'No se pudo crear el propietario.');
        (await this.toast.create({
          message: msg,
          duration: 2200,
          color: 'danger'
        })).present();
      }
    });
  }
}
