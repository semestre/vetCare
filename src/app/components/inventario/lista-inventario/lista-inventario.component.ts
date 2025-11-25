import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Inventario } from 'src/app/models/inventario.model';
import { InventarioService } from 'src/app/services/inventario/inventario.service';
import { ModalController } from '@ionic/angular';
import { InventarioModalComponent } from 'src/app/components/inventario-modal/inventario-modal.component';

@Component({
  selector: 'app-lista-inventario',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './lista-inventario.component.html',
  styleUrls: ['./lista-inventario.component.scss']
})
export class ListaInventarioComponent implements OnInit {

  private invService = inject(InventarioService);
  private toast = inject(ToastController);
  private modalCtrl = inject(ModalController);

  activarFiltroBajo = false;
  limiteBajoStock = 10; // valor por defecto


  items: Inventario[] = [
    { idItem: 1, nombreItem: 'Vacuna antirrábica', cantidad: 20,  categoria: 'Medicamento',         fechaActualizacion: '2025-10-10' },
    { idItem: 2, nombreItem: 'Guantes de látex',    cantidad: 100, categoria: 'Material quirúrgico', fechaActualizacion: '2025-10-08' }
  ];

  // UI
  loading = true;
  error: string | null = null;

  // búsqueda + filtro
  searchTerm = '';
  categoria = 'Todas';
  categorias: string[] = ['Todas'];

  // umbral de alerta
  lowStockThreshold = 10;

  ngOnInit(): void {
    this.load();
  }

  load(event?: CustomEvent) {
    this.loading = !event;
    this.error = null;

    this.invService.getAllItems().subscribe({
      next: (data) => {
        if (Array.isArray(data) && data.length) this.items = data;
        this.refreshCategorias();
        this.loading = false;
        event?.detail.complete();
      },
      error: async (err) => {
        console.error('Error al cargar inventario:', err);
        this.error = 'No se pudo cargar el inventario.';
        this.refreshCategorias();
        this.loading = false;
        event?.detail.complete();
        (await this.toast.create({ message: 'No se pudo cargar el inventario.', duration: 1800, color: 'danger' })).present();
      }
    });
  }

  refreshCategorias() {
    const set = new Set(this.items.map(i => i.categoria).filter(Boolean));
    this.categorias = ['Todas', ...Array.from(set)];
    if (!this.categorias.includes(this.categoria)) this.categoria = 'Todas';
  }

  get maxQty(): number {
    return Math.max(...this.items.map(i => i.cantidad || 0), 1);
  }

  filtered(): Inventario[] {
    const q = this.searchTerm.trim().toLowerCase();

    return this.items.filter(i => {
      const byCat =
        this.categoria === 'Todas' || (i.categoria ?? '') === this.categoria;

      const byText =
        (i.nombreItem ?? '').toLowerCase().includes(q) ||
        (i.categoria ?? '').toLowerCase().includes(q) ||
        String(i.idItem).includes(q);

      const byLow =
        !this.activarFiltroBajo ||
        (i.cantidad ?? 0) < (this.limiteBajoStock || 0);

      return byCat && byText && byLow;
    });
  }


  stockPercent(i: Inventario): number {
    return Math.max(0, Math.min(100, Math.round((i.cantidad / this.maxQty) * 100)));
  }

  stockState(i: Inventario): 'low' | 'ok' | 'high' {
    if ((i.cantidad ?? 0) <= this.lowStockThreshold) return 'low';
    if (this.stockPercent(i) > 70) return 'high';
    return 'ok';
  }

  iconForState(i: Inventario): string {
    const s = this.stockState(i);
    if (s === 'low') return 'warning-outline';
    if (s === 'high') return 'trending-up-outline';
    return 'cube-outline';
  }

  async nuevoItem() {
    const modal = await this.modalCtrl.create({
      component: InventarioModalComponent,
      cssClass: 'center-modal',
      mode: 'md',
      backdropDismiss: false,
      animated: true
    });
    await modal.present();

    const { role } = await modal.onDidDismiss();
    if (role === 'created') this.load();
  }
}
