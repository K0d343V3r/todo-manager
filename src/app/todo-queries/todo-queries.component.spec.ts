import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TodoQueriesComponent } from './todo-queries.component';

describe('TodoQueriesComponent', () => {
  let component: TodoQueriesComponent;
  let fixture: ComponentFixture<TodoQueriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TodoQueriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TodoQueriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
