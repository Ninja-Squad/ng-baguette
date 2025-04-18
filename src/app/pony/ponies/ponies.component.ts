import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { PonySearchFormComponent } from '../pony-search-form/pony-search-form.component';
import { PonyListComponent } from '../pony-list/pony-list.component';

@Component({
  selector: 'app-ponies',
  imports: [
    PonySearchFormComponent,
    PonyListComponent
  ],
  templateUrl: './ponies.component.html',
  styleUrl: './ponies.component.css'
})
export class PoniesComponent {

}
