import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { FormGroup, FormBuilder } from '@angular/forms'
import { DueDateOption, DueDateService } from '../services/due-date.service'

export interface DueDateOptions {
  value: DueDateOption;
  viewValue: string;
}

export class TodoItemDialogDataValues {
  constructor(public task: string, public dueDate: Date) { }
}

export class TodoItemDialogData {
  constructor(public add: boolean, public values: TodoItemDialogDataValues = null) { }
}

@Component({
  selector: 'app-todo-item-dialog',
  templateUrl: './todo-item-dialog.component.html',
  styleUrls: ['./todo-item-dialog.component.css']
})
export class TodoItemDialogComponent {
  form1: FormGroup;
  task: string;
  title: string;
  dueDateOptions: DueDateOptions[];
  selectedDueOption: DueDateOption;
  dueDate: Date;

  constructor(
    private dueDateService: DueDateService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TodoItemDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: TodoItemDialogData) {
    if (data.add) {
      this.title = "New Todo";
      if (data.values == null) {
        this.selectedDueOption = DueDateOption.None;
        this.dueDate = new Date();
      } else {
        this.initializeDialog(data.values);
      }
    } else {
      this.title = "Edit Todo";
      this.initializeDialog(data.values);
    }

    this.form1 = fb.group({
      task: [this.task, []],
      due: [this.selectedDueOption, []],
      dueDate: [this.dueDate, []]
    });

    this.dueDateOptions = [
      { value: DueDateOption.None, viewValue: this.dueDateService.toString(DueDateOption.None) },
      { value: DueDateOption.Today, viewValue: this.dueDateService.toString(DueDateOption.Today) },
      { value: DueDateOption.Tomorrow, viewValue: this.dueDateService.toString(DueDateOption.Tomorrow) },
      { value: DueDateOption.NextWeek, viewValue: this.dueDateService.toString(DueDateOption.NextWeek) },
      { value: DueDateOption.Custom, viewValue: this.dueDateService.toString(DueDateOption.Custom) }
    ];
  }

  private initializeDialog(values: TodoItemDialogDataValues) {
    this.selectedDueOption = this.dueDateService.dateToEnum(values.dueDate);
    this.task = values.task;
    this.dueDate = values.dueDate;
  }

  save() {
    const date = this.dueDateService.enumToDate(this.form1.value.due, this.form1.value.dueDate);
    this.dialogRef.close(new TodoItemDialogDataValues(this.form1.value.task, date));
  }

  cancel() {
    this.dialogRef.close();
  }
}
