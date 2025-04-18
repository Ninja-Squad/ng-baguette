import { Injectable } from '@angular/core';
import { Pony } from './pony.model';
import { delay, Observable, of } from 'rxjs';

let allPonies: ReadonlyArray<Pony> = [
  {
    id: 'p1',
    name: 'Blue mystery',
    color: 'blue'
  },
  {
    id: 'p2',
    name: 'Green landscape',
    color: 'green'
  },
  {
    id: 'p3',
    name: 'Orange light',
    color: 'orange'
  },
  {
    id: 'p4',
    name: 'Purple rain',
    color: 'purple'
  },
  {
    id: 'p5',
    name: 'Yellow stone',
    color: 'yellow'
  }
]

@Injectable({
  providedIn: 'root'
})
export class PonyService {
  search(query: string): Observable<ReadonlyArray<Pony>> {
    return of(allPonies.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))).pipe(delay(100));
  }

  delete(ponyId: string): Observable<void> {
    allPonies = allPonies.filter(p => p.id !== ponyId);
    return of(undefined).pipe(delay(100));
  }
}
