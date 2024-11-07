import {ChangeDetectionStrategy, Component, ChangeDetectorRef} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {provideNativeDateAdapter} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatCalendarCellClassFunction} from '@angular/material/datepicker';
import {MatButtonModule} from '@angular/material/button';
import {MatSnackBar} from '@angular/material/snack-bar';

interface User {
  name: string;
  workplace: string;
  employeeNumber: number;
  vacationDays: Set<string>;
}

@Component({
  selector: 'app-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrl: './datepicker.component.scss',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    MatFormFieldModule, 
    MatDatepickerModule, 
    FormsModule, 
    ReactiveFormsModule,
    MatButtonModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerComponent {
  user: User = {
    name: 'Max Mustermann',
    workplace: 'Entwicklungsabteilung',
    employeeNumber: 2398,
    vacationDays: new Set([
      '2024-11-03', '2024-11-14',
      '2024-12-11', '2024-12-12', '2024-12-13', '2024-12-14', '2024-12-15',
      '2024-12-16', '2024-12-17', '2024-12-18', '2024-12-19', '2024-12-20'
    ]),
  };

  readonly campaignOne = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  constructor(
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {}

  dateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {
    if (view === 'month') {
      const dateString = this.formatDate(cellDate);
      return this.user.vacationDays.has(dateString) ? 'user-vacation-day' : '';
    }
    return '';
  };

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getDatesInRange(startDate: Date, endDate: Date): string[] {
    const dates: string[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dates.push(this.formatDate(new Date(currentDate)));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  }

  addVacationDays() {
    const startDate = this.campaignOne.get('start')?.value;
    const endDate = this.campaignOne.get('end')?.value;

    if (startDate && endDate) {
      const datesInRange = this.getDatesInRange(startDate, endDate);
      
      datesInRange.forEach(date => {
        this.user.vacationDays.add(date);
      });

      this.cdr.markForCheck();
      this.snackBar.open(`${datesInRange.length} Urlaubstag(e) wurden hinzugefügt`, 'OK', { duration: 2000 });
      this.campaignOne.reset();
      console.log(this.user);
      
    }
  }

  removeVacationDays() {
    const startDate = this.campaignOne.get('start')?.value;
    const endDate = this.campaignOne.get('end')?.value;

    if (startDate && endDate) {
      const datesInRange = this.getDatesInRange(startDate, endDate);
      let removedCount = 0;

      datesInRange.forEach(date => {
        if (this.user.vacationDays.has(date)) {
          this.user.vacationDays.delete(date);
          removedCount++;
        }
      });

      this.cdr.markForCheck();
      this.snackBar.open(`${removedCount} Urlaubstag(e) wurden entfernt`, 'OK', { duration: 2000 });
      this.campaignOne.reset();
      console.log(this.user);
      
    }
  }

  // Hilfsmethode um zu prüfen ob im ausgewählten Zeitraum Urlaubstage existieren
  hasVacationDaysInRange(): boolean {
    const startDate = this.campaignOne.get('start')?.value;
    const endDate = this.campaignOne.get('end')?.value;

    if (startDate && endDate) {
      const datesInRange = this.getDatesInRange(startDate, endDate);
      return datesInRange.some(date => this.user.vacationDays.has(date));
    }
    return false;
  }
}