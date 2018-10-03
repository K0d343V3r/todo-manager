import { Component, OnInit } from '@angular/core';
import { TodoListInfo, TodoListInfosProxy, TodoList, TodoListsProxy } from '../proxies/todo-api-proxies';
import { MatDialog, MatDialogConfig } from "@angular/material";
import { TodoListDialogComponent } from '../todo-list-dialog/todo-list-dialog.component';
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: 'app-todo-lists',
  templateUrl: './todo-lists.component.html',
  styleUrls: ['./todo-lists.component.css']
})
export class TodoListsComponent implements OnInit {
  selectedInfoIndex: number = -1;
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
      .subscribe(infos => this.processInfos(infos));
  }

  private processInfos(infos : TodoListInfo[]){
    this.todoListInfos = infos;
    if (infos.length > 0)
    {
      this.selectedInfoIndex = 0;
      this.router.navigate([`items/${infos[0].id}`]);
    }
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
    this.selectedInfoIndex = this.todoListInfos.length - 1;
    this.router.navigate([`items/${list.id}`]);
  }

  public onSelected(index: number) : void {
    this.selectedInfoIndex = index;
  }

  public removeList() : void {
    const id = this.todoListInfos[this.selectedInfoIndex].id;
    this.todoListsProxy.deleteList(id).subscribe(() => this.processDeletion());
  }

  private processDeletion() : void {
    this.todoListInfos.splice(this.selectedInfoIndex, 1);
    if (this.todoListInfos.length == 0)
    {
      // list is empty, let's go home
      this.router.navigate(['']);
    }
    else
    {
      if (this.selectedInfoIndex == this.todoListInfos.length)
      {
        // route to the last one in the list
        this.selectedInfoIndex -= 1;
      }
      this.router.navigate([`items/${this.todoListInfos[this.selectedInfoIndex].id}`]);
    }
  }
}
