import { Component, OnInit } from '@angular/core';
import { TodoElement, TodoElementsProxy, TodoList, TodoListsProxy } from '../proxies/todo-api-proxies';
import { MatDialog, MatDialogConfig } from "@angular/material";
import { TodoListDialogComponent, TodoListDialogData } from '../todo-list-dialog/todo-list-dialog.component';
import { Router, NavigationEnd } from "@angular/router";
import { TodoListService, ItemCountChangedEventArgs, NameChangedEventArgs } from "../services/todo-list.service"
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-todo-lists',
  templateUrl: './todo-lists.component.html',
  styleUrls: ['./todo-lists.component.css']
})
export class TodoListsComponent implements OnInit {
  private readonly urlSection = "items";
  private navigationEnd$: Observable<NavigationEnd>;
  selectedElementIndex: number = -1;
  todoElements: TodoElement[] = [];

  constructor(
    private todoListService: TodoListService,
    private router: Router,
    private todoElementsProxy: TodoElementsProxy,
    private todoListsProxy: TodoListsProxy,
    private dialog: MatDialog) { }

  ngOnInit() {
    this.todoElementsProxy.getAllListElements().subscribe(elements => this.todoElements = elements);
    this.todoListService.itemCountChanged$.subscribe(args => this.onItemCountChange(args));
    this.navigationEnd$ = this.router.events.pipe(filter(evt => evt instanceof NavigationEnd)) as Observable<NavigationEnd>;
    this.navigationEnd$.subscribe(event => this.onUrlChanged(event.url));
  }

  private onUrlChanged(url: string) {
    const parts: string[] = url.split("/");
    if (parts[1] == this.urlSection) {
      // parts[2] contains list id
      this.selectedElementIndex = this.todoElements.findIndex(l => l.id == +parts[2]);
    } else {
      // not our url, reset index
      this.selectedElementIndex = -1;
    }
  }

  private onItemCountChange(args: ItemCountChangedEventArgs) {
    const index = this.todoElements.findIndex(entry => entry.id == args.id);
    if (index >= 0) {
      const element = this.todoElements[index];
      element.childCount = args.itemCount;
    }
  }

  addList(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    const dialogRef = this.dialog.open(TodoListDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(data => { if (data != null) this.addlist(data); }
    );
  }

  private addlist(data: TodoListDialogData): void {
    const list = new TodoList();
    list.name = data.name;
    list.position = this.todoElements.length;
    this.todoListsProxy.createList(list).subscribe(list => this.onListCreated(list));
  }

  private onListCreated(list: TodoList): void {
    const element = new TodoElement({ id: list.id, name: list.name, position: list.position, childCount: list.items.length });
    this.todoElements.push(element);

    // select the newly created item, and route to it
    this.selectedElementIndex = this.todoElements.length - 1;
    this.router.navigate([`${this.urlSection}/${list.id}`]);
  }

  public removeList(): void {
    const elements = this.todoElements.splice(this.selectedElementIndex, 1);
    if (this.todoElements.length == 0) {
      // list is empty, let's go home
      this.selectedElementIndex = -1;
      this.router.navigate(['']);
    }
    else {
      if (this.selectedElementIndex == this.todoElements.length) {
        this.selectedElementIndex -= 1;
      }
      this.router.navigate([`${this.urlSection}/${this.todoElements[this.selectedElementIndex].id}`]);
    }

    // remove from server
    this.todoListsProxy.deleteList(elements[0].id).subscribe();
  }

  editList(index: number): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = { name: this.todoElements[index].name };

    const dialogRef = this.dialog.open(TodoListDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(data => { if (data != null) this.editlist(data); }
    );
  }

  private editlist(data: TodoListDialogData): void {
    const element = this.todoElements[this.selectedElementIndex];
    const currentName = element.name;
    element.name = data.name;
    // position may have become stale (move or delete), use current
    element.position = this.selectedElementIndex;

    if (name != currentName) {
      const args = new NameChangedEventArgs(element.id, data.name);
      this.todoListService.fireNameChanged(args);
    }

    // update in server
    this.todoElementsProxy.updateListElement(element.id, element).subscribe();
  }

  move(up: boolean) {
    const elementToMove = this.todoElements.splice(this.selectedElementIndex, 1);
    elementToMove[0].position = up ? this.selectedElementIndex - 1 : this.selectedElementIndex + 1;
    this.todoElements.splice(elementToMove[0].position, 0, elementToMove[0]);
    this.selectedElementIndex = elementToMove[0].position;

    // update in server
    this.todoElementsProxy.updateListElement(elementToMove[0].id, elementToMove[0]).subscribe();
  }
}
