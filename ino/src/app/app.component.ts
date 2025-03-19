import { Component, OnInit, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FinanzasService } from './services/finanzas.service';
import { DashboardComponent } from './dashboard/dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule, DashboardComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  @ViewChild(DashboardComponent) dashboardComponent!: DashboardComponent; // Referencia al DashboardComponent
  isInstallable = false;
  deferredPrompt: any;
  monto: number | null = null; // Inicializar como null para que no muestre 0
  descripcion: string = ''; // Inicializar como cadena vacía
  tipo: string = ''; // Valor por defecto para el select
  title: string = 'Ino App';
  showInstallButton = false;
  transacciones: any[] = [];

  constructor(private finanzasService: FinanzasService) {}

  ngOnInit() {
    window.addEventListener('beforeinstallprompt', (event: Event) => {
      event.preventDefault();
      this.deferredPrompt = event;
      this.isInstallable = true;
    });

    this.cargarTransacciones();
  }

  async cargarTransacciones() {
    try {
      this.transacciones = await this.finanzasService.getTransacciones();
    } catch (error) {
      console.error('Error al cargar transacciones:', error);
    }
  }

  async agregarTransaccion() {
    if (this.monto && this.descripcion && this.tipo) {
      const nuevaTransaccion = {
        monto: this.monto,
        descripcion: this.descripcion,
        tipo: this.tipo,
        fecha: new Date(),
        sincronizado: 0,
      };

      try {
        await this.finanzasService.addTransaccion(nuevaTransaccion);
        this.transacciones.push(nuevaTransaccion);
        this.monto = null;
        this.descripcion = '';
        this.tipo = '';
        await this.dashboardComponent.refrescarDatos(); // Refrescar datos del dashboard
      } catch (error) {
        console.error('Error al agregar transacción:', error);
      }
    } else {
      console.log('Por favor, complete el monto, la descripción y el tipo.');
    }
  }

  async eliminarTransaccion(id: number) {
    try {
      await this.finanzasService.deleteTransaccion(id);
      this.transacciones = this.transacciones.filter(t => t.id !== id);
      await this.dashboardComponent.refrescarDatos(); // Refrescar datos del dashboard
    } catch (error) {
      console.error('Error al eliminar transacción:', error);
    }
  }

  installPWA() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      this.deferredPrompt.userChoice.then((choice: { outcome: 'accepted' | 'dismissed' }) => {
        if (choice.outcome === 'accepted') {
          console.log('PWA instalada');
        } else {
          console.log('El usuario canceló la instalación');
        }
        this.deferredPrompt = null;
        this.showInstallButton = false;
      });
    }
  }
}