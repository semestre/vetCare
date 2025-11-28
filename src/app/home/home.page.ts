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

  // ========= LOGIN CON GOOGLE (SOLO FRONT) =========
  async onGoogleLogin() {
    try {
      const userFirebase = await this.authService.loginWithGoogle();
      console.log('✅ Google login OK:', userFirebase);

      // Aquí solo redirigimos directo al módulo de veterinario
      this.router.navigate(['/veterinario']);

    } catch (error) {
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
