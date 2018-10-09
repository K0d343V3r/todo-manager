import { Component, OnInit, ViewChild } from '@angular/core';
import { TodoList, TodoListItem, TodoListsProxy, TodoItemsProxy } from '../proxies/todo-api-proxies';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { MatTable } from '@angular/material';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MatDialog, MatDialogConfig } from "@angular/material";
import { TodoItemDialogComponent } from '../todo-item-dialog/todo-item-dialog.component';
import { TodoListService } from "../services/todo-list.service"

@Component({
  selector: 'app-todo-items',
  templateUrl: './todo-items.component.html',
  styleUrls: ['./todo-items.component.css']
})
export class TodoItemsComponent implements OnInit {
  private todoListId: number;
  todoList$: Observable<TodoList>;
  todoItems: TodoListItem[];
  title: string;
  columnsToDisplay: string[] = ['done', 'task', 'edit'];
  selectedItemIndex: number = -1;

  @ViewChild(MatTable) table: MatTable<any>;

  constructor(
    private todoListService: TodoListService,
    private route: ActivatedRoute,
    private todoListsProxy: TodoListsProxy,
    private todoItemsProxy: TodoItemsProxy,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.todoList$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
        this.todoListsProxy.getList(+params.get('id')))
    );
    this.todoList$.subscribe(list => this.processList(list));
  }

  private processList(list: TodoList) {
    this.todoItems = list.items;
    this.title = list.name;
    this.todoListId = list.id;
    this.selectedItemIndex = list.items.length == 0 ? -1 : 0;
  }

  public onSelected(index: number) {
    this.selectedItemIndex = index;
  }

  public addItem(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {};

    const dialogRef = this.dialog.open(TodoItemDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(
      val => { if (val != null) this.addItemInternal(val.task); }
    );
  }

  private addItemInternal(task: string): void {
    const item = new TodoListItem();
    item.todoListId = this.todoListId;
    item.task = task;
    item.position = this.todoItems.length;
    this.todoItemsProxy.createItem(item).subscribe(item => this.processCreation(item));
  }

  public processCreation(item: TodoListItem) {
    this.todoItems.push(item);
    this.table.renderRows();
    this.selectedItemIndex = this.todoItems.length - 1;
    this.todoListService.fireListChanged(this.todoListId);
  }

  public itemChecked(event): void {
    const item = this.todoItems[this.selectedItemIndex];
    item.done = event.checked;
    this.todoItemsProxy.updateItem(item.id, item).subscribe();
  }

  public removeItem(): void {
    this.todoItemsProxy.deleteItem(
      this.todoItems[this.selectedItemIndex].id).subscribe(() => this.processDeletion());
  }

  private processDeletion(): void {
    this.todoItems.splice(this.selectedItemIndex, 1);
    this.table.renderRows();
    if (this.selectedItemIndex == this.todoItems.length) {
      this.selectedItemIndex -= 1;
    }
    this.todoListService.fireListChanged(this.todoListId);
  }

  public editItem(index: number): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = { task: this.todoItems[index].task };

    const dialogRef = this.dialog.open(TodoItemDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(
      val => { if (val != null) this.editItemInternal(val.task); }
    );
  }

  private editItemInternal(task: string): void {
    const item = this.todoItems[this.selectedItemIndex];
    item.task = task;
    this.todoItemsProxy.updateItem(item.id, item).subscribe();
  }

  moveUp(): void {
    const item = this.todoItems[this.selectedItemIndex];
    item.position = this.selectedItemIndex - 1;
    this.todoItemsProxy.updateItem(item.id, item).subscribe(() => this.processMove(true));
  }

  private processMove(up: boolean): void {
    const deletedItems = this.todoItems.splice(this.selectedItemIndex, 1);
    this.selectedItemIndex = up ? this.selectedItemIndex - 1 : this.selectedItemIndex + 1;
    this.todoItems.splice(this.selectedItemIndex, 0, deletedItems[0]);
    this.table.renderRows();
  }

  moveDown(): void {
    const item = this.todoItems[this.selectedItemIndex];
    item.position = this.selectedItemIndex + 1;
    this.todoItemsProxy.updateItem(item.id, item).subscribe(() => this.processMove(false));
  }
}