// src/app/home/home.page.ts
import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ControlAccesoService } from 'src/app/services/controlAcceso/control-acceso.service';
import { ControlAcceso } from 'src/app/models/controlAcceso.model';
import { ToastController } from '@ionic/angular';

// ✅ servicio de Firebase (según tu ruta actual)
import { AuthService } from 'src/app/services/auth.service/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class HomePage {
  username = '';
  password = '';

  private router = inject(Router);
  private controlAccesoService = inject(ControlAccesoService);
  private toast = inject(ToastController);
  private authService = inject(AuthService);

  // ========= LOGIN NORMAL =========
  login() {
    this.controlAccesoService.getAllUsuarios().subscribe({
      next: (users: ControlAcceso[]) => {
        console.log('🟢 All users fetched from API:', users);

        const foundUser = users.find(
          (u) =>
            u.nombreUsuario === this.username &&
            u.password === this.password
        );

        if (foundUser) {
          console.log('✅ Login successful for:', foundUser.nombreUsuario);
          this.router.navigate([`/${foundUser.rol}`]);
        } else {
          console.log('❌ Invalid credentials');
          this.toast
            .create({
              message: 'Usuario o contraseña incorrectos',
              duration: 1800,
              color: 'danger',
            })
            .then((t) => t.present());
        }
      },
      error: async (err) => {
        console.error('Error fetching usuarios', err);
        (
          await this.toast.create({
            message: 'No se pudo conectar al servidor',
            duration: 1800,
            color: 'danger',
          })
        ).present();
      },
    });
  }

  // ========= LOGIN CON GOOGLE =========
  async onGoogleLogin() {
    try {
      const userFirebase = await this.authService.loginWithGoogle();
      const email = userFirebase.email;

      if (!email) {
        throw new Error('El usuario de Google no tiene email');
      }

      this.controlAccesoService.loginGoogle(email).subscribe({
        next: async (user: ControlAcceso | null) => {
          console.log('✅ Usuario BD (Google):', user);

          // Protección por si backend llegara a devolver null
          if (!user) {
            (
              await this.toast.create({
                message: 'No se pudo registrar/obtener el usuario de Google',
                duration: 2000,
                color: 'danger',
              })
            ).present();
            return;
          }

          (
            await this.toast.create({
              message: `Bienvenido ${user.nombreUsuario}`,
              duration: 1500,
              color: 'success',
            })
          ).present();

          this.router.navigate([`/${user.rol}`]);
        },
        error: async (err) => {
          console.error('Error login-google back', err);
          (
            await this.toast.create({
              message: 'No se pudo validar el usuario de Google en el servidor',
              duration: 2000,
              color: 'danger',
            })
          ).present();
        },
      });

    } catch (error: any) {
      console.error('Error al iniciar sesión con Google', error);
      (
        await this.toast.create({
          message: 'No se pudo iniciar sesión con Google',
          duration: 1800,
          color: 'danger',
        })
      ).present();
    }
  }
}
