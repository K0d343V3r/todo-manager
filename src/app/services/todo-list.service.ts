import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { TodoListItem } from '../proxies/todo-api-proxies';

export class NameChangedEventArgs {
  constructor(public listId: number, public name: string) {}
}

@Injectable({
  providedIn: 'root'
})
export class TodoListService {
  private itemAddedSource = new Subject<TodoListItem>();
  itemAdded$ = this.itemAddedSource.asObservable();

  private itemRemovedSource = new Subject<TodoListItem>();
  itemRemoved$ = this.itemRemovedSource.asObservable();

  private itemEditedSource = new Subject<TodoListItem>();
  itemEdited$ = this.itemEditedSource.asObservable();

  private listNameChangedSource = new Subject<NameChangedEventArgs>();
  listNameChanged$ = this.listNameChangedSource.asObservable();

  constructor() { }

  fireItemAdded(item: TodoListItem): void {
    this.itemAddedSource.next(item);
  }

  fireItemRemoved(item: TodoListItem): void {
    this.itemRemovedSource.next(item);
  }

  fireItemEdited(item: TodoListItem): void {
    this.itemEditedSource.next(item);
  }

  fireNameChanged(args: NameChangedEventArgs): void {
    this.listNameChangedSource.next(args);
  }
}
