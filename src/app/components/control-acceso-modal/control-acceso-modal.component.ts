import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonicModule,
  ModalController,
  ToastController,
  LoadingController
} from '@ionic/angular';
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
export class ControlAccesoModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController);
  private service = inject(ControlAccesoService);
  private toast = inject(ToastController);
  private loading = inject(LoadingController);

  // 👉 se llena cuando abrimos en modo edición
  usuario?: ControlAcceso;

  form = this.fb.group({
    nombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    rol: ['Veterinario', Validators.required]
  });

  showPass = false;

  ngOnInit(): void {
    // Si viene un usuario, es modo edición → rellenamos form
    if (this.usuario) {
      this.form.patchValue({
        nombreUsuario: this.usuario.nombreUsuario,
        password: this.usuario.password,
        rol: this.usuario.rol
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
        icon: 'alert-circle-outline',
        position: 'top'
      })).present();
      return;
    }

    const loading = await this.loading.create({
      message: this.usuario ? 'Actualizando usuario...' : 'Creando usuario...'
    });
    await loading.present();

    const { nombreUsuario, password, rol } = this.form.value;

    const payload: ControlAcceso = {
      idUsuario: this.usuario?.idUsuario ?? 0, // 0 en crear, id real en editar
      nombreUsuario: String(nombreUsuario),
      password: String(password),
      rol: String(rol)
    };

    const isEdit = !!this.usuario;

    const req$ = isEdit
      ? this.service.updateUsuario(payload).pipe(take(1))
      : this.service.createUsuario(payload).pipe(take(1));

    req$.subscribe({
      next: async (res) => {
        try { await loading.dismiss(); } catch {}

        (await this.toast.create({
          message: res?.msg ?? (isEdit ? 'Usuario actualizado' : 'Usuario creado'),
          duration: 1500,
          color: 'success',
          icon: 'checkmark-circle-outline',
          position: 'top'
        })).present();

        // 👇 devolvemos el usuario al padre para actualizar la lista sin recargar todo
        this.modalCtrl.dismiss(payload, isEdit ? 'updated' : 'created');
      },
      error: async (err) => {
        try { await loading.dismiss(); } catch {}
        console.error('create/update usuario error:', { status: err?.status, body: err?.error });
        const msg =
          (typeof err?.error === 'string' && err.error.length < 160)
            ? err.error
            : (this.usuario ? 'No se pudo actualizar el usuario.' : 'No se pudo crear el usuario.');
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
