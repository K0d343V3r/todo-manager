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

  executeQueryNoBroadcast(queryId: number): Observable<TodoQueryResults> {
    return this.todoQueriesProxy.executeQuery(queryId);
  }

  inResults(query: TodoQuery, item: TodoListItem): boolean {
    if (query.operand == QueryOperand.DueDate) {
      if (query.operator == QueryOperator.Equals) {
        return this.dueDateService.toEndOfDay(query.dateValue).getTime() == this.dueDateService.toEndOfDay(item.dueDate).getTime();
      } else if (query.operator == QueryOperator.NotEquals) {
        return this.dueDateService.toEndOfDay(query.dateValue).getTime() != this.dueDateService.toEndOfDay(item.dueDate).getTime();
      }
    } else if (query.operand == QueryOperand.Important) {
      if (query.operator == QueryOperator.Equals) {
        return query.boolValue = item.important;
      } else if (query.operator == QueryOperator.NotEquals) {
        return query.boolValue != item.important;
      }
    }

    return false;
  }
}