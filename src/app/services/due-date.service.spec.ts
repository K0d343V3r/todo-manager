import { TestBed } from '@angular/core/testing';

import { DueDateService } from './due-date.service';

describe('DueDateService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DueDateService = TestBed.get(DueDateService);
    expect(service).toBeTruthy();
  });
});
