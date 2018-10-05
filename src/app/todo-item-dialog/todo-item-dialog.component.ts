import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { FormGroup, FormBuilder } from '@angular/forms'

@Component({
  selector: 'app-todo-item-dialog',
  templateUrl: './todo-item-dialog.component.html',
  styleUrls: ['./todo-item-dialog.component.css']
})
export class TodoItemDialogComponent implements OnInit {
  form1: FormGroup;
  task: string;
  title: string;

  constructor(private fb: FormBuilder,
    private dialogRef: MatDialogRef<TodoItemDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
    this.task = data.task;
    this.title = data.task != null ? "Edit Todo" : "New Todo";
    this.form1 = fb.group({
      task: [this.task, []]
    });
  }

  ngOnInit() {
  }

  save() {
    this.dialogRef.close(this.form1.value);
  }

  cancel() {
    this.dialogRef.close();
  }
}
