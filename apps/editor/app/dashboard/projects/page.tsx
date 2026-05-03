import { getDashboardData, searchProjects } from "../actions";
import { ProjectsGrid } from "../_components/ProjectsGrid";
import { CreateProjectModal } from "../_components/CreateProjectModal";
import { SearchInput } from "../_components/SearchInput";
import { SortFilterControls } from "../_components/SortFilterControls";

export default async function ProjectsPage(props: {
  searchParams?: Promise<{ q?: string; sort?: string; filter?: string; teamId?: string }>;
}) {
  const sp = await props.searchParams ?? {};

  // getDashboardData provides teams (for CreateProjectModal) and starredProjectIds
  const data = await getDashboardData();

  const org = data?.organizations?.[0]?.organization;

  if (!org) {
    return (
      <div className="flex-1 overflow-y-auto p-8">
        <p className="text-zinc-500">No organization found.</p>
      </div>
    );
  }

  const teams = org.teams.map((t: { id: string; name: string }) => ({
    id: t.id,
    name: t.name,
  }));

  const starredProjectIds = data?.starredProjectIds ?? [];

  // searchProjects handles team membership + soft-delete + case-insensitive name filter
  const rawProjects = await searchProjects({
    query: sp.q,
    sort: sp.sort as "name" | "modified" | "opened" | undefined,
    filter: sp.filter as "all" | "recent" | "starred" | "archived" | undefined,
    teamId: sp.teamId ?? null,
  });

  const allProjects = rawProjects.map((proj) => ({
    ...proj,
    teamName: proj.team.name,
    description: null as string | null,
  }));

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">All Projects</h1>
            <p className="text-zinc-500 text-sm mt-0.5">Manage projects across all teams.</p>
          </div>
          <CreateProjectModal teams={teams} />
        </header>
        <div className="mb-6 flex items-center justify-between">
          <div className="w-full max-w-md">
            <SearchInput />
          </div>
          <SortFilterControls
            currentSort={(sp.sort as "name" | "modified" | "opened") ?? "name"}
            currentFilter={(sp.filter as "all" | "recent" | "starred" | "archived") ?? "all"}
          />
        </div>
        <ProjectsGrid
          projects={allProjects}
          starredProjectIds={starredProjectIds}
        />
      </div>
    </div>
  );
}
