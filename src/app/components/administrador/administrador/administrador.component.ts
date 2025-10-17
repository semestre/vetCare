import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 

@Component({
  selector: 'app-administrador',
  templateUrl: './administrador.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
  styleUrls: ['./administrador.component.scss'],
})
export class AdministradorComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
