import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export class ItemCountChangedEventArgs {
  constructor(public id: number, public itemCount: number) {}
}

export class NameChangedEventArgs {
  constructor(public id: number, public name: string) {}
}

@Injectable({
  providedIn: 'root'
})
export class TodoListService {
  private itemCountChangedSource = new Subject<ItemCountChangedEventArgs>();
  itemCountChanged$ = this.itemCountChangedSource.asObservable();

  private listNameChangedSource = new Subject<NameChangedEventArgs>();
  listNameChanged$ = this.listNameChangedSource.asObservable();

  constructor() { }

  fireItemCountChanged(args: ItemCountChangedEventArgs): void {
    this.itemCountChangedSource.next(args);
  }

  fireNameChanged(args: NameChangedEventArgs): void {
    this.listNameChangedSource.next(args);
  }
}
