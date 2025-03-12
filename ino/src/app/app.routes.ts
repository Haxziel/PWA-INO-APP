import { Route } from '@angular/router';
import { AppComponent } from './app.component';

export const routes: Route[] = [  // Cambié appRoutes por routes
  {
    path: '',
    component: AppComponent
  },
  // Puedes agregar más rutas aquí si es necesario
];
