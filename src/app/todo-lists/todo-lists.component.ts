import { Component, OnInit } from '@angular/core';
import { TodoList, TodoListsProxy } from '../proxies/todo-api-proxies';

@Component({
  selector: 'app-todo-lists',
  templateUrl: './todo-lists.component.html',
  styleUrls: ['./todo-lists.component.css']
})
export class TodoListsComponent implements OnInit {

  todoLists: TodoList[];

  constructor(private todoListsProxy: TodoListsProxy) { }

  ngOnInit() {
    this.getLists();
  }

  getLists(): void {
    this.todoListsProxy.getAllLists()
        .subscribe(todoLists => this.todoLists = todoLists);
  }
}
