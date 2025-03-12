import { Component } from '@angular/core';
import { FinanzasService } from '../services/finanzas.service'; // Verifica que la ruta sea correcta

@Component({
  selector: 'app-transacciones-form',
  templateUrl: './transacciones-form.component.html',
  styleUrls: ['./transacciones-form.component.css']
})
export class TransaccionesFormComponent {
  descripcion: string = '';
  monto: number = 0;
  fecha: string = '';

  constructor(private finanzasService: FinanzasService) {}

  onSubmit() {
    const nuevaTransaccion = {
      descripcion: this.descripcion,
      monto: this.monto,
      fecha: this.fecha
    };
    this.finanzasService.addTransaccion(nuevaTransaccion);
    this.descripcion = '';
    this.monto = 0;
    this.fecha = '';
  }
}
