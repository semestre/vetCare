import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController, LoadingController } from '@ionic/angular';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ControlAccesoService } from 'src/app/services/controlAcceso/control-acceso.service';
import { ControlAcceso } from 'src/app/models/controlAcceso.model';

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

  // Formulario
  form = this.fb.group({
    nombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    rol: ['Veterinario', Validators.required] // opciones: Administrador | Veterinario | Recepcionista
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
        icon: 'alert-circle-outline'
      })).present();
      return;
    }

    const loading = await this.loading.create({ message: 'Creando usuario...' });
    await loading.present();

    // Armamos el payload de acuerdo a tu modelo
    const { nombreUsuario, password, rol } = this.form.value;
    const payload: ControlAcceso = {
      idUsuario: 0, // el backend debe asignarlo
      nombreUsuario: String(nombreUsuario),
      password: String(password),
      rol: String(rol)
    };

    this.service.createUsuario(payload).subscribe({
      next: async (res) => {
        await loading.dismiss();
        (await this.toast.create({
          message: 'Usuario creado',
          duration: 1500,
          color: 'success',
          icon: 'checkmark-circle-outline'
        })).present();
        this.modalCtrl.dismiss(true, 'created');
      },
      error: async (err) => {
        await loading.dismiss();
        console.error('createUsuario error:', { status: err?.status, body: err?.error });
        const msg = (typeof err?.error === 'string' && err.error.length < 160) ? err.error : 'No se pudo crear el usuario.';
        (await this.toast.create({
          message: msg,
          duration: 2200,
          color: 'danger',
          icon: 'close-circle-outline'
        })).present();
      }
    });
  }
}
