import { TestBed } from '@angular/core/testing';

import { TriggerOnViewportService } from './trigger-on-viewport.service';

describe('TriggerOnViewportService', () => {
  let service: TriggerOnViewportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TriggerOnViewportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
