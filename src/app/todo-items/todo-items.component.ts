import { Component, OnInit, ViewChild } from '@angular/core';
import { TodoList, TodoListItem, TodoListsProxy, TodoItemsProxy } from '../proxies/todo-api-proxies';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { MatTable } from '@angular/material';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-todo-items',
  templateUrl: './todo-items.component.html',
  styleUrls: ['./todo-items.component.css']
})
export class TodoItemsComponent implements OnInit {
  todoList$: Observable<TodoList>; 
  todoItems: TodoListItem[];
  title: string;
  columnsToDisplay: string[] = ['task'];
  @ViewChild(MatTable) table: MatTable<any>;

  constructor(
    private route: ActivatedRoute,
    private todoListsProxy: TodoListsProxy,
    private todoItemsProxy: TodoItemsProxy) { }

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
  }
}
