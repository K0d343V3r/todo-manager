import { Component, OnInit } from '@angular/core';
import { TodoListInfo, TodoListInfosProxy, TodoList, TodoListsProxy } from '../proxies/todo-api-proxies';
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
  selectedInfoIndex: number = -1;
  todoListInfos: TodoListInfo[] = [];

  constructor(
    private todoListService: TodoListService,
    private router: Router,
    private todoListInfosProxy: TodoListInfosProxy,
    private todoListsProxy: TodoListsProxy,
    private dialog: MatDialog) { }

  ngOnInit() {
    this.getLists();

    this.todoListService.listChanged$.subscribe(id => this.processListChange(id));
  }

  processListChange(id: number) {
    // let's assume the currently selected list changed
    if (this.todoListInfos[this.selectedInfoIndex].id == id) {
      this.todoListInfosProxy.getListInfo(id).subscribe(info => this.processInfo(info));
    }
  }

  processInfo(info: TodoListInfo) {
    this.todoListInfos.splice(this.selectedInfoIndex, 1, info);
  }

  getLists(): void {
    this.todoListInfosProxy.getAllListInfos()
      .subscribe(infos => this.processInfos(infos));
  }

  private processInfos(infos: TodoListInfo[]) {
    this.todoListInfos = infos;
    if (infos.length > 0) {
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
      val => { if (val != null) this.addlist(val.name); }
    );
  }

  private addlist(name: string): void {
    const list = new TodoList();
    list.name = name;
    list.position = this.todoListInfos.length;
    this.todoListsProxy.createList(list).subscribe(list => this.processCreation(list));
  }

  private processCreation(list: TodoList): void {
    const info = new TodoListInfo({ id: list.id, name: list.name, position: list.position, itemCount: list.items.length });
    this.todoListInfos.push(info);
    this.selectedInfoIndex = this.todoListInfos.length - 1;
    this.router.navigate([`items/${list.id}`]);
  }

  public onSelected(index: number): void {
    this.selectedInfoIndex = index;
  }

  public removeList(): void {
    const id = this.todoListInfos[this.selectedInfoIndex].id;
    this.todoListsProxy.deleteList(id).subscribe(() => this.processDeletion());
  }

  private processDeletion(): void {
    this.todoListInfos.splice(this.selectedInfoIndex, 1);
    if (this.todoListInfos.length == 0) {
      // list is empty, let's go home
      this.selectedInfoIndex = -1;
      this.router.navigate(['']);
    }
    else {
      if (this.selectedInfoIndex == this.todoListInfos.length) {
        // route to the last one in the list
        this.selectedInfoIndex -= 1;
      }
      this.router.navigate([`items/${this.todoListInfos[this.selectedInfoIndex].id}`]);
    }
  }

  editList(index: number): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = { name: this.todoListInfos[index].name };

    const dialogRef = this.dialog.open(TodoListDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(
      val => { if (val != null) this.editlist(val.name); }
    );
  }

  private editlist(name: string): void {
    const info = this.todoListInfos[this.selectedInfoIndex];
    info.name = name;
    this.todoListInfosProxy.updateListInfo(info.id, info).subscribe();
  }

  moveUp(): void {
    const info = this.todoListInfos[this.selectedInfoIndex];
    info.position = this.selectedInfoIndex - 1;
    this.todoListInfosProxy.updateListInfo(info.id, info).subscribe(() => this.processMove(true));
  }

  private processMove(up: boolean): void {
    const deletedInfos = this.todoListInfos.splice(this.selectedInfoIndex, 1);
    this.selectedInfoIndex = up ? this.selectedInfoIndex - 1 : this.selectedInfoIndex + 1;
    this.todoListInfos.splice(this.selectedInfoIndex, 0, deletedInfos[0]);
  }

  moveDown(): void {
    const info = this.todoListInfos[this.selectedInfoIndex];
    info.position = this.selectedInfoIndex + 1;
    this.todoListInfosProxy.updateListInfo(info.id, info).subscribe(() => this.processMove(false));
  }
}
