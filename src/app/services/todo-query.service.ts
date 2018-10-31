import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { TodoQueryResults, TodoQuery, TodoQueriesProxy, TodoListItem, QueryOperand, QueryOperator, TodoItemReference } from '../proxies/todo-api-proxies';
import { DueDateService } from '../services/due-date.service'

@Injectable({
  providedIn: 'root'
})
export class TodoQueryService {
  private queryExecutedSource = new Subject<TodoQueryResults>();
  queryExecuted$ = this.queryExecutedSource.asObservable();

  constructor(
    private todoQueriesProxy: TodoQueriesProxy,
    private dueDateService: DueDateService
  ) { }

  executeQuery(queryId: number) {
    this.todoQueriesProxy.executeQuery(queryId).subscribe(results => {
      this.queryExecutedSource.next(results);
    })
  }
}