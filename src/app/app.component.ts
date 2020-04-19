import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

import GetSheet from 'get-sheet-done';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  public wins: { [key: string]: number } = {};
  public winPercents: { [key: string]: string } = {};

  public isLoading = true;
  public dataSource = new MatTableDataSource();

  private ssKey = '1yf1kZLdlWCSBdiROvzjIZt2Zay9ec7BzyIbdybI5NE4';
  private ssSheetId = 3;

  public headers = ['Birds', 'Cats', 'Mice', 'Lizards', 'Otters', 'Moles', 'Crows', 'Vagabond1', 'Vagabond2'];
  public expandedHeaders = this.headers.concat(['Vagabond1 Type', 'Vagabond2 Type', 'Experience', 'Rounds', 'Winner', 'Map', 'Winner First', 'Winner Last', 'Keep Clearing', '# Players', 'Deck'])
  public dataSet: any[] = [];
  public currentDataSet: any[] = [];

  public filters: Array<{ name: string, filter: (x) => boolean, color: string, isActive?: boolean }> = [
    { name: 'Has Birds', filter: x => x['Birds'], color: 'accent' },
    { name: 'No Birds', filter: x => !x['Birds'], color: 'warn' },
    { name: 'Has Cats', filter: x => x['Cats'], color: 'accent' },
    { name: 'No Cats', filter: x => !x['Cats'], color: 'warn' },
    { name: 'Has Mice', filter: x => x['Mice'], color: 'accent' },
    { name: 'No Mice', filter: x => !x['Mice'], color: 'warn' },
    { name: 'Has Lizards', filter: x => x['Lizards'], color: 'accent' },
    { name: 'No Lizards', filter: x => !x['Lizards'], color: 'warn' },
    { name: 'Has Otters', filter: x => x['Otters'], color: 'accent' },
    { name: 'No Otters', filter: x => !x['Otters'], color: 'warn' },
    { name: 'Has Moles', filter: x => x['Moles'], color: 'accent' },
    { name: 'No Moles', filter: x => !x['Moles'], color: 'warn' },
    { name: 'Has Crows', filter: x => x['Crows'], color: 'accent' },
    { name: 'No Crows', filter: x => !x['Crows'], color: 'warn' },
    { name: 'Has 1 Vagabond', filter: x => x['Vagabond1'], color: 'accent' },
    { name: 'Has 2 Vagabonds', filter: x => x['Vagabond2'], color: 'accent' },
    { name: 'No Vagabond', filter: x => !x['Vagabond1'], color: 'warn' },
    { name: 'Dominance (Lost)', filter: x => Object.values(x).find(x => x === 'Dom'), color: 'primary' },
    { name: 'Dominance (Won)', filter: x => Object.values(x).find(x => x === 'WDom'), color: 'primary' },
    { name: 'Base Deck', filter: x => x['Deck'] === 'Base', color: 'primary' },
    { name: 'Exiles & Partisans Deck', filter: x => x['Deck'] === 'E&P', color: 'primary' },
    { name: '2 Players', filter: x => this.headers.reduce((prev, cur) => prev + (x[cur] ? 1 : 0), 0) === 2, color: 'primary' },
    { name: '3 Players', filter: x => this.headers.reduce((prev, cur) => prev + (x[cur] ? 1 : 0), 0) === 3, color: 'primary' },
    { name: '4 Players', filter: x => this.headers.reduce((prev, cur) => prev + (x[cur] ? 1 : 0), 0) === 4, color: 'primary' },
    { name: '5 Players', filter: x => this.headers.reduce((prev, cur) => prev + (x[cur] ? 1 : 0), 0) === 5, color: 'primary' },
    { name: '6 Players', filter: x => this.headers.reduce((prev, cur) => prev + (x[cur] ? 1 : 0), 0) === 6, color: 'primary' }
  ];

  public currentFilter = null;
  public activeFilters = [];

  async ngAfterViewInit() {

    const { data } = await GetSheet.raw(this.ssKey, this.ssSheetId);
    this.isLoading = false;

    this.dataSet = data
      .slice(11)
      .filter(arr => arr.filter(x => x && x.trim()).length > 0)
      .map(arr => arr.reduce((prev, cur, idx) => ({ [this.expandedHeaders[idx]]: cur, ...prev }), {}));

    this.refreshData(0);
    this.recalculateWinPercent();

    setTimeout(() => {
      this.dataSource.sort = this.sort;
    }, 0);
  }

  public changePage($event) {
    this.refreshData($event.pageIndex);
  }

  public refreshData(page: number) {

    let dataSet = this.dataSet;
    this.filters.forEach(filter => {
      if(!filter.isActive) return;

      dataSet = dataSet.filter(x => filter.filter(x));
    });
    
    this.currentDataSet = dataSet;

    this.dataSource.data = dataSet.slice(page * 25, (page + 1) * 25);
  }

  public addFilter($event) {
    if(!$event.value) return;

    $event.value.isActive = true;
    this.refreshData(0);
    this.recalculateWinPercent();
  }
  
  public removeFilter(filter) {
    filter.isActive = false;
    this.refreshData(0);
    this.recalculateWinPercent();
  }

  public recalculateWinPercent() {
    this.wins = {};
    this.winPercents = {};

    this.headers.forEach(faction => {
      this.wins[faction] = 0;
      this.winPercents[faction] = '0.00';
    });

    this.currentDataSet.forEach(item => {

      this.headers.forEach(faction => {
        if(!item[faction] || item[faction] === 'Dom' || (item[faction] !== 'WDom' && +item[faction] < 30)) return;

        this.wins[faction] = this.wins[faction] || 0;
        this.wins[faction]++;
      });
    });

    this.headers.forEach(faction => {
      this.winPercents[faction] = (this.wins[faction] / this.currentDataSet.length * 100).toFixed(2);
    });
  }
}
