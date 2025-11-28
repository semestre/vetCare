// src/app/pages/login/login.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonImg,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastController } from '@ionic/angular';

import { AuthService } from 'src/app/services/auth.service/auth.service';
import { ControlAccesoService } from 'src/app/services/controlAcceso/control-acceso.service';
import { ControlAcceso } from 'src/app/models/controlAcceso.model';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonImg,
  ],
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toast: ToastController,
    private controlAccesoService: ControlAccesoService
  ) {}

  // ========= LOGIN NORMAL (JAVA) =========
  login() {
    // Aquí puedes conectar tu login normal contra el backend,
    // por ahora lo dejo como lo tenías:
    console.log('Login normal:', this.username);
  }

  // ========= LOGIN CON GOOGLE (BACK + FRONT) =========
  async onGoogleLogin() {
    try {
      const userFirebase = await this.authService.loginWithGoogle();
      console.log('✅ Google login OK:', userFirebase);

      const email = userFirebase?.email;

      if (!email) {
        (await this.toast.create({
          message: 'No se pudo obtener el email de Google.',
          duration: 2000,
          color: 'danger',
        })).present();
        return;
      }

      this.controlAccesoService.loginGoogle(email).subscribe({
        next: async (usuarioBackend: ControlAcceso) => {
          console.log('🟢 Usuario devuelto por backend:', usuarioBackend);

          const rol = (usuarioBackend.rol || '').toLowerCase();

          if (rol.includes('admin')) {
            this.router.navigate(['/administrador']);
          } else if (rol.includes('asist')) {
            this.router.navigate(['/asistente']);
          } else {
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
      // 👇 AQUÍ LOGEAMOS EL ERROR PARA VER EL CÓDIGO EXACTO
      console.error('Error al iniciar sesión con Google', error?.code, error?.message);

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
