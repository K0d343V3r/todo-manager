import { Component, OnInit } from '@angular/core';
import { TodoQuery, TodoQueryElement, TodoQueriesProxy, TodoElement, TodoElementsProxy, QueryOperand, QueryOperator, TodoListItem, TodoQueryResults } from '../proxies/todo-api-proxies';
import { Router } from "@angular/router";
import { TodoListService, ItemEditedEventArgs } from "../services/todo-list.service";
import { TodoQueryService } from '../services/todo-query.service';
import { DueDateService } from '../services/due-date.service'
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-todo-queries',
  templateUrl: './todo-queries.component.html',
  styleUrls: ['./todo-queries.component.css']
})
export class TodoQueriesComponent implements OnInit {
  private updatableElements: TodoQueryElement[] = [];

  myTasksElement: TodoElement;
  queryElements: TodoQueryElement[] = [];
  queryElementIcons: string[] = [];

  constructor(
    private todoElementsProxy: TodoElementsProxy,
    private todoQueriesProxy: TodoQueriesProxy,
    private todoListService: TodoListService,
    private todoQueryService: TodoQueryService,
    private dueDateService: DueDateService,
    private router: Router
  ) {
    // my day query is first
    let element = new TodoQueryElement();
    element.id = this.queryElements.length + 1;
    element.name = "My Day";
    element.position = this.queryElements.length;
    element.query = new TodoQuery();
    element.query.id = element.id;
    element.query.name = element.name;
    element.query.operand = QueryOperand.DueDate;
    element.query.operator = QueryOperator.Equals;
    element.query.dateValue = dueDateService.toEndOfDay(new Date());
    this.queryElements.push(element);
    this.queryElementIcons.push("wb_sunny");
    this.updatableElements.push(element);

    // followed by important query
    element = new TodoQueryElement();
    element.id = this.queryElements.length + 1;
    element.name = "Important";
    element.position = this.queryElements.length;
    element.query = new TodoQuery();
    element.query.id = element.id;
    element.query.name = element.name;
    element.query.operand = QueryOperand.Important;
    element.query.operator = QueryOperator.Equals;
    element.query.boolValue = true;
    this.queryElements.push(element);
    this.queryElementIcons.push("star_border");

    this.myTasksElement = new TodoElement();
    this.myTasksElement.id = 1;
    this.myTasksElement.name = "All Tasks";
  }

  ngOnInit() {
    // initialize all queries
    this.initializeQueryElements();

    // initialize my tasks list
    this.initializeMyTasksElement();

    this.todoListService.itemAdded$.subscribe(item => this.onListItemsChanged(item, true));
    this.todoListService.itemRemoved$.subscribe(item => this.onListItemsChanged(item, false));
    this.todoListService.itemEdited$.subscribe(args => this.onItemEdited(args));
    this.todoQueryService.queryExecuted$.subscribe(results => this.onQueryExecuted(results));
  }

  private initializeMyTasksElement() {
    // update default list name
    this.todoElementsProxy.updateListElement(this.myTasksElement.id, this.myTasksElement).subscribe(
      // we only need to update remaining counts
      element => this.myTasksElement.remainingCount = element.remainingCount
    );
  }

  private createQueries(index: number) {
    // recursively create queries to get correct order
    const query = this.queryElements[index].query.clone();
    query.id = 0;
    this.todoQueriesProxy.createQuery(query).subscribe(() => {
      if (index < this.queryElements.length - 1) {
        this.createQueries(index + 1)
      } else {
        // all queries created, we can now route to default query
        this.routeToDefaultQuery();
      }
    });
  }

  private initializeQueryElements() {
    // update queries first
    const requests = this.updatableElements.map(e => this.todoQueriesProxy.updateQuery(e.query.id, e.query));
    forkJoin(requests).subscribe(() => {
      // queries exist, get their updated remaining counts
      this.updateQueryCounts();

      // and route to default query
      this.routeToDefaultQuery();
    }, ex => {
      if (ex.status == 404) {
        // queries do not exist, create them
        this.createQueries(0);
      }
    });
  }

  private updateQueryCounts() {
    this.todoElementsProxy.getAllQueryElements().subscribe(elements => {
      this.queryElements.forEach((e, i) => e.remainingCount = elements[i].remainingCount);
    });
  }

  private routeToDefaultQuery() {
    // route to first query only if we are at Home
    if (this.router.url == "/") {
      this.router.navigate([`results/${this.queryElements[0].query.id}`]);
    }
  }

  private onItemEdited(args: ItemEditedEventArgs) {
    if (args.newItem.todoListId == this.myTasksElement.id) {
      if (args.oldItem.done && !args.newItem.done) {
        this.myTasksElement.remainingCount++;
      } else if (!args.oldItem.done && args.newItem.done) {
        this.myTasksElement.remainingCount--;
      }
    }

    this.queryElements.forEach(element => this.checkQueryCountsEdit(element, args));
  }

  private checkQueryCountsEdit(element: TodoQueryElement, args: ItemEditedEventArgs) {
    const wasInResults = this.todoQueryService.inResults(element.query, args.oldItem);
    const isInResults = this.todoQueryService.inResults(element.query, args.newItem);

    if (wasInResults && isInResults) {
      if (args.oldItem.done && !args.newItem.done) {
        element.remainingCount++;
      } else if (!args.oldItem.done && args.newItem.done) {
        element.remainingCount--;
      }
    } else if (!wasInResults && isInResults) {
      if (!args.newItem.done) {
        element.remainingCount++;
      }
    } else if (wasInResults && !isInResults) {
      if (!args.oldItem.done) {
        element.remainingCount--;
      }
    }
  }

  private onQueryExecuted(results: TodoQueryResults) {
    const element = this.queryElements.find(e => e.id == results.todoQueryId);
    if (element != null) {
      // this query executed, get the latest result count
      element.remainingCount = results.references.filter(r => !r.item.done).length;
    }
  }

  private onListItemsChanged(item: TodoListItem, add: boolean) {
    if (!item.done && item.todoListId == this.myTasksElement.id) {
      // we only track remaining tasks (not done)
      if (add) {
        this.myTasksElement.remainingCount++;
      } else {
        this.myTasksElement.remainingCount--;
      }
    }

    this.queryElements.forEach(e => this.checkQueryCounts(e, item, add));
  }

  private checkQueryCounts(element: TodoQueryElement, item: TodoListItem, add: boolean) {
    if (!item.done) {
      // we only track remaining tasks (not done)
      const inResults = this.todoQueryService.inResults(element.query, item);
      if (inResults && add) {
        element.remainingCount++;
      } else if (inResults && !add) {
        element.remainingCount--;
      }
    }
  }
}
