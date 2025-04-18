import { TestBed } from '@angular/core/testing';

import { provideRouter, Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { PoniesComponent } from './ponies.component';
import { PonyService } from '../pony.service';
import { Pony } from '../pony.model';
import { PonyComponent } from '../pony/pony.component';
import { By } from '@angular/platform-browser';
import { PonySearchFormComponent } from '../pony-search-form/pony-search-form.component';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { RouterTestingHarness } from '@angular/router/testing';

describe('PoniesComponent', () => {
  let ponyService: jasmine.SpyObj<PonyService>;

  beforeEach(() => {
    ponyService = jasmine.createSpyObj<PonyService>('PonyService', ['search', 'delete']);

    TestBed.configureTestingModule({
      providers: [
        provideExperimentalZonelessChangeDetection(),
        provideRouter([
          { path: 'ponies', component: PoniesComponent }
        ]),
        { provide: PonyService, useValue: ponyService }
      ]
    });
  });

  it('should search for ponies when submitting the form', async () => {
    // navigate to the component
    const harness = await RouterTestingHarness.create('/ponies');

    // create the ponies component
    const fixture = harness.fixture;
    await fixture.whenStable();

    // check that the query input field is present and empty
    const queryInput: HTMLInputElement = fixture.debugElement.query(By.css('#query')).nativeElement;
    expect(queryInput.value).toBe('');

    // check that no pony is displayed
    let ponyComponents = fixture.debugElement.queryAll(By.directive(PonyComponent));
    expect(ponyComponents.length).toBe(0);

    // fill the form and search
    const ponies = new Subject<ReadonlyArray<Pony>>();
    ponyService.search.and.returnValue(ponies);

    const searchForm = fixture.debugElement.query(By.directive(PonySearchFormComponent)).componentInstance as PonySearchFormComponent;
    searchForm.form.controls.query.setValue('b');
    searchForm.search();

    // wait until the navigation hs been done
    await fixture.whenStable();

    // check that a navigation happened
    const router = TestBed.inject(Router);
    expect(router.url).toBe('/ponies?query=b');

    // check that the service was called
    expect(ponyService.search).toHaveBeenCalledWith('b');

    // simulate the response from the server
    ponies.next([{ id: 'p1', name: 'Blue mystery', color: 'blue' }]);

    // wait until changes have been synced to the DOM
    await fixture.whenStable();

    // check that the returned pony is displayed
    ponyComponents = fixture.debugElement.queryAll(By.directive(PonyComponent));
    expect(ponyComponents.length).toBe(1);
  });

  it('should pre-fill the form and search immediately if the URL contains a query', async () => {
    // tell the service what to return
    const ponies = new Subject<ReadonlyArray<Pony>>();
    ponyService.search.and.returnValue(ponies);

    // navigate to the component
    const harness = await RouterTestingHarness.create('/ponies?query=b');
    const fixture = harness.fixture;

    // check that the query input field is present and pre-filled
    const queryInput: HTMLInputElement = fixture.debugElement.query(By.css('#query')).nativeElement;
    expect(queryInput.value).toBe('b');

    // check that the service was called
    expect(ponyService.search).toHaveBeenCalledWith('b');

    // simulate the response from the server
    ponies.next([{ id: 'p1', name: 'Blue mystery', color: 'blue' }]);

    // wait until changes have been synced to the DOM
    await fixture.whenStable();

    // check that the pony is displayed
    let ponyComponents = fixture.debugElement.queryAll(By.directive(PonyComponent));
    expect(ponyComponents.length).toBe(1);
  });

  it('should delete a pony', async () => {
    // tell the service what to return
    let ponies = new Subject<ReadonlyArray<Pony>>();
    ponyService.search.and.returnValue(ponies);

    // navigate to the component
    const harness = await RouterTestingHarness.create('/ponies?query=b');
    const fixture = harness.fixture;

    // simulate the response from the server
    ponies.next([
      { id: 'p1', name: 'Blue mystery', color: 'blue' },
      { id: 'p2', name: 'Purple rain', color: 'purple' }
    ]);

    // wait until changes have been synced to the DOM
    await fixture.whenStable();

    // check that the ponies are displayed
    let ponyComponents = fixture.debugElement.queryAll(By.directive(PonyComponent));
    expect(ponyComponents.length).toBe(2);

    // delete the first pony, which should trigger a refresh
    ponyService.delete.and.returnValue(of(undefined));
    ponies = new Subject<ReadonlyArray<Pony>>();
    ponyService.search.and.returnValue(ponies);

    (fixture.debugElement.query(By.css('.delete-button')).nativeElement as HTMLButtonElement).click();

    expect(ponyService.delete).toHaveBeenCalledWith('p1');

    // simulate the response to the refresh from the server
    ponies.next([
      { id: 'p2', name: 'Purple rain', color: 'purple' }
    ]);

    // wait until changes have been synced to the DOM
    await fixture.whenStable();

    // check that the remaining pony is displayed
    ponyComponents = fixture.debugElement.queryAll(By.directive(PonyComponent));
    expect(ponyComponents.length).toBe(1);
  });
});
