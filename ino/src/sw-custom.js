self.addEventListener('sync', event => {
    if (event.tag === 'sync-transacciones') {
      event.waitUntil(subirTransaccionesPendientes());
    }
  });
  
  async function subirTransaccionesPendientes() {
    const db = new Dexie('FinanzasDB');
    db.version(1).stores({ transacciones: '++id, descripcion, monto' });
  
    const transacciones = await db.transacciones.toArray();
    if (transacciones.length > 0) {
      for (const transaccion of transacciones) {
        await fetch('https://67b6d34007ba6e590841edfc.mockapi.io/finanzas', {
          method: 'POST',
          body: JSON.stringify(transaccion),
          headers: { 'Content-Type': 'application/json' }
        });
      }
      await db.transacciones.clear();
      console.log('Transacciones sincronizadas.');
    }
  }
  