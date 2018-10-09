import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TodoListService {
  private listChangedSource = new Subject<number>();
  listChanged$ = this.listChangedSource.asObservable();

  constructor() { }

  fireListChanged(id: number): void {
    this.listChangedSource.next(id);
  }
}
