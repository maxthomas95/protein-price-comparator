import React from "react";
import ToggleTarget from "./ToggleTarget";

interface HeaderProps {
  onAdd: () => void;
  onSettings: () => void;
  target: 25 | 30;
  onToggleTarget: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAdd, onSettings, target, onToggleTarget }) => {
  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold">Protein Price Comparator</h1>
        
        <div className="flex items-center space-x-3 mt-2 md:mt-0">
          <button
            onClick={onAdd}
            className="bg-white text-blue-600 px-3 py-1 rounded-md font-medium hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
            aria-label="Add new item"
          >
            Add Item
          </button>
          
          <ToggleTarget target={target} onToggle={onToggleTarget} />
          
          <button
            onClick={onSettings}
            className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
            aria-label="Open settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
