import React from "react";
import type { Item, Settings, SortKey, SortDir } from "../types";
import { getSortKeyLabel } from "../utils/sorting";
import ItemRow from "./ItemRow";
import EmptyState from "./EmptyState";

interface ItemTableProps {
  items: Item[];
  settings: Settings;
  sortKey: SortKey;
  sortDir: SortDir;
  onSortChange: (key: SortKey) => void;
  onSortDirToggle: () => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onAdd: () => void;
  hasFilters: boolean;
}

const ItemTable: React.FC<ItemTableProps> = ({
  items,
  settings,
  sortKey,
  sortDir,
  onSortChange,
  onSortDirToggle,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleFavorite,
  onAdd,
  hasFilters,
}) => {
  if (items.length === 0) {
    return <EmptyState onAdd={onAdd} hasFilters={hasFilters} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="w-10 px-2 py-3 text-center">
              <span className="sr-only">Favorite</span>
            </th>
            
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => onSortChange("name")}
              aria-sort={sortKey === "name" ? (sortDir === "asc" ? "ascending" : "descending") : undefined}
            >
              <div className="flex items-center">
                <span>Name</span>
                {sortKey === "name" && (
                  <span className="ml-1">
                    {sortDir === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </th>
            
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => onSortChange("price")}
              aria-sort={sortKey === "price" ? (sortDir === "asc" ? "ascending" : "descending") : undefined}
            >
              <div className="flex items-center">
                <span>Price</span>
                {sortKey === "price" && (
                  <span className="ml-1">
                    {sortDir === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </th>
            
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Protein
            </th>
            
            <th
              scope="col"
              className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => onSortChange("$/g")}
              aria-sort={sortKey === "$/g" ? (sortDir === "asc" ? "ascending" : "descending") : undefined}
            >
              <div className="flex items-center justify-end">
                <span>$/g</span>
                {sortKey === "$/g" && (
                  <span className="ml-1">
                    {sortDir === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </th>
            
            <th
              scope="col"
              className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => onSortChange("$/target")}
              aria-sort={sortKey === "$/target" ? (sortDir === "asc" ? "ascending" : "descending") : undefined}
            >
              <div className="flex items-center justify-end">
                <span>{getSortKeyLabel("$/target", settings)}</span>
                {sortKey === "$/target" && (
                  <span className="ml-1">
                    {sortDir === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </th>
            
            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              settings={settings}
              onEdit={onEdit}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ItemTable;
