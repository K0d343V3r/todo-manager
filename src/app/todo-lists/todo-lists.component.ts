import { Component, OnInit } from '@angular/core';
import { TodoList, TodoListsProxy } from '../proxies/todo-api-proxies';
import { MatDialog, MatDialogConfig } from "@angular/material";
import { TodoListDialogComponent } from '../todo-list-dialog/todo-list-dialog.component';

@Component({
  selector: 'app-todo-lists',
  templateUrl: './todo-lists.component.html',
  styleUrls: ['./todo-lists.component.css']
})
export class TodoListsComponent implements OnInit {

  todoLists: TodoList[];

  constructor(private todoListsProxy: TodoListsProxy, private dialog: MatDialog) { }

  ngOnInit() {
    this.getLists();
  }

  getLists(): void {
    this.todoListsProxy.getAllLists()
      .subscribe(todoLists => this.todoLists = todoLists);
  }

  addList(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {};

    const dialogRef = this.dialog.open(TodoListDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(
      val => {if (val != null) this.addlist(val.name);}
    );
  }

  private addlist(name:string): void {
    const list = new TodoList();
    list.name = name;
    list.position = this.todoLists.length;
    this.todoListsProxy.createList(list)
      .subscribe(todoList => this.todoLists.push(todoList));
  }
}
