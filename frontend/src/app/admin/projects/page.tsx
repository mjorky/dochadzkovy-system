"use client"

import { AdminGuard } from "@/components/admin-guard"
import { useState, useMemo, useDeferredValue } from "react"
import { useQuery } from "@apollo/client/react"
import { Loader2, XCircle, FolderKanban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { GET_PROJECTS, GET_COUNTRIES, type Project, type Country, type Employee } from "@/graphql/queries/projects"
import { GET_MANAGERS } from "@/graphql/queries/employees"
import { ProjectsTable } from "@/components/projects-table"
import { ProjectDialog } from "@/components/project-dialog"
import { Icons } from "@/lib/icons"
import { FilterControls } from '@/components/ui/filter-controls'
import { SearchInput } from '@/components/ui/search-input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ProjectFilterState {
  searchText: string;
  activeFilter: 'all' | 'active' | 'inactive';
}

interface ProjectsQueryData {
  projects: Project[];
}
interface CountriesQueryData {
  countries: Country[];
}
interface ManagersQueryData {
  managers: Employee[];
}

const PlusIcon = Icons.plus;

export default function ProjectsPage() {
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  
  const [filters, setFilters] = useState<ProjectFilterState>({
    searchText: '',
    activeFilter: 'all',
  });

  const deferredSearchText = useDeferredValue(filters.searchText);
  
  const { data: projectsData, loading: isLoadingProjects, error, refetch } = useQuery<ProjectsQueryData>(GET_PROJECTS);
  const { data: countriesData, loading: isLoadingCountries } = useQuery<CountriesQueryData>(GET_COUNTRIES);
  const { data: managersData, loading: isLoadingManagers } = useQuery<ManagersQueryData>(GET_MANAGERS);

  const allProjects = projectsData?.projects || [];
  const countries = countriesData?.countries || [];
  const managers = managersData?.managers || [];

  const filteredProjects = useMemo(() => {
    return allProjects.filter((project: Project) => {
      if (deferredSearchText) {
        const searchLower = deferredSearchText.toLowerCase();
        const nameMatch = project.name.toLowerCase().includes(searchLower);
        const numberMatch = project.number.toLowerCase().includes(searchLower);
        if (!nameMatch && !numberMatch) return false;
      }
      if (filters.activeFilter === 'active' && !project.active) return false;
      if (filters.activeFilter === 'inactive' && project.active) return false;
      return true;
    });
  }, [allProjects, deferredSearchText, filters.activeFilter]);

  const handleEditOpen = (project: Project) => { setSelectedProject(project); setDialogMode("edit"); };
  const handleSuccess = () => { setDialogMode(null); };

  if (isLoadingProjects || isLoadingCountries || isLoadingManagers) { 
    return (
      <AdminGuard>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminGuard>
    )
  }
  
  if (error) {
    return (
      <AdminGuard>
        <div className="flex items-center justify-center min-h-screen">
          <p>Error loading projects</p>
        </div>
      </AdminGuard>
    )
  }

  const totalProjects = allProjects.length;
  const activeVariable = filters.activeFilter === 'all' ? undefined : filters.activeFilter === 'active';

  return (
    <AdminGuard>
    <div className="p-8 space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink href="/admin">Admin</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Projects</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage all company projects and assign managers.</p>
        </div>
        <Button onClick={() => { setSelectedProject(null); setDialogMode("create"); }} className="gap-2">
          <PlusIcon />
          Add Project
        </Button>
      </div>

      <FilterControls>
        <SearchInput
          label="Search Projects"
          placeholder="Search by name or number..."
          value={filters.searchText}
          onChange={(value) => setFilters(prev => ({ ...prev, searchText: value }))}
        />
        <div className="min-w-[180px]">
          <Label htmlFor="statusFilter" className="block text-sm font-medium text-foreground mb-1">
            Status
          </Label>
          <Select
            value={filters.activeFilter}
            onValueChange={(value) => setFilters(prev => ({ ...prev, activeFilter: value as ProjectFilterState['activeFilter'] }))}
          >
            <SelectTrigger id="statusFilter" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </FilterControls>
      
      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <FolderKanban className="h-16 w-16 text-muted-foreground" />
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">No projects match your criteria</h2>
            <p className="text-sm text-muted-foreground">Try adjusting your filters or add a new project.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="text-sm text-muted-foreground">
            Showing {filteredProjects.length} of {totalProjects} projects
          </div>
          <ProjectsTable projects={filteredProjects} onEdit={handleEditOpen} />
        </>
      )}

      <ProjectDialog
        open={dialogMode === "create" || dialogMode === "edit"}
        onOpenChange={(open) => !open && setDialogMode(null)}
        mode={dialogMode || 'create'}
        initialData={selectedProject}
        onSuccess={handleSuccess}
        countries={countries}
        employees={managers}
        isLoadingData={isLoadingCountries || isLoadingManagers}
        currentFilters={{ active: activeVariable, search: filters.searchText }}
      />
    </div>
    </AdminGuard>
  )
}
