import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TodoItemTableComponent } from './todo-item-table.component';

describe('TodoItemTableComponent', () => {
  let component: TodoItemTableComponent;
  let fixture: ComponentFixture<TodoItemTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TodoItemTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TodoItemTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
