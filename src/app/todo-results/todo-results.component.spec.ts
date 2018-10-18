import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TodoResultsComponent } from './todo-results.component';

describe('TodoResultsComponent', () => {
  let component: TodoResultsComponent;
  let fixture: ComponentFixture<TodoResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TodoResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TodoResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
