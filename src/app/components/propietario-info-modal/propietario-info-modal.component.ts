import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { Propietario } from 'src/app/models/propetario.model';

@Component({
  selector: 'app-propietario-info-modal',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './propietario-info-modal.component.html',
  styleUrls: ['./propietario-info-modal.component.scss']
})
export class PropietarioInfoModalComponent {

  @Input() propietario!: Propietario;

  private modalCtrl = inject(ModalController);

  close() {
    this.modalCtrl.dismiss(null, 'close');
  }
}
