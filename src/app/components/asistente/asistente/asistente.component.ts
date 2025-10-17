import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // <-- add this

@Component({
  selector: 'app-asistente',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
  templateUrl: './asistente.component.html',
  styleUrls: ['./asistente.component.scss'],
})
export class AsistenteComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
