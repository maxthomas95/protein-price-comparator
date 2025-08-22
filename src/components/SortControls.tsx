import React from "react";
import type { SortKey, SortDir, Settings } from "../types";
import { getSortKeyLabel } from "../utils/sorting";

interface SortControlsProps {
  sortKey: SortKey;
  sortDir: SortDir;
  onChangeSortKey: (key: SortKey) => void;
  onToggleDir: () => void;
  settings: Settings;
}

const SortControls: React.FC<SortControlsProps> = ({
  sortKey,
  sortDir,
  onChangeSortKey,
  onToggleDir,
  settings,
}) => {
  const sortOptions: SortKey[] = ["$/target", "$/g", "price", "name", "brand", "store"];

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="sort-select" className="text-sm font-medium text-gray-700">
        Sort by:
      </label>
      <div className="flex">
        <select
          id="sort-select"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-l-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
          value={sortKey}
          onChange={(e) => onChangeSortKey(e.target.value as SortKey)}
          aria-label="Sort by"
        >
          {sortOptions.map((option) => (
            <option key={option} value={option}>
              {getSortKeyLabel(option, settings)}
            </option>
          ))}
        </select>
        <button
          onClick={onToggleDir}
          className="bg-gray-50 border border-gray-300 border-l-0 text-gray-900 text-sm rounded-r-lg p-2 focus:ring-blue-500 focus:border-blue-500"
          aria-label={`Sort direction: ${sortDir === "asc" ? "ascending" : "descending"}`}
          aria-pressed={sortDir === "asc"}
        >
          {sortDir === "asc" ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default SortControls;
