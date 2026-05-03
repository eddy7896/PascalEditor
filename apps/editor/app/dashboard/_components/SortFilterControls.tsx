"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

type SortOption = "name" | "modified" | "opened";
type FilterOption = "all" | "recent" | "starred" | "archived";

export function SortFilterControls({
  currentSort,
  currentFilter,
}: {
  currentSort: SortOption;
  currentFilter: FilterOption;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const sortRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortOpen(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(key, value);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const sortLabelMap: Record<SortOption, string> = {
    name: "Name",
    modified: "Last Modified",
    opened: "Last Opened",
  };

  const filterLabelMap: Record<FilterOption, string> = {
    all: "All",
    recent: "Recent",
    starred: "Starred",
    archived: "Archived",
  };

  return (
    <div className="flex gap-3 mb-6">
      {/* Sort dropdown */}
      <div className="relative" ref={sortRef} data-testid="sort-control">
        <button
          onClick={() => {
            setSortOpen(!sortOpen);
            setFilterOpen(false);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800/60 border border-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors text-sm"
        >
          Sort: {sortLabelMap[currentSort] || "Name"}
          <ChevronDown className="w-4 h-4" />
        </button>
        {sortOpen && (
          <div className="absolute top-full left-0 mt-1 w-40 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-10 py-1">
            {(["name", "modified", "opened"] as SortOption[]).map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  updateParam("sort", opt);
                  setSortOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-zinc-700 transition-colors ${
                  currentSort === opt ? "text-white bg-zinc-700/50" : "text-zinc-300"
                }`}
              >
                {sortLabelMap[opt]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filter dropdown */}
      <div className="relative" ref={filterRef} data-testid="filter-control">
        <button
          onClick={() => {
            setFilterOpen(!filterOpen);
            setSortOpen(false);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800/60 border border-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors text-sm"
        >
          Filter: {filterLabelMap[currentFilter] || "All"}
          <ChevronDown className="w-4 h-4" />
        </button>
        {filterOpen && (
          <div className="absolute top-full left-0 mt-1 w-32 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-10 py-1">
            {(["all", "recent", "starred", "archived"] as FilterOption[]).map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  updateParam("filter", opt);
                  setFilterOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-zinc-700 transition-colors ${
                  currentFilter === opt ? "text-white bg-zinc-700/50" : "text-zinc-300"
                }`}
              >
                {filterLabelMap[opt]}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
