import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    CommonModule,
    IonContent,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
  ],
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

  async onGoogleLogin() {
    try {
      await this.authService.loginWithGoogle();
      // aquí decides a dónde mandar al usuario después
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error al iniciar sesión con Google', error);
    }
  }

  login() {
    // Implementar login normal aquí
    console.log('Login normal:', this.username);
  }
}
