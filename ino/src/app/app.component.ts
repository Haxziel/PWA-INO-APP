import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FinanzasService } from './services/finanzas.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  isInstallable = false;
  deferredPrompt: any;
  monto: number = 0;
  descripcion: string = '';
  title: string = 'Gestor Financiero Personal';
  showInstallButton = false;
  transacciones: any[] = [];

  constructor(private finanzasService: FinanzasService) {} // Se usa constructor en lugar de inject()

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
    if (this.monto && this.descripcion) {
      const nuevaTransaccion = {
        monto: this.monto,
        descripcion: this.descripcion,
        fecha: new Date(),
        sincronizado: 0, // IndexedDB maneja mejor 0 en lugar de false
      };

      try {
        await this.finanzasService.addTransaccion(nuevaTransaccion);
        this.transacciones.push(nuevaTransaccion);
        this.monto = 0;
        this.descripcion = '';
      } catch (error) {
        console.error('Error al agregar transacción:', error);
      }
    } else {
      console.log('Por favor, complete el monto y la descripción.');
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
