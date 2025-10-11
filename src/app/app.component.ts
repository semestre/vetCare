import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ListaCitaComponent } from './components/cita/lista-cita/lista-cita.component';
import { ListaControlAccesoComponent } from './components/controlAcceso/lista-control-acceso/lista-control-acceso.component'; 
import { ListaFacturacionComponent } from './components/facturacion/lista-facturacion/lista-facturacion.component';
import { ListaInventarioComponent } from './components/inventario/lista-inventario/lista-inventario.component';
import { ListaPacienteComponent } from './components/paciente/lista-paciente/lista-paciente.component';
import { ListaPropetarioComponent } from './components/propetario/lista-propetario/lista-propetario.component';
import { ListaTratamientoComponent } from './components/tratamiento/lista-tratamiento/lista-tratamiento.component';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [
    IonicModule, 
    CommonModule,
    ListaCitaComponent,
    RouterModule,
    ListaControlAccesoComponent,
    ListaFacturacionComponent,
    ListaInventarioComponent,
    ListaPacienteComponent,
    ListaPropetarioComponent,
    ListaTratamientoComponent
  ],

})
export class AppComponent {
  constructor() {}
}
