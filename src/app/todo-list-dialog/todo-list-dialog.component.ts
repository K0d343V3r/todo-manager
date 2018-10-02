import { Component, Inject, OnInit } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {FormGroup, FormBuilder} from '@angular/forms'

@Component({
  selector: 'app-todo-list-dialog',
  templateUrl: './todo-list-dialog.component.html',
  styleUrls: ['./todo-list-dialog.component.css']
})
export class TodoListDialogComponent implements OnInit {
  form: FormGroup;
  name: string;
  title: string;

  constructor(private fb: FormBuilder,
    private dialogRef: MatDialogRef<TodoListDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) { 
      this.name = data.name;
      this.title = data.name != null ? "Edit Todo List" : "New Todo List";
      this.form = fb.group({
        name: [this.name, []]
      });
    }

  ngOnInit() {
  }

  save() {
    this.dialogRef.close(this.form.value);
  }

  cancel() {
      this.dialogRef.close();
  } 
}
