import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RoutingModule } from './modules/routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from "./modules/material.module";
import { TodoListsComponent } from './todo-lists/todo-lists.component';
import { HttpClientModule } from '@angular/common/http';
import { TodoQueriesProxy, TodoElementsProxy, TodoItemsProxy, TodoListsProxy } from './proxies/todo-api-proxies';
import { TodoListDialogComponent } from './todo-list-dialog/todo-list-dialog.component';
import {  ReactiveFormsModule } from "@angular/forms";
import { TodoItemsComponent } from './todo-items/todo-items.component';
import { TodoItemDialogComponent } from './todo-item-dialog/todo-item-dialog.component';
import { TodoItemTableComponent } from './todo-item-table/todo-item-table.component';
import { TodoQueriesComponent } from './todo-queries/todo-queries.component';
import { TodoResultsComponent } from './todo-results/todo-results.component';

@NgModule({
  declarations: [
    AppComponent,
    TodoListsComponent,
    TodoListDialogComponent,
    TodoItemsComponent,
    TodoItemDialogComponent,
    TodoItemTableComponent,
    TodoQueriesComponent,
    TodoResultsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    RoutingModule,
    MaterialModule
  ],
  bootstrap: [AppComponent],
  entryComponents: [TodoListDialogComponent, TodoItemDialogComponent]
})
export class AppModule { }
