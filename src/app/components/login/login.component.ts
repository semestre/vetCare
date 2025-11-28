import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
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
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
  ],
})
export class LoginComponent {
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
}
