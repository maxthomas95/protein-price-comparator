import React from "react";
import type { Item, Settings } from "../types";
import { calc } from "../utils/calc";
import { formatCurrency, formatNumber } from "../utils/format";
import StarButton from "./StarButton";
import PriceSummary from "./PriceSummary";
import ProteinSummary from "./ProteinSummary";

interface ItemRowProps {
  item: Item;
  settings: Settings;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

const ItemRow: React.FC<ItemRowProps> = ({
  item,
  settings,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleFavorite,
}) => {
  const calcResult = calc(item, settings);
  
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="py-3 px-2 text-center">
        <StarButton
          active={!!item.favorite}
          onToggle={() => onToggleFavorite(item.id)}
        />
      </td>
      
      <td className="py-3 px-4">
        <div className="font-medium">{item.name}</div>
        {(item.brand || item.store) && (
          <div className="text-xs text-gray-500">
            {item.brand && <span>{item.brand}</span>}
            {item.brand && item.store && <span> • </span>}
            {item.store && <span>{item.store}</span>}
          </div>
        )}
      </td>
      
      <td className="py-3 px-4">
        <PriceSummary item={item} />
      </td>
      
      <td className="py-3 px-4">
        <ProteinSummary item={item} />
      </td>
      
      <td className="py-3 px-4 text-right">
        {formatCurrency(calcResult.costPerGram, settings.currencySymbol)}
      </td>
      
      <td className="py-3 px-4 text-right font-medium">
        {formatCurrency(calcResult.costPerTarget, settings.currencySymbol)}
      </td>
      
      <td className="py-3 px-4">
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => onEdit(item.id)}
            className="text-blue-600 hover:text-blue-800 p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
            aria-label={`Edit ${item.name}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          
          <button
            onClick={() => onDuplicate(item.id)}
            className="text-green-600 hover:text-green-800 p-1 rounded focus:outline-none focus:ring-2 focus:ring-green-300"
            aria-label={`Duplicate ${item.name}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
              <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
            </svg>
          </button>
          
          <button
            onClick={() => onDelete(item.id)}
            className="text-red-600 hover:text-red-800 p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-300"
            aria-label={`Delete ${item.name}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ItemRow;
