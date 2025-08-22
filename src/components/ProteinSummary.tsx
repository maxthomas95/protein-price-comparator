import React from "react";
import type { Item } from "../types";
import { summarizeProtein } from "../utils/format";

interface ProteinSummaryProps {
  item: Item;
}

const ProteinSummary: React.FC<ProteinSummaryProps> = ({ item }) => {
  return (
    <div className="text-sm">
      {summarizeProtein(item)}
    </div>
  );
};

export default ProteinSummary;
