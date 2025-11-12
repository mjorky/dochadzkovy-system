'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { type Project } from "@/graphql/queries/projects"
import { Icons } from "@/lib/icons"

type SortColumn = 'number' | 'name' | 'country' | 'manager' | 'active'
type SortDirection = 'asc' | 'desc'

export interface ProjectsTableProps {
  projects: Project[]
  isLoading?: boolean
  onEdit?: (project: Project) => void
  onDelete?: (project: Project) => void
}

const getSortValue = (project: Project, column: SortColumn): any => {
    switch (column) {
        case 'country':
            return project.country?.name || project.country?.countryCode || ''
        case 'manager':
            return project.manager.fullName || ''
        case 'active':
            return project.active
        default:
            return project[column as keyof Project]
    }
}

const EditIcon = Icons.edit;
const TrashIcon = Icons.trash;
const LoaderIcon = Icons.loader;

export function ProjectsTable({ projects, isLoading = false, onEdit, onDelete }: ProjectsTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('number')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const sortedProjects = [...projects].sort((a, b) => {
    const aValue = getSortValue(a, sortColumn)
    const bValue = getSortValue(b, sortColumn)

    if (aValue == null && bValue == null) return 0
    if (aValue == null) return sortDirection === 'asc' ? 1 : -1
    if (bValue == null) return sortDirection === 'asc' ? -1 : 1

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
    }

    if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
      return sortDirection === 'asc'
        ? Number(bValue) - Number(aValue)
        : Number(aValue) - Number(bValue)
    }

    const aStr = String(aValue).toLowerCase()
    const bStr = String(bValue).toLowerCase()
    return sortDirection === 'asc'
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr)
  })
  
  const SortIndicator = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return null
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4 text-primary" />
    ) : (
      <ChevronDown className="h-4 w-4 text-primary" />
    )
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-8"><LoaderIcon className="h-8 w-8" /></div>
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-muted/50">
            <TableHead 
                className="w-[100px] cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => handleSort('number')}
            >
                <div className="flex items-center gap-2">
                    Number
                    <SortIndicator column="number" />
                </div>
            </TableHead>
            <TableHead 
                className="min-w-[150px] cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => handleSort('name')}
            >
                <div className="flex items-center gap-2">
                    Name
                    <SortIndicator column="name" />
                </div>
            </TableHead>
            <TableHead 
                className="w-[120px] cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => handleSort('country')}
            >
                <div className="flex items-center gap-2">
                    Country
                    <SortIndicator column="country" />
                </div>
            </TableHead>
            <TableHead 
                className="w-[150px] cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => handleSort('manager')}
            >
                <div className="flex items-center gap-2">
                    Manager
                    <SortIndicator column="manager" />
                </div>
            </TableHead>
            <TableHead 
                className="w-[100px] text-center cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => handleSort('active')}
            >
                <div className="flex items-center justify-center gap-2">
                    Active
                    <SortIndicator column="active" />
                </div>
            </TableHead>
            <TableHead className="w-[80px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedProjects.map((project) => (
            <TableRow key={project.id}>
              <TableCell className="w-[100px] font-mono text-sm">{project.number}</TableCell>
              <TableCell className="min-w-[150px] font-medium">{project.name}</TableCell>
              <TableCell className="w-[120px]">{project.country?.name || project.country.countryCode}</TableCell>
              <TableCell className="w-[150px]">{project.manager.fullName}</TableCell>
              
              <TableCell className="w-[100px] text-center">
                {project.active ? (
                  <Badge variant="default" className="bg-green-100 text-green-700 border-green-600/20 dark:bg-green-900/40 dark:text-green-300">
                      Active
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                      Inactive
                  </Badge>
                )}
              </TableCell>

              <TableCell className="w-[80px]">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onEdit?.(project)} className="h-8 w-8 p-0">
                    <EditIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete?.(project)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {projects.length === 0 && !isLoading && (
          <div className="text-center py-8 text-muted-foreground">No projects found</div>
      )}
    </div>
  )
}