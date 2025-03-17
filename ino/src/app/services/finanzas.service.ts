import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Dexie from 'dexie';
import { BehaviorSubject } from 'rxjs';

export class FinanzasDB extends Dexie {
  transacciones: Dexie.Table<any, number>;

  constructor() {
    super('FinanzasDB');
    this.version(2).stores({
      transacciones: '++id, descripcion, monto, fecha, sincronizado, pendienteEliminar'
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
        if (data) {
          await this.db.transacciones.clear(); 
          await this.db.transacciones.bulkPut(data);
          
          localStorage.setItem('transaccionesBackup', JSON.stringify(data)); // Copia de seguridad en localStorage
        }
      } catch (error) {
        console.error('Error obteniendo transacciones en línea:', error);
      }
    }
  
    // Intentar obtener desde IndexedDB
    let transacciones = await this.db.transacciones.where('pendienteEliminar').notEqual(1).toArray();
    
    // Si IndexedDB falla, intenta cargar desde LocalStorage
    if (transacciones.length === 0) {
      const backup = localStorage.getItem('transaccionesBackup');
      if (backup) {
        transacciones = JSON.parse(backup);
      }
    }
  
    return transacciones;
  }

  // Método para eliminar una transacción
  async deleteTransaccion(id: number) {
    if (navigator.onLine) {
      // Si hay conexión, eliminar directamente de la API y de IndexedDB
      try {
        await this.http.delete(`${this.apiURL}/${id}`).toPromise();
        await this.db.transacciones.delete(id);
        console.log(`Transacción ${id} eliminada de la API y de IndexedDB.`);
      } catch (error) {
        console.error('Error al eliminar transacción de la API:', error);
      }
    } else {
      // Si está offline, marcarla como "pendiente de eliminar" y actualizar localStorage
      try {
        const transaccion = await this.db.transacciones.get(id);
        if (transaccion) {
          // Marcar como pendiente de eliminar en IndexedDB
          await this.db.transacciones.update(id, { pendienteEliminar: 1 });
  
          // Obtener la copia de seguridad actual de localStorage
          const backup = localStorage.getItem('transaccionesBackup');
          if (backup) {
            let transaccionesBackup = JSON.parse(backup);
  
            // Filtrar la transacción eliminada de la copia de seguridad
            transaccionesBackup = transaccionesBackup.filter((t: any) => t.id !== id);
  
            // Actualizar localStorage con la nueva lista
            localStorage.setItem('transaccionesBackup', JSON.stringify(transaccionesBackup));
          }
  
          console.log(`Transacción ${id} marcada para eliminar y removida de localStorage.`);
        } else {
          console.warn(`No se encontró la transacción ${id} en IndexedDB.`);
        }
      } catch (error) {
        console.error('Error al marcar transacción para eliminar offline:', error);
      }
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
        // Sincronizar transacciones pendientes de agregar
        const transaccionesPendientes = await this.db.transacciones.where('sincronizado').equals(0).toArray();
  
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
  
        // Eliminar de la API las transacciones marcadas para borrar
        const transaccionesPendientesEliminar = await this.db.transacciones.where('pendienteEliminar').equals(1).toArray();
        
        for (const transaccion of transaccionesPendientesEliminar) {
          try {
            await this.http.delete(`${this.apiURL}/${transaccion.id}`).toPromise();
            await this.db.transacciones.delete(transaccion.id);
            console.log(`Transacción ${transaccion.id} eliminada de la API y de IndexedDB.`);
          } catch (error) {
            console.error('Error eliminando transacción en la API:', error);
          }
        }
      } catch (error) {
        console.error('Error sincronizando transacciones:', error);
      }
    }
  }
}