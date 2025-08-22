export type UnitMass = "g" | "kg" | "oz" | "lb";
export type ProteinBasis = "per100g" | "perServing";
export type PriceMode = "totalPrice" | "unitPrice";

export type Item = {
  id: string;
  name: string;
  brand?: string;
  store?: string;

  priceMode: PriceMode;
  // Mode A
  priceTotal?: number;
  packageAmount?: number;
  packageUnit?: UnitMass;
  // Mode B
  unitPrice?: number;
  unitPriceUnit?: UnitMass;
  packageAmountOptional?: number;
  packageUnitOptional?: UnitMass;

  proteinBasis: ProteinBasis;
  proteinPer100g?: number;
  servingSizeAmount?: number;
  servingSizeUnit?: UnitMass;
  proteinPerServing?: number;

  notes?: string;
  favorite?: boolean;
};

export type Settings = {
  currencySymbol: string;
  comparisonTarget: 25 | 30;
};

export type SortKey = "$/target" | "$/g" | "price" | "name" | "brand" | "store";
export type SortDir = "asc" | "desc";

export type Filters = {
  query: string;
  favoritesOnly: boolean;
};
