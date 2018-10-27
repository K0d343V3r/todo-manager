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

  getToday(dateOnly: boolean = false): Date {
    return dateOnly ? this.toDateOnly(new Date()) : new Date();
  }

  isDefaultDate(date: Date): boolean {
    return this._defaultDate.getTime() === date.getTime();
  }

  isToday(date: Date): boolean {
    return this.toDateOnly(date).getTime() === this.getToday(true).getTime();
  }

  isBeforeToday(date: Date): boolean {
    if (this.isDefaultDate(date)) {
      return false;
    }

    return this.toDateOnly(date).getTime() < this.getToday(true).getTime();
  }

  isAfterToday(date: Date): boolean {
    if (this.isDefaultDate(date)) {
      return false;
    }

    return this.toDateOnly(date).getTime() > this.getToday(true).getTime();
  }

  getFromToday(offset: number): Date {
    const today = this.getToday();
    today.setDate(today.getDate() + offset);
    return today;
  }

  getFromDay(date: Date, offset: number): Date {
    const date2 = new Date(date);
    date2.setDate(date2.getDate() + offset);
    return date2;
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return this.toDateOnly(date1).getTime() === this.toDateOnly(date2).getTime();
  }

  isEarlierDay(date: Date, later: Date): boolean {
    if (this.isDefaultDate(date) || this.isDefaultDate(later)) {
      return false;
    }

    return this.toDateOnly(date).getTime() < this.toDateOnly(later).getTime();
  }

  isLaterDay(date: Date, earlier: Date): boolean {
    if (this.isDefaultDate(date) || this.isDefaultDate(earlier)) {
      return false;
    }

    return this.toDateOnly(date).getTime() > this.toDateOnly(earlier).getTime();
  }

  enumToDate(option: DueDateOption, customDate: Date): Date {
    if (option == DueDateOption.Custom) {
      return customDate;
    } else {
      return this.toDate(option);
    }
  }

  dateToEnum(date: Date): DueDateOption {
    if (this.isDefaultDate(date)) {
      return DueDateOption.None;
    } else if (this.isSameDay(date, this.toDate(DueDateOption.Today))) {
      return DueDateOption.Today;
    } else if (this.isSameDay(date, this.toDate(DueDateOption.Tomorrow))) {
      return DueDateOption.Tomorrow;
    } else if (this.isSameDay(date, this.toDate(DueDateOption.NextWeek))) {
      return DueDateOption.NextWeek;
    } else {
      return DueDateOption.Custom;
    }
  }

  private toDate(option: DueDateOption) {
    switch (option) {
      case DueDateOption.None:
        return this._defaultDate;

      case DueDateOption.Today:
        return this.getToday();

      case DueDateOption.Tomorrow:
        return this.getFromToday(1);

      case DueDateOption.NextWeek:
        // end of next week (next Sunday)
        const nextWeek = this.getToday();
        nextWeek.setDate(nextWeek.getDate() + (7 - nextWeek.getDay()) + 7);
        return nextWeek;

      default:
        throw "Invalid option.";
    }
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

  private toDateOnly(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  }
}
