import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TodoQuery, TodoQueriesProxy, TodoElement, TodoElementsProxy, TodoListItem, QueryOperand, QueryOperator } from '../proxies/todo-api-proxies';
import { TodoItemTableComponent } from '../todo-item-table/todo-item-table.component';

@Component({
  selector: 'app-todo-results',
  templateUrl: './todo-results.component.html',
  styleUrls: ['./todo-results.component.css']
})
export class TodoResultsComponent implements OnInit {
  @ViewChild(TodoItemTableComponent) private itemTable: TodoItemTableComponent;
  private todoQueryId: number;
  todoQuery$: Observable<TodoQuery>;
  subTitle: string;

  constructor(
    private route: ActivatedRoute,
    private todoQueriesProxy: TodoQueriesProxy
  ) { }

  ngOnInit() {
    this.todoQuery$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => this.todoQueriesProxy.getQuery(+params.get('id')))
    );
    this.todoQuery$.subscribe(query => this.onTodoQueryChanged(query));
  }

  private onTodoQueryChanged(query: TodoQuery) {
    this.todoQueryId = query.id;
    if (query.operand == QueryOperand.DueDate) {
      this.subTitle = query.dateValue.toDateString();
    }
  }
}
