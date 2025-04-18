import { Component, inject, Signal } from '@angular/core';
import { Pony } from '../pony.model';
import { ActivatedRoute } from '@angular/router';
import { catchError, EMPTY, exhaustMap, map, of, startWith, Subject, switchMap } from 'rxjs';
import { PonyService } from '../pony.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { PonyComponent } from '../pony/pony.component';

@Component({
  selector: 'app-pony-list',
  imports: [
    PonyComponent
  ],
  templateUrl: './pony-list.component.html',
  styleUrl: './pony-list.component.css'
})
export class PonyListComponent {
  private readonly ponyService = inject(PonyService);
  private readonly deletionTrigger = new Subject<Pony>();
  private readonly refreshTrigger = new Subject<void>();

  ponies: Signal<ReadonlyArray<Pony> | undefined>;

  constructor() {
    const route = inject(ActivatedRoute);
    this.ponies = toSignal(route.queryParamMap.pipe(
      map(params => params.get('query')),
      switchMap(query => this.refreshTrigger.pipe(
        startWith(undefined),
        map(() => query)
      )),
      switchMap(query => {
        if (query != null) {
          return this.ponyService.search(query)
        } else {
          return of(undefined)
        }
      })
    ));

    this.deletionTrigger.pipe(
      exhaustMap(pony => this.ponyService.delete(pony.id).pipe(catchError(() => EMPTY))),
      takeUntilDestroyed()
    ).subscribe(() => this.refreshTrigger.next())
  }

  delete(pony: Pony) {
    this.deletionTrigger.next(pony);
  }
}
