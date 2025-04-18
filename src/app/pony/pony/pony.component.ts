import { Component, computed, input } from '@angular/core';
import { Pony } from '../pony.model';

@Component({
  selector: 'app-pony',
  imports: [],
  templateUrl: './pony.component.html',
  styleUrl: './pony.component.css'
})
export class PonyComponent {
  readonly pony = input.required<Pony>();
  readonly imageUrl = computed(() => `/images/pony-${this.pony().color}.gif`);
}
