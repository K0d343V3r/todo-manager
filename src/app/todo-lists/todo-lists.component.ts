import { Component, OnInit } from '@angular/core';
import { TodoElement, TodoElementsProxy, TodoList, TodoListsProxy } from '../proxies/todo-api-proxies';
import { MatDialog, MatDialogConfig } from "@angular/material";
import { TodoListDialogComponent } from '../todo-list-dialog/todo-list-dialog.component';
import { ActivatedRoute, Router } from "@angular/router";
import { TodoListService } from "../services/todo-list.service"

@Component({
  selector: 'app-todo-lists',
  templateUrl: './todo-lists.component.html',
  styleUrls: ['./todo-lists.component.css']
})
export class TodoListsComponent implements OnInit {
  selectedElementIndex: number = -1;
  todoElements: TodoElement[] = [];

  constructor(
    private todoListService: TodoListService,
    private router: Router,
    private todoElementsProxy: TodoElementsProxy,
    private todoListsProxy: TodoListsProxy,
    private dialog: MatDialog) { }

  ngOnInit() {
    this.getLists();

    this.todoListService.listChanged$.subscribe(id => this.processListChange(id));
  }

  processListChange(id: number) {
    // let's assume the currently selected list changed
    if (this.todoElements[this.selectedElementIndex].id == id) {
      this.todoElementsProxy.getListElement(id).subscribe(element => this.processElement(element));
    }
  }

  processElement(element: TodoElement) {
    this.todoElements.splice(this.selectedElementIndex, 1, element);
  }

  getLists(): void {
    this.todoElementsProxy.getAllListElements()
      .subscribe(elements => this.processElements(elements));
  }

  private processElements(elements: TodoElement[]) {
    this.todoElements = elements;
    if (elements.length > 0) {
      this.selectedElementIndex = 0;
      // navigate to first todo list
      this.router.navigate([`items/${elements[0].id}`]);
    }
  }

  addList(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {};

    const dialogRef = this.dialog.open(TodoListDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(
      val => { if (val != null) this.addlist(val.name); }
    );
  }

  private addlist(name: string): void {
    const list = new TodoList();
    list.name = name;
    list.position = this.todoElements.length;
    this.todoListsProxy.createList(list).subscribe(list => this.processCreation(list));
  }

  private processCreation(list: TodoList): void {
    const element = new TodoElement({ id: list.id, name: list.name, position: list.position, childCount: list.items.length });
    this.todoElements.push(element);
    this.selectedElementIndex = this.todoElements.length - 1;
    this.router.navigate([`items/${list.id}`]);
  }

  public onSelected(index: number): void {
    this.selectedElementIndex = index;
  }

  public removeList(): void {
    const id = this.todoElements[this.selectedElementIndex].id;
    this.todoListsProxy.deleteList(id).subscribe(() => this.processDeletion());
  }

  private processDeletion(): void {
    this.todoElements.splice(this.selectedElementIndex, 1);
    if (this.todoElements.length == 0) {
      // list is empty, let's go home
      this.selectedElementIndex = -1;
      this.router.navigate(['']);
    }
    else {
      if (this.selectedElementIndex == this.todoElements.length) {
        // route to the last one in the list
        this.selectedElementIndex -= 1;
      }
      this.router.navigate([`items/${this.todoElements[this.selectedElementIndex].id}`]);
    }
  }

  editList(index: number): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = { name: this.todoElements[index].name };

    const dialogRef = this.dialog.open(TodoListDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(
      val => { if (val != null) this.editlist(val.name); }
    );
  }

  private editlist(name: string): void {
    const info = this.todoElements[this.selectedElementIndex];
    info.name = name;
    this.todoElementsProxy.updateListElement(info.id, info).subscribe();
  }

  moveUp(): void {
    const info = this.todoElements[this.selectedElementIndex];
    info.position = this.selectedElementIndex - 1;
    this.todoElementsProxy.updateListElement(info.id, info).subscribe(() => this.processMove(true));
  }

  private processMove(up: boolean): void {
    const deletedInfos = this.todoElements.splice(this.selectedElementIndex, 1);
    this.selectedElementIndex = up ? this.selectedElementIndex - 1 : this.selectedElementIndex + 1;
    this.todoElements.splice(this.selectedElementIndex, 0, deletedInfos[0]);
  }

  moveDown(): void {
    const info = this.todoElements[this.selectedElementIndex];
    info.position = this.selectedElementIndex + 1;
    this.todoElementsProxy.updateListElement(info.id, info).subscribe(() => this.processMove(false));
  }
}
