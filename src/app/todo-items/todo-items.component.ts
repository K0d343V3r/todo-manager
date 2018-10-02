import { Component, OnInit, ViewChild } from '@angular/core';
import { TodoList, TodoListItem, TodoListsProxy, TodoItemsProxy } from '../proxies/todo-api-proxies';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { MatTable } from '@angular/material';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MatDialog, MatDialogConfig } from "@angular/material";
import { TodoItemDialogComponent } from '../todo-item-dialog/todo-item-dialog.component';

@Component({
  selector: 'app-todo-items',
  templateUrl: './todo-items.component.html',
  styleUrls: ['./todo-items.component.css']
})
export class TodoItemsComponent implements OnInit {
  private todoListId : number;
  todoList$: Observable<TodoList>; 
  todoItems: TodoListItem[];
  title: string;
  columnsToDisplay: string[] = ['done', 'task'];
  selectedRowIndex: number = -1;

  @ViewChild(MatTable) table: MatTable<any>;

  constructor(
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

  private processList(list: TodoList){
    this.todoItems = list.items;
    this.title = list.name;
    this.todoListId = list.id;
  }

  public highlight(row) {
    this.selectedRowIndex = row.position;
  }

  public addItem() : void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {};

    const dialogRef = this.dialog.open(TodoItemDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(
      val => {if (val != null) this.addItemInternal(val.task);}
    );   
  }

  private addItemInternal(task:string): void {
    const item = new TodoListItem();
    item.todoListId = this.todoListId;
    item.task = task;
    item.position = this.todoItems.length;
    this.todoItemsProxy.createItem(item).subscribe(item => this.processCreation(item));
  }

  public processCreation(item: TodoListItem){
    this.todoItems.push(item);
    this.table.renderRows();
    this.selectedRowIndex = this.todoItems.length - 1;
  }
}
