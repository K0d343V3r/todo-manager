import { Component, OnInit } from '@angular/core';
import { TodoListInfo, TodoListInfosProxy, TodoList, TodoListsProxy } from '../proxies/todo-api-proxies';
import { MatDialog, MatDialogConfig } from "@angular/material";
import { TodoListDialogComponent } from '../todo-list-dialog/todo-list-dialog.component';
import { Router } from "@angular/router";

@Component({
  selector: 'app-todo-lists',
  templateUrl: './todo-lists.component.html',
  styleUrls: ['./todo-lists.component.css']
})
export class TodoListsComponent implements OnInit {

  todoListInfos: TodoListInfo[];

  constructor(
    private router: Router,
    private todoListInfosProxy: TodoListInfosProxy, 
    private todoListsProxy: TodoListsProxy, 
    private dialog: MatDialog) { }

  ngOnInit() {
    this.getLists();
  }

  getLists(): void {
    this.todoListInfosProxy.getAllListInfos()
      .subscribe(infos => this.todoListInfos = infos);
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
    list.position = this.todoListInfos.length;
    this.todoListsProxy.createList(list).subscribe(list => this.processCreation(list));
  }

  private processCreation(list: TodoList){
    this.todoListInfos.push(new TodoListInfo({id: list.id, name: list.name}));
    this.router.navigate([`items/${list.id}`]);
  }
}
