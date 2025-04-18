import { TestBed } from '@angular/core/testing';

import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { PoniesComponent } from './ponies.component';
import { PonyService } from '../pony.service';
import { Pony } from '../pony.model';
import { PonyComponent } from '../pony/pony.component';
import { By } from '@angular/platform-browser';
import { PonySearchFormComponent } from '../pony-search-form/pony-search-form.component';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';

describe('PoniesComponent', () => {
  let ponyService: jasmine.SpyObj<PonyService>;
  let routeStub = {
    snapshot: {
      queryParamMap: convertToParamMap({}),
    },
    queryParamMap: new BehaviorSubject(convertToParamMap({}))
  };

  beforeEach(() => {
    ponyService = jasmine.createSpyObj<PonyService>('PonyService', ['search', 'delete']);

    TestBed.configureTestingModule({
      providers: [
        provideExperimentalZonelessChangeDetection(),
        { provide: ActivatedRoute, useValue: routeStub },
        { provide: PonyService, useValue: ponyService }
      ]
    });
  });

  it('should search for ponies when submitting the form', () => {
    // clear the route stub query params
    routeStub.snapshot.queryParamMap = convertToParamMap({});
    routeStub.queryParamMap = new BehaviorSubject(convertToParamMap({}));

    // create the ponies component
    const fixture = TestBed.createComponent(PoniesComponent);
    fixture.detectChanges();

    // check that the query input field is present and empty
    const queryInput: HTMLInputElement = fixture.debugElement.query(By.css('#query')).nativeElement;
    expect(queryInput.value).toBe('');

    // check that no pony is displayed
    let ponyComponents = fixture.debugElement.queryAll(By.directive(PonyComponent));
    expect(ponyComponents.length).toBe(0);

    // fill the form and search
    const searchForm = fixture.debugElement.query(By.directive(PonySearchFormComponent)).componentInstance as PonySearchFormComponent;
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    searchForm.form.controls.query.setValue('b');
    searchForm.search();

    // check that a navigation happened
    expect(router.navigate).toHaveBeenCalledWith([], { queryParams: { query: 'b' }});

    // change the query parameters of the stub route as the router would do,
    // which should trigger a service call
    const ponies = new Subject<ReadonlyArray<Pony>>();
    ponyService.search.and.returnValue(ponies);
    routeStub.queryParamMap.next(convertToParamMap({ query: 'b' }));

    // check that the service was called
    expect(ponyService.search).toHaveBeenCalledWith('b');

    // simulate the response from the server
    ponies.next([{ id: 'p1', name: 'Blue mystery', color: 'blue' }]);

    // detect changes to update the DOM
    fixture.detectChanges();

    // check that the returned pony is displayed
    ponyComponents = fixture.debugElement.queryAll(By.directive(PonyComponent));
    expect(ponyComponents.length).toBe(1);
  });

  it('should pre-fill the form and search immediately if the URL contains a query', () => {
    // fill the route stub with the query param
    routeStub.snapshot.queryParamMap = convertToParamMap({ query: 'b' });
    routeStub.queryParamMap = new BehaviorSubject(convertToParamMap({ query: 'b' }));

    // tell the service what to return
    const ponies = new Subject<ReadonlyArray<Pony>>();
    ponyService.search.and.returnValue(ponies);

    // create the ponies component
    const fixture = TestBed.createComponent(PoniesComponent);
    fixture.detectChanges();

    // check that the query input field is present and pre-filled
    const queryInput: HTMLInputElement = fixture.debugElement.query(By.css('#query')).nativeElement;
    expect(queryInput.value).toBe('b');

    // check that the service was called
    expect(ponyService.search).toHaveBeenCalledWith('b');

    // simulate the response from the server
    ponies.next([{ id: 'p1', name: 'Blue mystery', color: 'blue' }]);

    // detect changes to update the DOM
    fixture.detectChanges();

    // check that the pony is displayed
    let ponyComponents = fixture.debugElement.queryAll(By.directive(PonyComponent));
    expect(ponyComponents.length).toBe(1);
  });

  it('should delete a pony', () => {
    // fill the route stub with the query params
    routeStub.snapshot.queryParamMap = convertToParamMap({ query: '' });
    routeStub.queryParamMap = new BehaviorSubject(convertToParamMap({ query: '' }));

    // tell the service what to return
    let ponies = new Subject<ReadonlyArray<Pony>>();
    ponyService.search.and.returnValue(ponies);

    // create the ponies component
    const fixture = TestBed.createComponent(PoniesComponent);
    fixture.detectChanges();

    // simulate the response from the server
    ponies.next([
      { id: 'p1', name: 'Blue mystery', color: 'blue' },
      { id: 'p2', name: 'Purple rain', color: 'purple' }
    ]);

    // detect changes to update the DOM
    fixture.detectChanges();

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

    // detect changes to update the DOM
    fixture.detectChanges();

    // check that the remaining pony is displayed
    ponyComponents = fixture.debugElement.queryAll(By.directive(PonyComponent));
    expect(ponyComponents.length).toBe(1);
  });
});
