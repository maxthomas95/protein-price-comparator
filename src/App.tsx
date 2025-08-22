import React, { useState, useCallback } from "react";
import { useSettings } from "./hooks/useSettings";
import { useItems } from "./hooks/useItems";
import { filterItems } from "./utils/filtering";
import { getComparator } from "./utils/sorting";
import type { Item, SortKey, SortDir } from "./types";

import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import FavoritesToggle from "./components/FavoritesToggle";
import SortControls from "./components/SortControls";
import ItemTable from "./components/ItemTable";
import ItemFormModal from "./components/ItemFormModal";
import SettingsModal from "./components/SettingsModal";
import ConfirmDialog from "./components/ConfirmDialog";

const App: React.FC = () => {
  // State from hooks
  const { settings, toggleTarget, updateSettings } = useSettings();
  const { items, addItem, updateItem, deleteItem, duplicateItem, toggleFavorite, resetDemoItems } = useItems();
  
  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("$/target");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | undefined>(undefined);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<Item | undefined>(undefined);
  
  // Handlers
  const handleAddItem = useCallback(() => {
    setEditingItem(undefined);
    setShowAddModal(true);
  }, []);
  
  const handleEditItem = useCallback((id: string) => {
    const item = items.find(item => item.id === id);
    if (item) {
      setEditingItem(item);
      setShowAddModal(true);
    }
  }, [items]);
  
  const handleSaveItem = useCallback((item: Item) => {
    if (editingItem) {
      updateItem(item.id, item);
    } else {
      addItem(item);
    }
    setShowAddModal(false);
    setEditingItem(undefined);
  }, [addItem, updateItem, editingItem]);
  
  const handleDeleteConfirm = useCallback((id: string) => {
    const item = items.find(item => item.id === id);
    if (item) {
      setDeleteConfirmItem(item);
    }
  }, [items]);
  
  const handleDeleteItem = useCallback(() => {
    if (deleteConfirmItem) {
      deleteItem(deleteConfirmItem.id);
      setDeleteConfirmItem(undefined);
    }
  }, [deleteItem, deleteConfirmItem]);
  
  const handleToggleSortDir = useCallback(() => {
    setSortDir(prev => (prev === "asc" ? "desc" : "asc"));
  }, []);
  
  // Filter and sort items
  const filteredItems = filterItems(items, { query: searchQuery, favoritesOnly });
  const sortedItems = [...filteredItems].sort(getComparator(sortKey, sortDir, settings));
  
  // Check if filters are active
  const hasFilters = searchQuery.trim() !== "" || favoritesOnly;
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        onAdd={handleAddItem}
        onSettings={() => setShowSettingsModal(true)}
        target={settings.comparisonTarget}
        onToggleTarget={toggleTarget}
      />
      
      <main className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Controls */}
          <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4 items-center">
            <div className="w-full md:w-auto flex-grow md:max-w-xs">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </div>
            
            <div className="flex-shrink-0">
              <FavoritesToggle
                checked={favoritesOnly}
                onChange={setFavoritesOnly}
              />
            </div>
            
            <div className="flex-shrink-0 ml-auto">
              <SortControls
                sortKey={sortKey}
                sortDir={sortDir}
                onChangeSortKey={setSortKey}
                onToggleDir={handleToggleSortDir}
                settings={settings}
              />
            </div>
          </div>
          
          {/* Table */}
          <ItemTable
            items={sortedItems}
            settings={settings}
            sortKey={sortKey}
            sortDir={sortDir}
            onSortChange={setSortKey}
            onSortDirToggle={handleToggleSortDir}
            onEdit={handleEditItem}
            onDuplicate={duplicateItem}
            onDelete={handleDeleteConfirm}
            onToggleFavorite={toggleFavorite}
            onAdd={handleAddItem}
            hasFilters={hasFilters}
          />
        </div>
      </main>
      
      {/* Modals */}
      <ItemFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveItem}
        item={editingItem}
        settings={settings}
      />
      
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        settings={settings}
        onSave={updateSettings}
        onResetDemo={resetDemoItems}
      />
      
      <ConfirmDialog
        isOpen={!!deleteConfirmItem}
        title="Delete Item"
        message={`Are you sure you want to delete "${deleteConfirmItem?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteItem}
        onCancel={() => setDeleteConfirmItem(undefined)}
        isDanger
      />
    </div>
  );
};

export default App;
