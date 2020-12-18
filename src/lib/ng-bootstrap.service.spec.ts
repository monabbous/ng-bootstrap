import { TestBed } from '@angular/core/testing';

import { NgBootstrapService } from './ng-bootstrap.service';

describe('NgBootstrapService', () => {
  let service: NgBootstrapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgBootstrapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
