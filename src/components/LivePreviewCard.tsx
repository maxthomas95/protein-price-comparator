import React from "react";
import type { Item, Settings } from "../types";
import { calc } from "../utils/calc";
import { formatCurrency } from "../utils/format";

interface LivePreviewCardProps {
  item: Partial<Item>;
  settings: Settings;
}

const LivePreviewCard: React.FC<LivePreviewCardProps> = ({ item, settings }) => {
  // Create a complete item for calculation by filling in required fields
  const completeItem: Item = {
    id: "preview",
    name: item.name || "Preview Item",
    priceMode: item.priceMode || "totalPrice",
    proteinBasis: item.proteinBasis || "per100g",
    ...item,
  };

  const calcResult = calc(completeItem, settings);

  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <h3 className="text-lg font-medium text-blue-800 mb-2">Price Preview</h3>
      
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="text-sm text-blue-700">Cost per gram of protein:</div>
        <div className="text-sm font-medium text-right">
          {formatCurrency(calcResult.costPerGram, settings.currencySymbol)}
        </div>
        
        <div className="text-sm text-blue-700">
          Cost per {settings.comparisonTarget}g of protein:
        </div>
        <div className="text-lg font-bold text-right">
          {formatCurrency(calcResult.costPerTarget, settings.currencySymbol)}
        </div>
      </div>
      
      {!calcResult.valid && (
        <div className="text-sm text-red-600 mt-2">
          <p>Missing or invalid data. Please fill in all required fields.</p>
        </div>
      )}
      
      {calcResult.warnings.length > 0 && (
        <div className="text-sm text-amber-600 mt-2">
          {calcResult.warnings.map((warning, index) => (
            <p key={index}>{warning}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default LivePreviewCard;
