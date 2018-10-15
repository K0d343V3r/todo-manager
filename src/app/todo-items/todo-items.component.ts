import { Component, OnInit, ViewChild } from '@angular/core';
import { TodoList, TodoListItem, TodoListsProxy, TodoItemsProxy } from '../proxies/todo-api-proxies';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { MatTable } from '@angular/material';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MatDialog, MatDialogConfig } from "@angular/material";
import { TodoItemDialogComponent, TodoItemDialogData } from '../todo-item-dialog/todo-item-dialog.component';
import { TodoListService, ItemCountChangedEventArgs, NameChangedEventArgs } from "../services/todo-list.service"
import { DueDateOption, DueDateService } from '../services/due-date.service'

@Component({
  selector: 'app-todo-items',
  templateUrl: './todo-items.component.html',
  styleUrls: ['./todo-items.component.css']
})
export class TodoItemsComponent implements OnInit {
  private todoListId: number;
  todoList$: Observable<TodoList>;
  todoItems: TodoListItem[] = [];
  title: string;
  columnsToDisplay: string[] = ['done', 'task', 'dueDate', 'edit'];
  selectedItemIndex: number = -1;

  @ViewChild(MatTable) table: MatTable<any>;

  constructor(
    private dueDateService: DueDateService,
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

    this.todoListService.nameChanged$.subscribe(args => this.processNameChange(args));
  }

  private processNameChange(args: NameChangedEventArgs) {
    if (args.id == this.todoListId) {
      this.title = args.name;
    }
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

    const dialogRef = this.dialog.open(TodoItemDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(data => { if (data != null) this.addItemInternal(data); });
  }

  private addItemInternal(data: TodoItemDialogData): void {
    const item = new TodoListItem();
    item.todoListId = this.todoListId;
    item.task = data.task;
    item.dueDate = data.dueDate;
    item.position = this.todoItems.length;
    this.todoItemsProxy.createItem(item).subscribe(item => this.processCreation(item));
  }

  public processCreation(item: TodoListItem) {
    this.todoItems.push(item);
    this.table.renderRows();
    this.selectedItemIndex = this.todoItems.length - 1;
    const args = new ItemCountChangedEventArgs(this.todoListId, this.todoItems.length);
    this.todoListService.fireItemCountChanged(args);
  }

  public itemChecked(event): void {
    const item = this.todoItems[this.selectedItemIndex];
    item.done = event.checked;
    // make sure position is up to date, otherwise server may move item
    item.position = this.selectedItemIndex;

    // update in server
    this.todoItemsProxy.updateItem(item.id, item).subscribe();
  }

  public removeItem(): void {
    const removedItems = this.todoItems.splice(this.selectedItemIndex, 1);
    this.table.renderRows();
    if (this.selectedItemIndex == this.todoItems.length) {
      this.selectedItemIndex -= 1;
    }
    const args = new ItemCountChangedEventArgs(this.todoListId, this.todoItems.length);
    this.todoListService.fireItemCountChanged(args);

    // update in server
    this.todoItemsProxy.deleteItem(removedItems[0].id).subscribe();
  }

  public editItem(index: number): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = new TodoItemDialogData(
      this.todoItems[index].task,
      this.todoItems[index].dueDate);

    const dialogRef = this.dialog.open(TodoItemDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(data => { if (data != null) this.editItemInternal(data); }
    );
  }

  private editItemInternal(data: TodoItemDialogData): void {
    const item = this.todoItems[this.selectedItemIndex];
    item.task = data.task;
    item.dueDate = data.dueDate;
    // make sure position is up to date, otherwise server may move item
    item.position = this.selectedItemIndex;

    // update in server
    this.todoItemsProxy.updateItem(item.id, item).subscribe();
  }

  moveUp(): void {
    this.move(true);
  }

  private move(up: boolean) {
    const itemsToMove = this.todoItems.splice(this.selectedItemIndex, 1);
    itemsToMove[0].position = up ? this.selectedItemIndex - 1 : this.selectedItemIndex + 1;
    this.todoItems.splice(itemsToMove[0].position, 0, itemsToMove[0]);
    this.selectedItemIndex = itemsToMove[0].position;
    this.table.renderRows();

    // update in server
    this.todoItemsProxy.updateItem(itemsToMove[0].id, itemsToMove[0]).subscribe();
  }

  moveDown(): void {
    this.move(false);
  }

  getDueString(date: Date): string {
    const option = this.dueDateService.dateToEnum(date);
    if (option == DueDateOption.None) {
      return "";
    } else {
      return this.dueDateService.toString(option, date);
    }
  }
}