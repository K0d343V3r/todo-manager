import { TestBed } from '@angular/core/testing';

import { TodoQueryService } from './todo-query.service';

describe('TodoQueryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TodoQueryService = TestBed.get(TodoQueryService);
    expect(service).toBeTruthy();
  });
});
