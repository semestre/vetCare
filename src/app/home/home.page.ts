// src/app/home/home.page.ts
import { Component, inject } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ControlAccesoService } from 'src/app/services/controlAcceso/control-acceso.service';
import { ControlAcceso } from 'src/app/models/controlAcceso.model';
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

  // ========= LOGIN NORMAL (JAVA) =========
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

  // ========= LOGIN CON GOOGLE (BACK + FRONT) =========
  async onGoogleLogin() {
    try {
      // 1️⃣ Login con Firebase (Google)
      const userFirebase = await this.authService.loginWithGoogle();
      console.log('✅ Google login OK:', userFirebase);

      // 2️⃣ Sacar el email del usuario de Google
      const email = userFirebase?.email;

      if (!email) {
        (await this.toast.create({
          message: 'No se pudo obtener el email de Google.',
          duration: 2000,
          color: 'danger',
        })).present();
        return;
      }

      // 3️⃣ Llamar a tu backend para registrar / obtener al usuario
      this.controlAccesoService.loginGoogle(email).subscribe({
        next: async (usuarioBackend: ControlAcceso) => {
          console.log('🟢 Usuario devuelto por backend:', usuarioBackend);

          // 4️⃣ Redirigir según el rol que venga del backend
          const rol = (usuarioBackend.rol || '').toLowerCase();

          if (rol.includes('admin')) {
            this.router.navigate(['/administrador']);
          } else if (rol.includes('asist')) {
            this.router.navigate(['/asistente']);
          } else {
            // por defecto veterinario
            this.router.navigate(['/veterinario']);
          }

          (await this.toast.create({
            message: `Bienvenido, ${usuarioBackend.nombreUsuario || email}`,
            duration: 1800,
            color: 'success',
          })).present();
        },
        error: async (err) => {
          console.error('❌ Error al registrar/login con Google en backend', err);
          (await this.toast.create({
            message: 'No se pudo conectar con el servidor para Google Login.',
            duration: 2000,
            color: 'danger',
          })).present();
        }
      });

    } catch (error: any) {
      console.error('Error al iniciar sesión con Google', error?.code, error?.message);

      // ⚠️ Si el popup fue cancelado o ya había otra petición, no mostramos error feo
      if (
        error?.code === 'auth/cancelled-popup-request' ||
        error?.code === 'auth/popup-closed-by-user'
      ) {
        // El usuario cerró el popup o se disparó otro login en paralelo
        // Puedes poner un toast suave si quieres, o simplemente no hacer nada
        return;
      }

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
