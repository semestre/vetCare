import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // <-- add this


@Component({
  selector: 'app-veterinario',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
  templateUrl: './veterinario.component.html',
  styleUrls: ['./veterinario.component.scss'],
})
export class VeterinarioComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
