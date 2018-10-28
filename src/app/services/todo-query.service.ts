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
      const date = this.resolveDateValue(query);
      if (query.operator == QueryOperator.Equals) {
        return this.dueDateService.isSameDay(date, item.dueDate);
      } else if (query.operator == QueryOperator.NotEquals) {
        return !this.dueDateService.isSameDay(date, item.dueDate);
      } else if (query.operator == QueryOperator.GreaterThan) {
        return this.dueDateService.isLaterDay(item.dueDate, date);
      } else if (query.operator == QueryOperator.LessThan) {
        return this.dueDateService.isEarlierDay(item.dueDate, date);
      } else if (query.operator == QueryOperator.LessThanOrEquals) {
        return this.dueDateService.isSameDay(item.dueDate, date) ||
          this.dueDateService.isEarlierDay(item.dueDate, date);
      } else if (query.operator == QueryOperator.GreaterThanOrEquals) {
        return this.dueDateService.isSameDay(item.dueDate, date) ||
          this.dueDateService.isLaterDay(item.dueDate, date);
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

  resolveDateValue(query: TodoQuery): Date {
    if (query.relativeDateValue == null) {
      return query.absoluteDateValue;
    } else {
      return this.dueDateService.getFromToday(query.relativeDateValue);
    }
  }
}