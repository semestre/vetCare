import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular'; // all Ionic components here
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // for [(ngModel)]
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  login() {
    const users = [
      { username: 'dr_juan', password: '12345', route: '/veterinario' },
      { username: 'ana_asistente', password: 'abcde', route: '/asistente' },
      { username: 'admin1', password: 'adminpass', route: '/administrador' },
    ];

    const foundUser = users.find(
      (u) => u.username === this.username && u.password === this.password
    );

    if (foundUser) {
      console.log('✅ Login successful for:', foundUser.username);
      this.router.navigate([foundUser.route]);
    } else {
      console.log('❌ Invalid credentials');
      alert('Wrong username or password, try again!');
    }
  }
}