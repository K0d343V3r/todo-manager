import { Injectable } from '@angular/core';

export enum DueDateOption {
  None,
  Today,
  Tomorrow,
  NextWeek,
  Custom
}

@Injectable({
  providedIn: 'root'
})
export class DueDateService {
  private _defaultDate: Date = new Date('0001-01-01T00:00:00Z');

  constructor() { }

  enumToDate(option: DueDateOption, customDate: Date): Date {
    if (option == DueDateOption.Custom) {
      return this.toEndOfDay(customDate);
    } else {
      return this.toDate(option);
    }
  }

  dateToEnum(date: Date): DueDateOption {
    if (date.getTime() == this._defaultDate.getTime()) {
      return DueDateOption.None;
    } else {
      const endOfDay = this.toEndOfDay(date);
      if (endOfDay.getTime() == this.toDate(DueDateOption.Today).getTime()) {
        return DueDateOption.Today;
      } else if (endOfDay.getTime() == this.toDate(DueDateOption.Tomorrow).getTime()) {
        return DueDateOption.Tomorrow;
      } else if (endOfDay.getTime() == this.toDate(DueDateOption.NextWeek).getTime()) {
        return DueDateOption.NextWeek;
      } else {
        return DueDateOption.Custom;
      }
    }
  }

  private toDate(option: DueDateOption) {
    switch (option) {
      case DueDateOption.None:
        return this._defaultDate;

      case DueDateOption.Today:
        const today = new Date();
        return this.toEndOfDay(today);

      case DueDateOption.Tomorrow:
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return this.toEndOfDay(tomorrow);

      case DueDateOption.NextWeek:
        // end of next week (next Sunday)
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + (7 - nextWeek.getDay()) + 7);
        return this.toEndOfDay(nextWeek);

      default:
        throw "Invalid option.";
    }
  }

  toEndOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 0);
  }

  toString(option: DueDateOption, customDate: Date = null): string {
    switch (option) {
      case DueDateOption.None:
        return "None";

      case DueDateOption.Today:
        return "Today";

      case DueDateOption.Tomorrow:
        return "Tomorrow";

      case DueDateOption.NextWeek:
        return "Next week";

      case DueDateOption.Custom:
        return customDate == null ? "On this date" : customDate.toDateString();
    }
  }
}
