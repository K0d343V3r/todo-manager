import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RoutingModule } from './modules/routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from "./modules/material.module";
import { TodoListsComponent } from './todo-lists/todo-lists.component';
import { HttpClientModule } from '@angular/common/http';
import { TodoListInfosProxy, TodoItemsProxy, TodoListsProxy } from './proxies/todo-api-proxies';
import { TodoListDialogComponent } from './todo-list-dialog/todo-list-dialog.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { TodoItemsComponent } from './todo-items/todo-items.component';
import { TodoItemDialogComponent } from './todo-item-dialog/todo-item-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    TodoListsComponent,
    TodoListDialogComponent,
    TodoItemsComponent,
    TodoItemDialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    RoutingModule,
    MaterialModule
  ],
  providers: [TodoListInfosProxy, TodoListsProxy, TodoItemsProxy],
  bootstrap: [AppComponent],
  entryComponents: [TodoListDialogComponent, TodoItemDialogComponent]
})
export class AppModule { }
