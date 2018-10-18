import { Component, OnInit } from '@angular/core';
import { TodoQuery, TodoQueriesProxy, TodoElement, TodoElementsProxy, SwaggerException, QueryOperand, QueryOperator } from '../proxies/todo-api-proxies';
import { Router } from "@angular/router";

@Component({
  selector: 'app-todo-queries',
  templateUrl: './todo-queries.component.html',
  styleUrls: ['./todo-queries.component.css']
})
export class TodoQueriesComponent implements OnInit {
  private readonly myDayQueryId: number = 1;
  myDayElement: TodoElement;

  constructor(
    private todoElementsProxy: TodoElementsProxy,
    private todoQueriesProxy: TodoQueriesProxy,
    private router: Router,
  ) { }

  ngOnInit() {
    // attempt to update query to today's date
    const myDayQuery = this.createMyDayQuery();
    this.todoQueriesProxy.updateQuery(myDayQuery.id, myDayQuery).subscribe(
      query => this.initializeMyDayElement(query),
      ex => this.onUpdateMyDayQueryError(ex)
      );
  }

  private initializeMyDayElement(query: TodoQuery) {
    // create element
    this.myDayElement = this.createMyDayElement(query);

    // and route to it
    this.router.navigate([`results/${query.id}`]);
  }

  private createMyDayQuery(): TodoQuery {
    const query = new TodoQuery();
    query.id = this.myDayQueryId;
    query.name = "My Day";
    query.operand = QueryOperand.DueDate;
    query.operator = QueryOperator.Equals;
    query.dateValue = new Date();
    return query;
  }

  private createMyDayElement(query: TodoQuery): TodoElement {
    // use child count of zero, updated once query is executed via route
    return new TodoElement({ id: query.id, name: query.name, position: query.position, childCount: 0 });
  }

  private onUpdateMyDayQueryError(ex: SwaggerException) {
    if (ex.status == 404) {
      // query item does not exist, create one now
      this.todoQueriesProxy.createQuery(this.createMyDayQuery()).subscribe(
        query => this.initializeMyDayElement(query)
      );
    }
  }

  onSelected(index: number) {
    
  }
}
