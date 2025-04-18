import { TestBed } from '@angular/core/testing';

import { provideRouter } from '@angular/router';
import { of, Subject } from 'rxjs';
import { PoniesComponent } from './ponies.component';
import { PonyService } from '../pony.service';
import { Pony } from '../pony.model';
import { PonyComponent } from '../pony/pony.component';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { RouterTestingHarness } from '@angular/router/testing';
import { createMock, RoutingTester, speculoosMatchers, TestHtmlElement } from 'ngx-speculoos';

class TestPonyItem extends TestHtmlElement<HTMLElement> {
  get pony() {
    return this.element(PonyComponent)
  }

  get deleteButton() {
    return this.button('[data-test-delete-button]')!;
  }
}

class PoniesComponentTester extends RoutingTester {
  get queryInput() {
    return this.input('#query')!;
  }

  get searchButton() {
    return this.button('[data-test-search-button]')!;
  }

  get ponies() {
    return this.customs('[data-test-pony-item]', TestPonyItem);
  }
}

describe('PoniesComponent', () => {
  let ponyService: jasmine.SpyObj<PonyService>;

  beforeAll(() => {
    jasmine.addMatchers(speculoosMatchers);
  });

  beforeEach(() => {
    ponyService = createMock(PonyService);

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
    const tester = new PoniesComponentTester(await RouterTestingHarness.create('/ponies'));

    // check that the query input field is present and empty
    expect(tester.queryInput).toHaveValue('');

    // check that no pony is displayed
    expect(tester.ponies.length).toBe(0);

    // fill the form and search
    const ponies = new Subject<ReadonlyArray<Pony>>();
    ponyService.search.and.returnValue(ponies);

    await tester.queryInput.fillWith('b');
    await tester.searchButton.click();

    // check that a navigation happened
    expect(tester.url).toBe('/ponies?query=b');

    // check that the service was called
    expect(ponyService.search).toHaveBeenCalledWith('b');

    // simulate the response from the server
    ponies.next([{ id: 'p1', name: 'Blue mystery', color: 'blue' }]);

    // wait until changes have been synced to the DOM
    await tester.stable();

    // check that the returned pony is displayed
    expect(tester.ponies.length).toBe(1);
  });

  it('should pre-fill the form and search immediately if the URL contains a query', async () => {
    // tell the service what to return
    const ponies = new Subject<ReadonlyArray<Pony>>();
    ponyService.search.and.returnValue(ponies);

    // navigate to the component
    const tester = new PoniesComponentTester(await RouterTestingHarness.create('/ponies?query=b'));

    // check that the query input field is present and pre-filled
    expect(tester.queryInput).toHaveValue('b');

    // check that the service was called
    expect(ponyService.search).toHaveBeenCalledWith('b');

    // simulate the response from the server
    ponies.next([{ id: 'p1', name: 'Blue mystery', color: 'blue' }]);

    // wait until changes have been synced to the DOM
    await tester.stable();

    // check that the pony is displayed
    expect(tester.ponies.length).toBe(1);
  });

  it('should delete a pony', async () => {
    // tell the service what to return
    let ponies = new Subject<ReadonlyArray<Pony>>();
    ponyService.search.and.returnValue(ponies);

    // navigate to the component
    const tester = new PoniesComponentTester(await RouterTestingHarness.create('/ponies?query='));

    // simulate the response from the server
    ponies.next([
      { id: 'p1', name: 'Blue mystery', color: 'blue' },
      { id: 'p2', name: 'Purple rain', color: 'purple' }
    ]);

    // wait until changes have been synced to the DOM
    await tester.stable();

    // check that the ponies are displayed
    expect(tester.ponies.length).toBe(2);

    // delete the first pony, which should trigger a refresh
    ponyService.delete.and.returnValue(of(undefined));
    ponies = new Subject<ReadonlyArray<Pony>>();
    ponyService.search.and.returnValue(ponies);

    await tester.ponies[0].deleteButton.click();

    expect(ponyService.delete).toHaveBeenCalledWith('p1');

    // simulate the response to the refresh from the server
    ponies.next([
      { id: 'p2', name: 'Purple rain', color: 'purple' }
    ]);

    // wait until changes have been synced to the DOM
    await tester.stable();

    // check that the remaining pony is displayed
    expect(tester.ponies.length).toBe(1);
  });
});
