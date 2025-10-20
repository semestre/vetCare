import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController, LoadingController } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ControlAccesoService } from 'src/app/services/controlAcceso/control-acceso.service';
import { ControlAcceso } from 'src/app/models/controlAcceso.model';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-control-usuario-modal',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './control-acceso-modal.component.html',
  styleUrls: ['./control-acceso-modal.component.scss'],
})
export class ControlAccesoModalComponent {
  private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController);
  private service = inject(ControlAccesoService);
  private toast = inject(ToastController);
  private loading = inject(LoadingController);

  form = this.fb.group({
    nombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    rol: ['Veterinario', Validators.required]
  });

  showPass = false;

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
        icon: 'alert-circle-outline',
        position: 'top'
      })).present();
      return;
    }

    const loading = await this.loading.create({ message: 'Creando usuario...' });
    await loading.present();

    const { nombreUsuario, password, rol } = this.form.value;

    const payload: ControlAcceso = {
      idUsuario: 0, // lo asigna el backend
      nombreUsuario: String(nombreUsuario),
      password: String(password),
      rol: String(rol)
    };

    this.service.createUsuario(payload).pipe(take(1)).subscribe({
      next: async (res) => {
        try {
          await loading.dismiss();
        } catch {}
        (await this.toast.create({
          message: 'Usuario creado',
          duration: 1500,
          color: 'success',
          icon: 'checkmark-circle-outline',
          position: 'top'
        })).present();
        this.modalCtrl.dismiss(true, 'created');
      },
      error: async (err) => {
        try {
          await loading.dismiss();
        } catch {}
        console.error('createUsuario error:', { status: err?.status, body: err?.error });
        const msg =
          (typeof err?.error === 'string' && err.error.length < 160)
            ? err.error
            : 'No se pudo crear el usuario.';
        (await this.toast.create({
          message: msg,
          duration: 2500,
          color: 'danger',
          icon: 'close-circle-outline',
          position: 'top',
          buttons: [{ text: 'Cerrar', role: 'cancel' }]
        })).present();
      }
    });
  }
}
