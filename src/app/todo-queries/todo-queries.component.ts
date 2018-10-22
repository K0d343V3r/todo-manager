import { Component, OnInit } from '@angular/core';
import { TodoQuery, TodoQueryElement, TodoQueriesProxy, TodoElement, TodoElementsProxy, QueryOperand, QueryOperator, TodoListItem, TodoQueryResults } from '../proxies/todo-api-proxies';
import { Router } from "@angular/router";
import { TodoListService, ItemEditedEventArgs } from "../services/todo-list.service";
import { TodoQueryService } from '../services/todo-query.service';
import { DueDateService } from '../services/due-date.service'

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

  myDayElement: TodoQueryElement;
  myTasksElement: TodoElement;

  constructor(
    private todoElementsProxy: TodoElementsProxy,
    private todoQueriesProxy: TodoQueriesProxy,
    private todoListService: TodoListService,
    private todoQueryService: TodoQueryService,
    private dueDateService: DueDateService,
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
    this.todoListService.itemEdited$.subscribe(args => this.onItemEdited(args));
    this.todoQueryService.queryExecuted$.subscribe(results => this.onQueryExecuted(results));
  }

  private onItemEdited(args:  ItemEditedEventArgs) {
    const wasInResults = this.todoQueryService.inResults(this.myDayElement.query, args.oldItem);
    const isInResults = this.todoQueryService.inResults(this.myDayElement.query, args.newItem);

    if (wasInResults && !isInResults) {
      this.myDayElement.childCount--;
    } else if (!wasInResults && isInResults) {
      this.myDayElement.childCount++;
    }
  }

  private onQueryExecuted(results: TodoQueryResults) {
    if (results.todoQueryId == this.myDayQueryId) {
      this.myDayElement.childCount = results.references.length;
    }
  }

  private onListItemsChanged(item: TodoListItem, add: boolean) {
    if (item.todoListId == this.myTasksListId) {
      if (add) {
        this.myTasksElement.childCount++;
      } else {
        this.myTasksElement.childCount--;
      }
    }

    const inResults = this.todoQueryService.inResults(this.myDayElement.query, item);
    if (inResults && add) {
      this.myDayElement.childCount++;
    } else if (inResults && !add) {
      this.myDayElement.childCount--;
    }
  }

  private createMyTasksElement(): TodoElement {
    const element = new TodoElement();
    element.id = this.myTasksListId;
    element.name = this.myTasksListName;
    return element; 
  }

  private initializeMyDayQuery(query: TodoQuery) {
    // initialize query element
    this.myDayElement = new TodoQueryElement();
    this.myDayElement.childCount = 0;   // this will be sorted out once query executes
    this.myDayElement.id = query.id;
    this.myDayElement.name = query.name;
    this.myDayElement.position = query.position;
    this.myDayElement.query = query;

    // and route to it
    this.router.navigate([`results/${query.id}`]);
  }

  private createMyDayQuery(): TodoQuery {
    const query = new TodoQuery();
    query.id = this.myDayQueryId;
    query.name = this.myDayQueryName;
    query.operand = QueryOperand.DueDate;
    query.operator = QueryOperator.Equals;
    query.dateValue = this.dueDateService.toEndOfDay(new Date());
    return query;
  }
}
