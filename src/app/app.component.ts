import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [
    IonicModule, 
    CommonModule,
    RouterModule,
  ],
})
export class AppComponent {
  constructor() {}
}
