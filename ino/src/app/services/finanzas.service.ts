import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Dexie from 'dexie';
import { BehaviorSubject } from 'rxjs';

export class FinanzasDB extends Dexie {
  transacciones: Dexie.Table<any, number>;

  constructor() {
    super('FinanzasDB');
    this.version(1).stores({
      transacciones: '++id, descripcion, monto, fecha, sincronizado'
    });
    this.transacciones = this.table('transacciones');
  }
}

@Injectable({
  providedIn: 'root'
})
export class FinanzasService {
  private db = new FinanzasDB();
  private apiURL = 'https://67b6d34007ba6e590841edfc.mockapi.io/finanzas2';
  private onlineStatus = new BehaviorSubject<boolean>(navigator.onLine);

  constructor(private http: HttpClient) {
    window.addEventListener('online', () => this.synchronizeTransacciones());
    window.addEventListener('offline', () => this.onlineStatus.next(false));
  }

  // Obtener transacciones (offline u online)
  async getTransacciones(): Promise<any[]> {
    if (navigator.onLine) {
      try {
        const data = await this.http.get<any[]>(this.apiURL).toPromise();
        const transacciones = data ?? []; // Evita undefined
        await this.db.transacciones.clear(); // Limpiar IndexedDB antes de guardar
        await this.db.transacciones.bulkPut(transacciones);
        return transacciones;
      } catch (error) {
        console.error('Error obteniendo transacciones en línea:', error);
        return await this.db.transacciones.toArray(); // Retorna datos locales si falla la API
      }
    } else {
      return await this.db.transacciones.toArray();
    }
  }

  // Agregar una nueva transacción
  async addTransaccion(transaccion: any) {
    if (navigator.onLine) {
      try {
        const newTransaccion = await this.http.post<any>(this.apiURL, transaccion).toPromise();
        await this.db.transacciones.add({ ...newTransaccion, sincronizado: 1 }); // Guardar en IndexedDB como sincronizado
      } catch (error) {
        console.error('Error al enviar transacción a la API:', error);
      }
    } else {
      const nuevaTransaccion = { ...transaccion, sincronizado: 0 };
      await this.db.transacciones.add(nuevaTransaccion);
      console.log('Guardado offline. Pendiente de sincronizar.');
    }
  }

  // Sincronizar las transacciones cuando volvemos a estar online
  private async synchronizeTransacciones() {
    if (navigator.onLine) {
      try {
        const transaccionesPendientes = await this.db.transacciones
          .where('sincronizado')
          .equals(0)
          .toArray();

        for (const transaccion of transaccionesPendientes) {
          try {
            const response = await this.http.post<any>(this.apiURL, {
              descripcion: transaccion.descripcion,
              monto: transaccion.monto,
              fecha: transaccion.fecha
            }).toPromise();

            if (response) {
              await this.db.transacciones.update(transaccion.id, { sincronizado: 1 });
            }
          } catch (error) {
            console.error('Error al sincronizar transacción:', error);
          }
        }
      } catch (error) {
        console.error('Error obteniendo transacciones pendientes:', error);
      }
    }
  }
}
marivi