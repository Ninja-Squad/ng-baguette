import { Routes } from '@angular/router';
import { PoniesComponent } from './pony/ponies/ponies.component';
import { HomeComponent } from './home/home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'ponies',
    component: PoniesComponent
  }
];
