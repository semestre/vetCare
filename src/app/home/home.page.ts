import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular'; // all Ionic components here
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // for [(ngModel)]

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

  constructor() {}

  login() {
    console.log('Login clicked', this.username, this.password);
  }
}