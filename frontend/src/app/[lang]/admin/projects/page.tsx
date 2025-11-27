"use client";

import { AdminGuard } from "@/components/admin-guard";
import { useState, useMemo } from "react";
import { useTranslations } from "@/contexts/dictionary-context";
import { useQuery } from "@apollo/client/react";
import { Loader2, Plus, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  GET_PROJECTS,
  GET_COUNTRIES,
  type Project,
  type Country,
  type Employee,
} from "@/graphql/queries/projects";
import { GET_MANAGERS } from "@/graphql/queries/employees";
import {
  ProjectsTable,
  type ProjectFilters,
} from "@/components/projects-table";
import { ProjectDialog } from "@/components/project-dialog";

interface ProjectsQueryData {
  projects: Project[];
}
interface CountriesQueryData {
  countries: Country[];
}
interface ManagersQueryData {
  managers: Employee[];
}

export default function ProjectsPage() {
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // State pre filtre
  const [filters, setFilters] = useState<ProjectFilters>({
    searchText: "",
    selectedCountries: [],
    selectedManagers: [],
    activeStatus: "all",
  });

  const t = useTranslations();

  const {
    data: projectsData,
    loading: isLoadingProjects,
    error,
    refetch,
  } = useQuery<ProjectsQueryData>(GET_PROJECTS);
  const { data: countriesData, loading: isLoadingCountries } =
    useQuery<CountriesQueryData>(GET_COUNTRIES);
  const { data: managersData, loading: isLoadingManagers } =
    useQuery<ManagersQueryData>(GET_MANAGERS);

  const allProjects = projectsData?.projects || [];
  const allCountries = countriesData?.countries || [];
  const allManagers = managersData?.managers || [];

  // --- POMOCNÉ FUNKCIE ---
  const getUniqueCountries = (projects: Project[]) => {
    const uniqueMap = new Map<string, Country>();
    projects.forEach((p) => {
      if (p.country) {
        const key = p.country.id || p.country.countryCode || p.country.name;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, { ...p.country, id: key });
        }
      }
    });
    return Array.from(uniqueMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  };

  const getUniqueManagers = (projects: Project[]) => {
    const uniqueMap = new Map<string, { id: string; fullName: string }>();
    projects.forEach((p) => {
      if (p.manager) {
        const key = p.manager.id || p.manager.fullName;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, { id: key, fullName: p.manager.fullName });
        }
      }
    });
    return Array.from(uniqueMap.values()).sort((a, b) =>
      a.fullName.localeCompare(b.fullName),
    );
  };

  // --- FACETED SEARCH LOGIC ---

  // 1. BASE: Aplikovaný Search Text
  const baseProjects = useMemo(() => {
    return allProjects.filter((project) => {
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        const nameMatch = project.name.toLowerCase().includes(searchLower);
        const numberMatch = project.number.toLowerCase().includes(searchLower);
        if (!nameMatch && !numberMatch) return false;
      }
      return true;
    });
  }, [allProjects, filters.searchText]);

  // 2. KRAJINY: Filtrujeme podľa Manažéra a Statusu
  const availableCountries = useMemo(() => {
    const projects = baseProjects.filter((project) => {
      // Manager Filter
      if (filters.selectedManagers.length > 0) {
        if (!project.manager) return false;
        const idMatch = filters.selectedManagers.includes(project.manager.id);
        const nameMatch = filters.selectedManagers.includes(
          project.manager.fullName,
        );
        if (!idMatch && !nameMatch) return false;
      }
      // Status Filter
      if (filters.activeStatus === "active" && !project.active) return false;
      if (filters.activeStatus === "inactive" && project.active) return false;

      return true;
    });
    return getUniqueCountries(projects);
  }, [baseProjects, filters.selectedManagers, filters.activeStatus]);

  // 3. MANAŽÉRI: Filtrujeme podľa Krajiny a Statusu
  const availableManagers = useMemo(() => {
    const projects = baseProjects.filter((project) => {
      // Country Filter
      if (filters.selectedCountries.length > 0) {
        if (!project.country) return false;
        const idMatch = filters.selectedCountries.includes(project.country.id);
        const codeMatch = filters.selectedCountries.includes(
          project.country.countryCode,
        );
        const nameMatch = filters.selectedCountries.includes(
          project.country.name,
        );
        if (!idMatch && !codeMatch && !nameMatch) return false;
      }
      // Status Filter
      if (filters.activeStatus === "active" && !project.active) return false;
      if (filters.activeStatus === "inactive" && project.active) return false;

      return true;
    });
    return getUniqueManagers(projects);
  }, [baseProjects, filters.selectedCountries, filters.activeStatus]);

  // 4. STATUSY: Filtrujeme podľa Krajiny a Manažéra (ale NIE podľa Statusu, aby sme videli možnosti)
  const availableStatuses = useMemo(() => {
    const projects = baseProjects.filter((project) => {
      // Country Filter
      if (filters.selectedCountries.length > 0) {
        if (!project.country) return false;
        const idMatch = filters.selectedCountries.includes(project.country.id);
        const codeMatch = filters.selectedCountries.includes(
          project.country.countryCode,
        );
        const nameMatch = filters.selectedCountries.includes(
          project.country.name,
        );
        if (!idMatch && !codeMatch && !nameMatch) return false;
      }
      // Manager Filter
      if (filters.selectedManagers.length > 0) {
        if (!project.manager) return false;
        const idMatch = filters.selectedManagers.includes(project.manager.id);
        const nameMatch = filters.selectedManagers.includes(
          project.manager.fullName,
        );
        if (!idMatch && !nameMatch) return false;
      }
      return true;
    });

    return {
      hasActive: projects.some((p) => p.active),
      hasInactive: projects.some((p) => !p.active),
    };
  }, [baseProjects, filters.selectedCountries, filters.selectedManagers]);

  // 5. FINAL: Všetko dokopy
  const filteredProjects = useMemo(() => {
    return baseProjects.filter((project) => {
      // Country
      if (filters.selectedCountries.length > 0) {
        if (!project.country) return false;
        const idMatch = filters.selectedCountries.includes(project.country.id);
        const codeMatch = filters.selectedCountries.includes(
          project.country.countryCode,
        );
        const nameMatch = filters.selectedCountries.includes(
          project.country.name,
        );
        if (!idMatch && !codeMatch && !nameMatch) return false;
      }
      // Manager
      if (filters.selectedManagers.length > 0) {
        if (!project.manager) return false;
        const idMatch = filters.selectedManagers.includes(project.manager.id);
        const nameMatch = filters.selectedManagers.includes(
          project.manager.fullName,
        );
        if (!idMatch && !nameMatch) return false;
      }
      // Status
      if (filters.activeStatus === "active" && !project.active) return false;
      if (filters.activeStatus === "inactive" && project.active) return false;

      return true;
    });
  }, [
    baseProjects,
    filters.selectedCountries,
    filters.selectedManagers,
    filters.activeStatus,
  ]);

  const handleEditOpen = (project: Project) => {
    setSelectedProject(project);
    setDialogMode("edit");
  };
  const handleSuccess = () => {
    setDialogMode(null);
    refetch();
  };

  if (isLoadingProjects || isLoadingCountries || isLoadingManagers) {
    return (
      <AdminGuard>
        <div className="flex items-center justify-center min-h-screen bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminGuard>
    );
  }

  if (error) {
    return (
      <AdminGuard>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-destructive">{t.projects.failedToLoad}</p>
        </div>
      </AdminGuard>
    );
  }

  const totalProjects = allProjects.length;

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button
            onClick={() => {
              setSelectedProject(null);
              setDialogMode("create");
            }}
            className="gap-2 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            {t.projects.addProject}
          </Button>
        </div>

        {allProjects.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center border-2 border-dashed border-muted rounded-xl bg-muted/5">
            <FolderKanban className="h-12 w-12 text-muted-foreground/50" />
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                {t.projects.noProjectsFound}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t.projects.noProjectsDescription}
              </p>
            </div>
            <Button onClick={() => setDialogMode("create")} variant="outline">
              {t.projects.createProject}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-end items-center mb-2">
              <span className="text-xs font-medium text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
                {t.workRecords.showing} {filteredProjects.length} {t.workRecords.of} {totalProjects} {t.projects.countSuffix}
              </span>
            </div>

            <ProjectsTable
              projects={filteredProjects}
              countries={availableCountries}
              managers={availableManagers}
              availableStatuses={availableStatuses} // NOVÉ
              filters={filters}
              onFilterChange={setFilters}
              onEdit={handleEditOpen}
            />
          </>
        )}

        <ProjectDialog
          open={dialogMode === "create" || dialogMode === "edit"}
          onOpenChange={(open) => !open && setDialogMode(null)}
          mode={dialogMode || "create"}
          initialData={selectedProject}
          onSuccess={handleSuccess}
          countries={allCountries}
          employees={allManagers}
          isLoadingData={isLoadingCountries || isLoadingManagers}
        />
      </div>
    </AdminGuard>
  );
}
