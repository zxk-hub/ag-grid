import { GridApi, createGrid, GridOptions, AdvancedFilterModel, FirstDataRenderedEvent } from '@ag-grid-community/core';

const initialAdvancedFilterModel: AdvancedFilterModel = {
  filterType: 'join',
    type: 'AND',
    conditions: [
      {
        filterType: 'join',
        type: 'OR',
        conditions: [
          {
            filterType: 'number',
            colId: 'age',
            type: 'greaterThan',
            filter: 23,
          },
          {
            filterType: 'text',
            colId: 'sport',
            type: 'endsWith',
            filter: 'ing',
          }
        ]
      },
      {
        filterType: 'text',
        colId: 'country',
        type: 'contains',
        filter: 'united',
      }
    ]
};

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
  columnDefs: [
    { field: 'athlete' },
    { field: 'country' },
    { field: 'sport' },
    { field: 'age', minWidth: 100 },
    { field: 'gold', minWidth: 100 },
    { field: 'silver', minWidth: 100 },
    { field: 'bronze', minWidth: 100 },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 180,
    filter: true,
    sortable: true,
    resizable: true,
  },
  enableAdvancedFilter: true,
  initialState: {
    filter: {
      advancedFilterModel: initialAdvancedFilterModel,
    },
  },
  onFirstDataRendered: (params: FirstDataRenderedEvent) => {
    params.api.showAdvancedFilterBuilder();
  }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);

  fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
    .then(response => response.json())
    .then((data: IOlympicData[]) => gridApi!.updateGridOption('rowData', data))
})
