import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular'; // all Ionic components here
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // for [(ngModel)]
import { Router } from '@angular/router'; 
import { ControlAccesoService } from 'src/app/services/controlAcceso/control-acceso.service';
import { ControlAcceso } from 'src/app/models/controlAcceso.model';
import { ToastController } from '@ionic/angular';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true, 
  imports: [IonicModule, CommonModule, FormsModule]
})

export class HomePage {
  username = '';
  password = '';

  private router = inject(Router);
  private controlAccesoService = inject(ControlAccesoService);
  private toast = inject(ToastController);

  login() {
    this.controlAccesoService.getAllUsuarios().subscribe({
      next: (users: ControlAcceso[]) => {
        const foundUser = users.find(
          u => u.nombreUsuario === this.username && u.password === this.password
        );

        if (foundUser) {
          console.log('✅ Login successful for:', foundUser.nombreUsuario);
          this.router.navigate([`/${foundUser.rol}`]);
        } else {
          console.log('❌ Invalid credentials');
          this.toast.create({
            message: 'Usuario o contraseña incorrectos',
            duration: 1800,
            color: 'danger'
          }).then(t => t.present());
        }
      },
      error: async (err) => {
        console.error('Error fetching usuarios', err);
        (await this.toast.create({
          message: 'No se pudo conectar al servidor',
          duration: 1800,
          color: 'danger'
        })).present();
      }
    });
  }
}