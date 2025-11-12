export type Project = {
  id: number
  number: string
  name: string
  description: string
  allowAssignWorkingHours: boolean
  countryCode: string
  manager: string
  managerId: number
}

export type ProjectsFilterState = {
  searchText: string
  showOnlyActive: boolean
}
