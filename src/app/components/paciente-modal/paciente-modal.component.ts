import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Paciente } from 'src/app/models/paciente.model';
import { PacienteService } from 'src/app/services/paciente/paciente.service';
import { Propietario } from 'src/app/models/propetario.model';
import { PropietarioService } from 'src/app/services/propetario/propetario.service';

@Component({
  selector: 'app-paciente-modal',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './paciente-modal.component.html',
  styleUrls: ['./paciente-modal.component.scss'],
})
export class PacienteModalComponent implements OnInit {
  private modalCtrl = inject(ModalController);
  private toast = inject(ToastController);
  private pacienteService = inject(PacienteService);
  private propietarioService = inject(PropietarioService);

  // Dropdown propietario
  propietarioSelectorAbierto = false;
  propietarioBusqueda = '';
  propietariosFiltrados: Propietario[] = [];
  propietarioSeleccionadoLabel = '';
  intentoGuardar = false;


  // 👉 si venimos de "nuevo", se queda con idPaciente = 0
  // si venimos de "editar", el padre inyecta un objeto aquí vía componentProps
  paciente: Paciente = {
    idPaciente: 0,
    nombreMascota: '',
    especie: '',
    raza: '',
    edad: 0,
    historialMedico: '',
    idPropietario: 0
  };

  propietarios: Propietario[] = [];
  cargando = false;

  ngOnInit() {
    this.loadPropietarios();
  }

  loadPropietarios() {
    this.propietarioService.getAllPropietarios().subscribe({
      next: (data) => {
        this.propietarios = data;
        this.propietariosFiltrados = [...data];

        // Preseleccionar propietario si estamos editando
        if (this.paciente.idPropietario) {
          const pr = this.propietarios.find(x => x.idPropietario === this.paciente.idPropietario);
          if (pr) {
            this.propietarioSeleccionadoLabel = `${pr.idPropietario} - ${pr.nombre}`;
          }
        }
      },
      error: (err) => console.error('❌ Error loading propietarios:', err)
    });
  }


  togglePropietarioSelector() {
    this.propietarioSelectorAbierto = !this.propietarioSelectorAbierto;

    if (this.propietarioSelectorAbierto) {
      this.propietariosFiltrados = [...this.propietarios];
      this.propietarioBusqueda = '';
    }
  }



  onPropietarioSearch(ev: any) {
    const value = (ev?.detail?.value || '').toLowerCase();
    this.propietarioBusqueda = value;

    this.propietariosFiltrados = this.propietarios.filter(pr =>
      String(pr.idPropietario).includes(value) ||
      (pr.nombre || '').toLowerCase().includes(value)
    );
  }

  seleccionarPropietario(pr: Propietario) {
    this.paciente.idPropietario = pr.idPropietario;
    this.propietarioSeleccionadoLabel = `${pr.idPropietario} - ${pr.nombre}`;
    this.propietarioSelectorAbierto = false;
  }


  async guardar() {
    if (!this.paciente.nombreMascota || !this.paciente.especie) {
      (await this.toast.create({
        message: 'Por favor, completa al menos nombre y especie.',
        duration: 1800,
        color: 'warning'
      })).present();
      return;
    }

    this.cargando = true;
    this.intentoGuardar = true;

    if (this.paciente.idPropietario === 0) {
      (await this.toast.create({
        message: 'Selecciona un propietario.',
        duration: 1500,
        color: 'warning'
      })).present();
      return;
    }



    const esEdicion = !!this.paciente.idPaciente && this.paciente.idPaciente !== 0;
    const req$ = esEdicion
      ? this.pacienteService.updatePaciente(this.paciente)
      : this.pacienteService.createPaciente(this.paciente);

    req$.subscribe({
      next: async () => {
        this.cargando = false;
        (await this.toast.create({
          message: esEdicion
            ? 'Paciente actualizado correctamente ✅'
            : 'Paciente registrado correctamente ✅',
          duration: 1500,
          color: 'success'
        })).present();
        this.modalCtrl.dismiss(this.paciente, esEdicion ? 'updated' : 'created');
      },
      error: async (err) => {
        console.error('Error al guardar/actualizar paciente:', err);
        this.cargando = false;
        (await this.toast.create({
          message: esEdicion
            ? 'Error al actualizar paciente ❌'
            : 'Error al registrar paciente ❌',
          duration: 1800,
          color: 'danger'
        })).present();
      }
    });
  }

  cerrar() {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
