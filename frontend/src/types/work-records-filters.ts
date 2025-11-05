// Filter state interface for work records
export interface WorkRecordsFilterState {
  // Date range filters
  fromDate: Date | null;
  toDate: Date | null;
  showWholeMonth: boolean;

  // Text search
  searchText: string;

  // Multi-select filters (store IDs)
  selectedProjects: string[];
  selectedAbsenceTypes: string[];
  selectedProductivityTypes: string[];
  selectedWorkTypes: string[];

  // Boolean filters
  lockStatus: 'all' | 'locked' | 'unlocked';
  tripFlag: 'all' | 'yes' | 'no';
}
