import { gql } from "@apollo/client" // alebo z inej knižnice, ktorú používate

// ============================================================================
// REALNE TypeScript TYPY (zodpovedajúce API)
// ============================================================================

export interface Country {
  countryCode: string
  name: string | null
}

export interface Employee {
  id: string
  fullName: string
}

export interface Project {
  id: string
  number: string
  name: string
  description: string
  active: boolean
  manager: Employee
  country: Country
}

// Typ pre zjednodušené projekty v dropdownoch
export interface ProjectCatalogItem {
  id: string
  number: string
  name: string
}

// ============================================================================
// REÁLNE GRAPHQL QUERY A MUTÁCIE
// ============================================================================

/**
 * Získa zoznam projektov pre administrátorskú tabuľku.
 * Podporuje filtrovanie a vyhľadávanie.
 */
export const GET_PROJECTS = gql`
  query GetProjects($active: Boolean, $search: String) {
    projects(active: $active, search: $search) {
      id
      number
      name
      description
      active
      manager {
        id
        fullName
      }
      country {
        countryCode
        name
      }
    }
  }
`

/**
 * Získa iba aktívne projekty (pre dropdown menu v zadávaní dochádzky).
 * Volá query `getActiveProjects` z work-records modulu.
 */
export const GET_ACTIVE_PROJECTS_CATALOG = gql`
  query GetActiveProjectsCatalog {
    getActiveProjects {
      id
      number
      name
    }
  }
`

/**
 * Získa všetkých zamestnancov pre dropdown "Manager".
 */
export const GET_EMPLOYEES_FOR_DROPDOWN = gql`
  query GetEmployeesForDropdown {
    employees {
      id
      fullName
    }
  }
`

/**
 * Získa všetky krajiny pre dropdown "Country".
 * POZNÁMKA: Túto query možno budete musieť doprogramovať na backende.
 */
export const GET_COUNTRIES = gql`
  query GetCountries {
    countries {
      countryCode
      name
    }
  }
`

/**
 * Vytvorí nový projekt.
 */
export const CREATE_PROJECT = gql`
  mutation CreateProject($createProjectInput: CreateProjectInput!) {
    createProject(createProjectInput: $createProjectInput) {
      id
      number
      name
      description
      active
      manager {
        id
        fullName
      }
    }
  }
`

/**
 * Upraví existujúci projekt.
 */
export const UPDATE_PROJECT = gql`
  mutation UpdateProject($updateProjectInput: UpdateProjectInput!) {
    updateProject(updateProjectInput: $updateProjectInput) {
      id
      number
      name
      description
      active
    }
  }
`

/**
 * Prepne aktívny stav projektu.
 */
export const TOGGLE_PROJECT_ACTIVE = gql`
  mutation ToggleProjectActive($id: ID!, $active: Boolean!) {
    toggleProjectActive(id: $id, active: $active) {
      id
      active
    }
  }
`