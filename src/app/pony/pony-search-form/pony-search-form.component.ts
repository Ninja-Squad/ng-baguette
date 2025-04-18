import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-pony-search-form',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './pony-search-form.component.html',
  styleUrl: './pony-search-form.component.css'
})
export class PonySearchFormComponent {
  private readonly router = inject(Router);
  readonly form = inject(NonNullableFormBuilder).group({
    query: inject(ActivatedRoute).snapshot.queryParamMap.get('query') ?? ''
  });

  search() {
    this.router.navigate([], { queryParams: { query: this.form.value.query!.trim() }})
  }
}
