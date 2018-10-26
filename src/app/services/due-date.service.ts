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

  get defaultDate(): Date {
    return this._defaultDate;
  }

  getToday(): Date {
    return this.toEndOfDay(new Date());
  }

  isToday(date: Date): boolean {
    return this.toEndOfDay(date).getTime() === this.getToday().getTime();
  }

  isBeforeToday(date: Date): boolean {
    if (date === this.defaultDate) {
      return false;
    }

    return this.toEndOfDay(date).getTime() < this.getToday().getTime();
  }

  isAfterToday(date: Date): boolean {
    if (date === this.defaultDate) {
      return false;
    }

    return this.toEndOfDay(date).getTime() > this.getToday().getTime();
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return this.toEndOfDay(date1).getTime() === this.toEndOfDay(date2).getTime();
  }

  isEarlierDay(earlier: Date, later: Date): boolean {
    if (earlier === this.defaultDate || later === this.defaultDate) {
      return false;
    }

    return this.toEndOfDay(earlier).getTime() < this.toEndOfDay(later).getTime();
  }

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
        return this.getToday();

      case DueDateOption.Tomorrow:
        const tomorrow = this.getToday();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow;

      case DueDateOption.NextWeek:
        // end of next week (next Sunday)
        const nextWeek = this.getToday();
        nextWeek.setDate(nextWeek.getDate() + (7 - nextWeek.getDay()) + 7);
        return nextWeek;

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
        return customDate == null ? "On this day" : customDate.toDateString();
    }
  }
}
