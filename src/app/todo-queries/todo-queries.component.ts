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
  private readonly importantQueryId: number = 2;
  private readonly importantQueryName: string = "Important";
  private readonly myTasksListId: number = 1;
  private readonly myTasksListName: string = "My Tasks";

  myDayElement: TodoQueryElement;
  importantElement: TodoQueryElement;
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
      this.onMyDayQueryRetrieved(query);
    }, ex => {
      if (ex.status == 404) {
        // my day query does not exist, create it now
        myDayQuery.id = 0; // ids are auto-generated
        this.todoQueriesProxy.createQuery(myDayQuery).subscribe(query => this.onMyDayQueryRetrieved(query));
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

  private onItemEdited(args: ItemEditedEventArgs) {
    this.checkQueryCountsEdit(this.myDayElement, args);
    this.checkQueryCountsEdit(this.importantElement, args);
  }

  private checkQueryCountsEdit(element: TodoQueryElement, args: ItemEditedEventArgs) {
    const wasInResults = this.todoQueryService.inResults(element.query, args.oldItem);
    const isInResults = this.todoQueryService.inResults(element.query, args.newItem);

    if (wasInResults && !isInResults) {
      element.childCount--;
    } else if (!wasInResults && isInResults) {
      element.childCount++;
    }
  }

  private onQueryExecuted(results: TodoQueryResults) {
    if (results.todoQueryId == this.myDayQueryId) {
      this.myDayElement.childCount = results.references.length;
    } else if (results.todoQueryId == this.importantQueryId) {
      this.importantElement.childCount = results.references.length;
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

    this.checkQueryCounts(this.myDayElement, item, add);
    this.checkQueryCounts(this.importantElement, item, add);
  }

  private checkQueryCounts(element: TodoQueryElement, item: TodoListItem, add: boolean) {
    const inResults = this.todoQueryService.inResults(element.query, item);
    if (inResults && add) {
      element.childCount++;
    } else if (inResults && !add) {
      element.childCount--;
    }
  }

  private createMyTasksElement(): TodoElement {
    const element = new TodoElement();
    element.id = this.myTasksListId;
    element.name = this.myTasksListName;
    return element;
  }

  private onMyDayQueryRetrieved(query: TodoQuery) {
    // initialize query element
    this.myDayElement = this.toQueryElement(query);

    // load important query - this is done after myDay query is created to guarantee correct ids
    this.todoElementsProxy.getQueryElement(this.importantQueryId).subscribe(element => {
      this.initializeImportantElement(element);
    }, ex => {
      if (ex.status == 404) {
        // important query does not exist, create it
        const query = new TodoQuery();
        query.operand = QueryOperand.Important;
        query.operator = QueryOperator.Equals;
        query.boolValue = true;
        query.name = this.importantQueryName;
        this.todoQueriesProxy.createQuery(query).subscribe(query => {
          this.initializeImportantElement(this.toQueryElement(query));
        });
      }
    });

    // and route to it
    this.router.navigate([`results/${query.id}`]);
  }

  private initializeImportantElement(element: TodoQueryElement) {
    this.importantElement = element;

    // do not show stale counts
    this.importantElement.childCount = 0;

    // run query to make sure counts are correct
    this.todoQueryService.executeQuery(element.id);
  }

  private toQueryElement(query: TodoQuery): TodoQueryElement {
    var element = new TodoQueryElement();
    element.childCount = 0;
    element.id = query.id;
    element.name = query.name;
    element.position = query.position;
    element.query = query;
    return element;
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
