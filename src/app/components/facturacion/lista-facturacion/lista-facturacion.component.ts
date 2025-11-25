import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Facturacion } from 'src/app/models/facturacion.model';
import { FacturacionService } from 'src/app/services/facturacion/facturacion.service';
import { ModalController } from '@ionic/angular';
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

  @ViewChild('metodoChart') metodoChartRef!: ElementRef<HTMLCanvasElement>;
  private metodoChart: Chart | null = null;

  facturas: Facturacion[] = [
    {
      idFactura: 1,
      idPaciente: 201,
      servicios: 'Consulta general',
      medicamentos: 'Vacuna antirrábica',
      total: 500,
      fecha: '2025-10-12',
      metodoPago: 'Efectivo',
    },
    {
      idFactura: 2,
      idPaciente: 202,
      servicios: 'Cirugía menor',
      medicamentos: 'Anestesia local',
      total: 1500,
      fecha: '2025-10-13',
      metodoPago: 'Tarjeta',
    },
  ];
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
    // cuando la vista está lista intentamos pintar la gráfica
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
          };
        });

        this.pacientes = pacientes;
        this.loading = false;
        event?.detail.complete?.();

        // tras cargar datos, actualizamos gráfica
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

    return this.facturas.filter((f) => {
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
    return this.filtered.reduce((sum, f) => sum + (f.total || 0), 0);
  }

  // estadísticas por método para la gráfica
  private getMetodoStats() {
    const map = new Map<string, number>();

    for (const f of this.filtered) {
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
    this.metodoChart.data.datasets[0].data = data;
    this.metodoChart.update();
  }

  private refreshChart() {
    // pequeña protección por si la vista aún no está lista
    setTimeout(() => {
      if (!this.metodoChartRef?.nativeElement) return;

      if (!this.metodoChart) {
        this.buildChart();
      } else {
        this.updateChartData();
      }
    }, 0);
  }

  // llamado cuando cambian filtros (search, método, fechas)
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

  async nuevoRegistro() {
    const modal = await this.modalCtrl.create({
      component: FacturacionModalComponent,
      cssClass: 'center-modal',
      mode: 'md',
      backdropDismiss: false,
      animated: true,
    });
    await modal.present();

    const { role } = await modal.onDidDismiss();
    if (role === 'created') this.load();
  }
}
