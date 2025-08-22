import React from "react";
import type { Item } from "../types";
import { summarizePrice } from "../utils/format";

interface PriceSummaryProps {
  item: Item;
}

const PriceSummary: React.FC<PriceSummaryProps> = ({ item }) => {
  return (
    <div className="text-sm">
      {summarizePrice(item)}
    </div>
  );
};

export default PriceSummary;
