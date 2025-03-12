import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { FinanzasService } from './app/services/finanzas.service';

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient(), FinanzasService], // Asegurar que el servicio es un provider
}).catch((err) => console.error(err));
