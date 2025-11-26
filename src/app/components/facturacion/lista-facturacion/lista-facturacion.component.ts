import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonicModule,
  ToastController,
  ModalController,
  AlertController
} from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Facturacion } from 'src/app/models/facturacion.model';
import { FacturacionService } from 'src/app/services/facturacion/facturacion.service';
import { ModalController as MC } from '@ionic/angular';
import { FacturacionModalComponent } from 'src/app/components/facturacion-modal/facturacion-modal.component';
import { forkJoin } from 'rxjs';
import { PacienteService } from 'src/app/services/paciente/paciente.service';

import Chart from 'chart.js/auto';

@Component({
  selector: 'app-lista-facturacion',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './lista-facturacion.component.html',
  styleUrls: ['./lista-facturacion.component.scss'],
})
export class ListaFacturacionComponent implements OnInit, AfterViewInit {
  private factService = inject(FacturacionService);
  private toast = inject(ToastController);
  private modalCtrl = inject(ModalController);
  private pacienteService = inject(PacienteService);
  private alertCtrl = inject(AlertController);

  @ViewChild('metodoChart') metodoChartRef!: ElementRef<HTMLCanvasElement>;
  private metodoChart: Chart | null = null;

  facturas: Facturacion[] = [];
  pacientes: any[] = [];

  loading = true;
  error: string | null = null;

  // búsqueda + filtro método
  searchTerm = '';
  metodo = 'Todos';

  // rango fechas (YYYY-MM-DD)
  fromDate = '';
  toDate = '';

  ngOnInit(): void {
    this.load();
  }

  ngAfterViewInit(): void {
    this.refreshChart();
  }

  load(event?: CustomEvent) {
    this.loading = !event;
    this.error = null;

    forkJoin({
      facturas: this.factService.getAllFacturas(),
      pacientes: this.pacienteService.getAllPacientes(),
    }).subscribe({
      next: ({ facturas, pacientes }) => {
        this.facturas = facturas.map((f) => {
          const paciente = pacientes.find(
            (p: any) => p.idPaciente === f.idPaciente
          );
          return {
            ...f,
            pacienteNombre: paciente ? paciente.nombreMascota : 'Desconocido',
          } as any;
        });

        this.pacientes = pacientes;
        this.loading = false;
        event?.detail.complete?.();
        this.refreshChart();
      },
      error: async (err) => {
        console.error('Error al cargar facturas o pacientes:', err);
        this.error = 'No se pudieron cargar los datos.';
        this.loading = false;
        event?.detail.complete?.();
        (
          await this.toast.create({
            message: 'No se pudieron cargar las facturas o pacientes.',
            duration: 1800,
            color: 'danger',
          })
        ).present();
      },
    });
  }

  // 🔍 facturas filtradas (texto + método + rango fechas)
  get filtered(): Facturacion[] {
    const q = this.searchTerm.trim().toLowerCase();

    return this.facturas.filter((f: any) => {
      const byMetodo =
        this.metodo === 'Todos' ||
        (f.metodoPago ?? '').toLowerCase() === this.metodo.toLowerCase();

      const byText =
        String(f.idFactura).includes(q) ||
        String(f.idPaciente).includes(q) ||
        (f.servicios ?? '').toLowerCase().includes(q) ||
        (f.medicamentos ?? '').toLowerCase().includes(q) ||
        (f.metodoPago ?? '').toLowerCase().includes(q) ||
        (f.fecha ?? '').includes(q) ||
        (f.pacienteNombre ?? '').toLowerCase().includes(q);

      const fecha = f.fecha || '';

      const byDate =
        (!this.fromDate && !this.toDate) ||
        ((!this.fromDate || fecha >= this.fromDate) &&
          (!this.toDate || fecha <= this.toDate));

      return byMetodo && (!q || byText) && byDate;
    });
  }

  // 💰 total de las ventas del filtro actual
  get totalFiltrado(): number {
    return this.filtered.reduce((sum: number, f: any) => sum + (f.total || 0), 0);
  }

  // estadísticas por método para la gráfica
  private getMetodoStats() {
    const map = new Map<string, number>();

    for (const f of this.filtered as any[]) {
      const key = f.metodoPago || 'Sin método';
      map.set(key, (map.get(key) || 0) + (f.total || 0));
    }

    const labels = Array.from(map.keys());
    const data = Array.from(map.values());

    return { labels, data };
  }

  private buildChart() {
    if (!this.metodoChartRef) return;
    const ctx = this.metodoChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const { labels, data } = this.getMetodoStats();

    if (this.metodoChart) {
      this.metodoChart.destroy();
      this.metodoChart = null;
    }

    this.metodoChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: ['#38bdf8', '#34d399', '#fbbf24', '#f97373'],
            hoverBackgroundColor: ['#0ea5e9', '#22c55e', '#f59e0b', '#f97316'],
            borderWidth: 1,
            borderColor: '#ffffff',
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 16,
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const label = ctx.label || '';
                const value = ctx.parsed || 0;
                return `${label}: $${value.toFixed(2)}`;
              },
            },
          },
        },
        cutout: '65%',
      },
    });
  }

  private updateChartData() {
    if (!this.metodoChart) return;
    const { labels, data } = this.getMetodoStats();

    this.metodoChart.data.labels = labels;
    (this.metodoChart.data.datasets[0].data as any) = data;
    this.metodoChart.update();
  }

  private refreshChart() {
    setTimeout(() => {
      if (!this.metodoChartRef?.nativeElement) return;

      if (!this.metodoChart) {
        this.buildChart();
      } else {
        this.updateChartData();
      }
    }, 0);
  }

  onFiltersChanged() {
    if (!this.loading) {
      this.refreshChart();
    }
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

  // ➕ NUEVO REGISTRO
  async nuevoRegistro() {
    const modal = await this.modalCtrl.create({
      component: FacturacionModalComponent,
      cssClass: 'center-modal',
      mode: 'md',
      backdropDismiss: false,
      animated: true,
    });
    await modal.present();

    const { role, data } = await modal.onDidDismiss();
    if (role === 'created') {
      // recargamos todo para traer la factura desde backend
      this.load();
    }
  }

  // ✏️ EDITAR FACTURA
  async editarFactura(factura: any) {
    const modal = await this.modalCtrl.create({
      component: FacturacionModalComponent,
      cssClass: 'center-modal',
      mode: 'md',
      backdropDismiss: false,
      animated: true,
      componentProps: {
        factura: { ...factura }
      }
    });

    await modal.present();

    const { role, data } = await modal.onDidDismiss();

    if (role === 'updated' && data) {
      const updated = data as Facturacion;

      this.facturas = this.facturas.map((f: any) =>
        f.idFactura === updated.idFactura
          ? {
              ...f,
              ...updated
            }
          : f
      );

      this.refreshChart();

      (await this.toast.create({
        message: 'Factura actualizada.',
        duration: 1500,
        color: 'success'
      })).present();
    }
  }

  // 🗑️ ELIMINAR FACTURA
  async eliminarFactura(factura: any) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar factura',
      subHeader: 'Esta acción no se puede deshacer',
      message: `¿Seguro que quieres eliminar la factura #${factura.idFactura}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'confirm',
          cssClass: 'danger'
        }
      ]
    });

    await alert.present();
    const { role } = await alert.onDidDismiss();

    if (role === 'confirm') {
      this.factService.deleteFactura(factura.idFactura).subscribe({
        next: async () => {
          this.facturas = this.facturas.filter(
            (f: any) => f.idFactura !== factura.idFactura
          );
          this.refreshChart();
          (await this.toast.create({
            message: 'Factura eliminada.',
            duration: 1500,
            color: 'success'
          })).present();
        },
        error: async (err) => {
          console.error('Error al eliminar factura:', err);
          (await this.toast.create({
            message: 'No se pudo eliminar la factura.',
            duration: 2000,
            color: 'danger'
          })).present();
        }
      });
    }
  }
}
