import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { TodoQueryResults, TodoQueriesProxy } from '../proxies/todo-api-proxies';
import { DueDateService } from '../services/due-date.service'
import { TodoItemDialogDataValues } from '../todo-item-dialog/todo-item-dialog.component'

@Injectable({
  providedIn: 'root'
})
export class TodoQueryService {
  private queryExecutedSource = new Subject<TodoQueryResults>();
  private queryDefaultValueCallbacks = new Map<number, () => TodoItemDialogDataValues>();

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

  registerDefaultValueCallback(queryId: number, callback: () => TodoItemDialogDataValues) {
    this.queryDefaultValueCallbacks.set(queryId, callback);
  }

  getQueryDefaultValues(queryId: number): TodoItemDialogDataValues {
    const callback = this.queryDefaultValueCallbacks.get(queryId);
    if (callback != null) {
      return callback();
    } else {
      return null;
    }
  }
}