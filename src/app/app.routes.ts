import { Routes } from '@angular/router';
import { ListaCitaComponent } from './components/cita/lista-cita/lista-cita.component';
import { ListaControlAccesoComponent } from './components/controlAcceso/lista-control-acceso/lista-control-acceso.component';
import { ListaFacturacionComponent } from './components/facturacion/lista-facturacion/lista-facturacion.component';
import { ListaInventarioComponent } from './components/inventario/lista-inventario/lista-inventario.component';
import { ListaPacienteComponent } from './components/paciente/lista-paciente/lista-paciente.component'; 
import { ListaTratamientoComponent } from './components/tratamiento/lista-tratamiento/lista-tratamiento.component';

import { VeterinarioComponent } from './components/veterinario/veterinario/veterinario.component';
import { AsistenteComponent } from './components/asistente/asistente/asistente.component';
import { AdministradorComponent } from './components/administrador/administrador/administrador.component';
import { ListaPropetarioComponent } from './components/propetario/lista-propetario/lista-propetario.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage),
    pathMatch: 'full'
  },
  {
    path: 'veterinario',
    loadComponent: () => import('./components/veterinario/veterinario/veterinario.component').then(m => m.VeterinarioComponent),
    children: [
      {
        path: 'paciente',
        loadComponent: () => import('./components/paciente/lista-paciente/lista-paciente.component').then(m => m.ListaPacienteComponent)
      },
      {
        path: 'citas',
        loadComponent: () => import('./components/cita/lista-cita/lista-cita.component').then(m => m.ListaCitaComponent)
      },
      {
        path: 'tratamiento',
        loadComponent: () => import('./components/tratamiento/lista-tratamiento/lista-tratamiento.component').then(m => m.ListaTratamientoComponent)
      },
      {
        path: 'inventario',
        loadComponent: () => import('./components/inventario/lista-inventario/lista-inventario.component').then(m => m.ListaInventarioComponent)
      },
      {
        path: '',
        redirectTo: 'paciente', // default tab
        pathMatch: 'full'
      }
    ]
  },

  // Asistente Dashboard: Tabs → facturacion, paciente, propietario
{
  path: 'asistente',
  loadComponent: () =>
    import('./components/asistente/asistente/asistente.component').then(
      (m) => m.AsistenteComponent
    ),
  children: [
    {
      path: 'facturacion',
      loadComponent: () =>
        import('./components/facturacion/lista-facturacion/lista-facturacion.component').then(
          (m) => m.ListaFacturacionComponent
        )
    },
    {
      path: 'citas',
      loadComponent: () =>
        import('./components/cita/lista-cita/lista-cita.component').then(
          (m) => m.ListaCitaComponent
        )
    },
    {
      path: 'paciente',
      loadComponent: () =>
        import('./components/paciente/lista-paciente/lista-paciente.component').then(
          (m) => m.ListaPacienteComponent
        )
    },
    {
      path: 'propietario',
      loadComponent: () =>
        import('./components/propetario/lista-propetario/lista-propetario.component').then(
          (m) => m.ListaPropetarioComponent
        )
    },
    // Default tab
    {
      path: '',
      redirectTo: 'facturacion',
      pathMatch: 'full'
    }
  ]
},


  // Administrador Dashboard: All tabs
{
  path: 'administrador',
  loadComponent: () =>
    import('./components/administrador/administrador/administrador.component').then(
      (m) => m.AdministradorComponent
    ),
  children: [
    {
      path: 'citas',
      loadComponent: () =>
        import('./components/cita/lista-cita/lista-cita.component').then(
          (m) => m.ListaCitaComponent
        )
    },
    {
      path: 'controlAcceso',
      loadComponent: () =>
        import('./components/controlAcceso/lista-control-acceso/lista-control-acceso.component').then(
          (m) => m.ListaControlAccesoComponent
        )
    },
    {
      path: 'facturacion',
      loadComponent: () =>
        import('./components/facturacion/lista-facturacion/lista-facturacion.component').then(
          (m) => m.ListaFacturacionComponent
        )
    },
    {
      path: 'inventario',
      loadComponent: () =>
        import('./components/inventario/lista-inventario/lista-inventario.component').then(
          (m) => m.ListaInventarioComponent
        )
    },
    {
      path: 'paciente',
      loadComponent: () =>
        import('./components/paciente/lista-paciente/lista-paciente.component').then(
          (m) => m.ListaPacienteComponent
        )
    },
    {
      path: 'propietario',
      loadComponent: () =>
        import('./components/propetario/lista-propetario/lista-propetario.component').then(
          (m) => m.ListaPropetarioComponent
        )
    },
    {
      path: 'tratamiento',
      loadComponent: () =>
        import('./components/tratamiento/lista-tratamiento/lista-tratamiento.component').then(
          (m) => m.ListaTratamientoComponent
        )
    },
    // Default tab for admin
    {
      path: '',
      redirectTo: 'citas',
      pathMatch: 'full'
    }
  ]
},

// Fallback: any unknown path goes to login/home
{
  path: '**',
  redirectTo: ''
}

];




// {
  //   path: 'home',
  //   loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  // },
  // {
  //   path: 'citas',
  //   component: ListaCitaComponent
  // },
  // {
  //   path: 'controlAcceso',
  //   component: ListaControlAccesoComponent
  // },
  // {
  //   path: 'facturacion',
  //   component: ListaFacturacionComponent
  // },
  // {
  //   path: 'inventario',
  //   component: ListaInventarioComponent
  // },
  // {
  //   path: 'paciente',
  //   component: ListaPacienteComponent
  // },
  // {
  //   path: 'propetario',
  //   component: ListaPropetarioComponent
  // },
  // {
  //   path: 'tratamiento',
  //   component: ListaTratamientoComponent
  // },
  // {
  //   path: '',
  //   redirectTo: 'home',
  //   pathMatch: 'full'
  // },