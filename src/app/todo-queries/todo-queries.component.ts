import { Component, OnInit } from '@angular/core';
import { TodoQuery, TodoQueriesProxy, TodoElement, TodoElementsProxy, QueryOperand, QueryOperator, TodoListItem } from '../proxies/todo-api-proxies';
import { Router } from "@angular/router";
import { TodoListService } from "../services/todo-list.service";

@Component({
  selector: 'app-todo-queries',
  templateUrl: './todo-queries.component.html',
  styleUrls: ['./todo-queries.component.css']
})
export class TodoQueriesComponent implements OnInit {
  private readonly myDayQueryId: number = 1;
  private readonly myDayQueryName: string = "My Day";
  private readonly myTasksListId: number = 1;
  private readonly myTasksListName: string = "My Tasks";

  myDayQuery: TodoQuery;
  myDayQueryResultCount: number;

  myTasksElement: TodoElement;

  constructor(
    private todoElementsProxy: TodoElementsProxy,
    private todoQueriesProxy: TodoQueriesProxy,
    private todoListService: TodoListService,
    private router: Router
  ) { }

  ngOnInit() {
    // attempt to update query to today's date
    const myDayQuery = this.createMyDayQuery();
    this.todoQueriesProxy.updateQuery(this.myDayQueryId, myDayQuery).subscribe(query => {
      this.initializeMyDayQuery(query);
    }, ex => {
      if (ex.status == 404) {
        // my day query does not exist, create it now
        myDayQuery.id = 0; // ids are auto-generated
        this.todoQueriesProxy.createQuery(myDayQuery).subscribe(query => this.initializeMyDayQuery(query));
      }
    });

    // update default list name
    this.myTasksElement = this.createMyTasksElement();
    this.todoElementsProxy.updateListElement(this.myTasksElement.id, this.myTasksElement).subscribe(
      element => this.myTasksElement = element
    );

    this.todoListService.itemAdded$.subscribe(item => this.onListItemsChanged(item, true));
    this.todoListService.itemRemoved$.subscribe(item => this.onListItemsChanged(item, false));
  }

  private onListItemsChanged(item: TodoListItem, add: boolean) {
    if (item.todoListId == this.myTasksListId) {
      if (add) {
        this.myTasksElement.childCount++;
      } else {
        this.myTasksElement.childCount--;
      }
    }
  }

  private createMyTasksElement(): TodoElement {
    const element = new TodoElement();
    element.id = this.myTasksListId;
    element.name = this.myTasksListName;
    return element; 
  }

  private initializeMyDayQuery(query: TodoQuery) {
    // initialize query
    this.myDayQuery = query;

    // and route to it
    this.router.navigate([`results/${query.id}`]);
  }

  private createMyDayQuery(): TodoQuery {
    const query = new TodoQuery();
    query.id = this.myDayQueryId;
    query.name = this.myDayQueryName;
    query.operand = QueryOperand.DueDate;
    query.operator = QueryOperator.Equals;
    query.dateValue = new Date();
    return query;
  }
}
