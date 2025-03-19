import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FinanzasService } from '../services/finanzas.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective; // Referencia al gráfico

  balanceActual: number = 0;
  gastoTotal: number = 0;
  ingresoTotal: number = 0;
  proyeccionAhorro: number = 0;

  // Gráfico de Evolución de Saldo
  lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [],
        label: 'Evolución de Saldo',
        borderColor: 'rgba(75, 192, 192, 1)',
        fill: false
      }
    ],
    labels: []
  };

  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Fecha'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Monto'
        }
      }
    }
  };

  lineChartType: ChartType = 'line';

  // Gráfico de Distribución de Gastos e Ingresos
  pieChartData: ChartConfiguration['data'] = {
    labels: ['Gastos', 'Ingresos'],
    datasets: [
      {
        data: [],
        backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(75, 192, 192, 0.2)'],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(75, 192, 192, 1)'],
        borderWidth: 1
      }
    ]
  };

  pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Distribución de Gastos e Ingresos'
      }
    }
  };

  pieChartType: ChartType = 'pie';

  constructor(private finanzasService: FinanzasService) {}

  async ngOnInit() {
    await this.cargarDatos();
  }

  async cargarDatos() {
    const transacciones = await this.finanzasService.getTransacciones();
    this.calcularTotales(transacciones);
    this.actualizarGraficos(transacciones);
  }

  calcularTotales(transacciones: any[]) {
    this.gastoTotal = transacciones
      .filter(t => t.tipo === 'female')
      .reduce((sum, t) => sum + t.monto, 0);

    this.ingresoTotal = transacciones
      .filter(t => t.tipo === 'male')
      .reduce((sum, t) => sum + t.monto, 0);

    this.balanceActual = this.ingresoTotal - this.gastoTotal;
    this.proyeccionAhorro = this.balanceActual * 12; // Proyección anual
  }

  actualizarGraficos(transacciones: any[]) {
    // Evolución de Saldo
    const saldos = transacciones
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
      .map(t => t.tipo === 'male' ? t.monto : -t.monto)
      .reduce((acc, monto) => {
        const ultimoSaldo = acc.length > 0 ? acc[acc.length - 1] : 0;
        acc.push(ultimoSaldo + monto);
        return acc;
      }, [] as number[]);

    this.lineChartData.datasets[0].data = saldos;
    this.lineChartData.labels = transacciones.map(t => new Date(t.fecha).toLocaleDateString());

    // Distribución de Gastos e Ingresos
    this.pieChartData.datasets[0].data = [this.gastoTotal, this.ingresoTotal];

    // Forzar la actualización de los gráficos
    if (this.chart) {
      this.chart.update();
    }
  }

  // Método para refrescar los datos
  async refrescarDatos() {
    await this.cargarDatos();
  }
}