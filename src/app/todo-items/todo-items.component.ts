import { Component, OnInit, ViewChild } from '@angular/core';
import { TodoList, TodoListItem, TodoListsProxy, TodoItemsProxy } from '../proxies/todo-api-proxies';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MatDialog, MatDialogConfig } from "@angular/material";
import { TodoItemDialogComponent, TodoItemDialogData, TodoItemDialogDataValues } from '../todo-item-dialog/todo-item-dialog.component';
import { TodoListService, NameChangedEventArgs } from "../services/todo-list.service";
import { TodoItemTableComponent } from '../todo-item-table/todo-item-table.component';

@Component({
  selector: 'app-todo-items',
  templateUrl: './todo-items.component.html',
  styleUrls: ['./todo-items.component.css']
})
export class TodoItemsComponent implements OnInit {
  private todoListId: number;
  private todoList$: Observable<TodoList>;
  @ViewChild(TodoItemTableComponent) private itemTable: TodoItemTableComponent;
  title: string;

  constructor(
    private todoListService: TodoListService,
    private route: ActivatedRoute,
    private todoListsProxy: TodoListsProxy,
    private todoItemsProxy: TodoItemsProxy,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.todoList$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => this.todoListsProxy.getList(+params.get('id')))
    );

    this.todoList$.subscribe(list => this.onTodoListChanged(list));
    this.itemTable.selectedItemEdited.subscribe(item => this.onSelectedItemEdited(item));
    this.todoListService.listNameChanged$.subscribe(args => this.onListNameChanged(args));
  }

  private onListNameChanged(args: NameChangedEventArgs) {
    if (args.listId == this.todoListId) {
      this.title = args.name;
    }
  }

  private onTodoListChanged(list: TodoList) {
    this.itemTable.addItems(list.items);
    this.title = list.name;
    this.todoListId = list.id;
  }

  public addItem(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = new TodoItemDialogData(true);

    const dialogRef = this.dialog.open(TodoItemDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(values => { if (values != null) this.addItemInternal(values); });
  }

  private addItemInternal(values: TodoItemDialogDataValues): void {
    const item = new TodoListItem();
    item.todoListId = this.todoListId;
    item.task = values.task;
    item.dueDate = values.dueDate;
    item.position = this.itemTable.count;
    this.todoItemsProxy.createItem(item).subscribe(item => this.onItemCreated(item));
  }

  public onItemCreated(item: TodoListItem) {
    this.itemTable.addItem(item.position, item);
  }

  public removeItem(): void {
    const id = this.itemTable.removeSelected();

    // update in server
    this.todoItemsProxy.deleteItem(id).subscribe();
  }

  private onSelectedItemEdited(item: TodoListItem): void {
    // make sure position is up to date, otherwise server may move item
    item.position = this.itemTable.selectedItemIndex;

    // update in server
    this.todoItemsProxy.updateItem(item.id, item).subscribe();
  }

  private move(up: boolean) {
    const position = this.itemTable.moveSelected(up);
    const item = this.itemTable.getItemAt(this.itemTable.selectedItemIndex);
    item.position = position;

    // update in server
    this.todoItemsProxy.updateItem(item.id, item).subscribe();
  }
}