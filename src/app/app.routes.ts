import { Routes } from '@angular/router';
import { ListaCitaComponent } from './components/cita/lista-cita/lista-cita.component';
import { ListaControlAccesoComponent } from './components/controlAcceso/lista-control-acceso/lista-control-acceso.component';
import { ListaFacturacionComponent } from './components/facturacion/lista-facturacion/lista-facturacion.component';
import { ListaInventarioComponent } from './components/inventario/lista-inventario/lista-inventario.component';
import { ListaPacienteComponent } from './components/paciente/lista-paciente/lista-paciente.component'; 
import { ListaPropetarioComponent } from './components/propetario/lista-propetario/lista-propetario.component';
import { ListaTratamientoComponent } from './components/tratamiento/lista-tratamiento/lista-tratamiento.component';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'citas',
    component: ListaCitaComponent
  },
  {
    path: 'controlAcceso',
    component: ListaControlAccesoComponent
  },
  {
    path: 'facturacion',
    component: ListaFacturacionComponent
  },
  {
    path: 'inventario',
    component: ListaInventarioComponent
  },
  {
    path: 'paciente',
    component: ListaPacienteComponent
  },
  {
    path: 'propetario',
    component: ListaPropetarioComponent
  },
  {
    path: 'tratamiento',
    component: ListaTratamientoComponent
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
];
