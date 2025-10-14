import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Facturacion } from 'src/app/models/facturacion.model';
import { FacturacionService } from 'src/app/services/facturacion/facturacion.service';
import { ModalController } from '@ionic/angular';
import { FacturacionModalComponent } from 'src/app/components/facturacion-modal/facturacion-modal.component';


@Component({
  selector: 'app-lista-facturacion',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './lista-facturacion.component.html',
  styleUrls: ['./lista-facturacion.component.scss']
})
export class ListaFacturacionComponent implements OnInit {

  private factService = inject(FacturacionService);
  private toast = inject(ToastController);
  private modalCtrl = inject(ModalController);

  facturas: Facturacion[] = [
    { idFactura: 1, idPaciente: 201, servicios: 'Consulta general', medicamentos: 'Vacuna antirrábica', total: 500,  fecha: '2025-10-12', metodoPago: 'Efectivo' },
    { idFactura: 2, idPaciente: 202, servicios: 'Cirugía menor',    medicamentos: 'Anestesia local',    total: 1500, fecha: '2025-10-13', metodoPago: 'Tarjeta' }
  ];

  // estado UI
  loading = true;
  error: string | null = null;

  // búsqueda + filtro método
  searchTerm = '';
  metodo = 'Todos'; // 'Todos' | 'Efectivo' | 'Tarjeta' | 'Transferencia'

  ngOnInit(): void {
    this.load();
  }

  load(event?: CustomEvent) {
    this.loading = !event;
    this.error = null;

    // Si aún no tienes API, esto deja la demo y no truena
    this.factService.getAllFacturas().subscribe({
      next: (data) => {
        if (Array.isArray(data) && data.length) this.facturas = data;
        this.loading = false;
        event?.detail.complete();
      },
      error: async (err) => {
        console.error('Error al cargar facturas:', err);
        this.error = 'No se pudieron cargar las facturas.';
        this.loading = false;
        event?.detail.complete();
        (await this.toast.create({ message: 'No se pudieron cargar las facturas.', duration: 1800, color: 'danger' })).present();
      }
    });
  }

  get filtered(): Facturacion[] {
    const q = this.searchTerm.trim().toLowerCase();
    return this.facturas.filter(f => {
      const byMetodo = this.metodo === 'Todos' || (f.metodoPago ?? '').toLowerCase() === this.metodo.toLowerCase();
      const byText =
        String(f.idFactura).includes(q) ||
        String(f.idPaciente).includes(q) ||
        (f.servicios ?? '').toLowerCase().includes(q) ||
        (f.medicamentos ?? '').toLowerCase().includes(q) ||
        (f.metodoPago ?? '').toLowerCase().includes(q) ||
        (f.fecha ?? '').includes(q);
      return byMetodo && (!q || byText);
    });
  }

  iconForMetodo(m: string | undefined) {
    const k = (m || '').toLowerCase();
    if (k.includes('tarjeta')) return 'card-outline';
    if (k.includes('efectivo')) return 'cash-outline';
    if (k.includes('transfer')) return 'swap-horizontal-outline';
    return 'wallet-outline';
  }

  badgeClass(m: string | undefined) {
    const k = (m || '').toLowerCase();
    if (k.includes('tarjeta')) return 'mp-tarjeta';
    if (k.includes('efectivo')) return 'mp-efectivo';
    if (k.includes('transfer')) return 'mp-transfer';
    return 'mp-generic';
  }

  async nuevoRegistro() {
    const modal = await this.modalCtrl.create({
      component: FacturacionModalComponent,
      breakpoints: [0, 0.6, 1],
      initialBreakpoint: 0.6,
      cssClass: 'rounded-modal'
    });
    await modal.present();

    const { role } = await modal.onDidDismiss();
    if (role === 'created') this.load();
  }
}
