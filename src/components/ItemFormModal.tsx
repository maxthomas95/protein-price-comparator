import React, { useState, useEffect, useRef } from "react";
import type { Item, UnitMass, PriceMode, ProteinBasis, Settings } from "../types";
import { validateItem, getFieldError } from "../utils/validate";
import LivePreviewCard from "./LivePreviewCard";
import { v4 as uuidv4 } from "uuid";

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Item) => void;
  item?: Item; // If provided, we're editing an existing item
  settings: Settings;
}

const DEFAULT_ITEM: Item = {
  id: "",
  name: "",
  priceMode: "totalPrice",
  proteinBasis: "per100g",
  favorite: false,
};

const MASS_UNITS: UnitMass[] = ["g", "kg", "oz", "lb"];

const ItemFormModal: React.FC<ItemFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  item,
  settings,
}) => {
  const [formData, setFormData] = useState<Item>(item || { ...DEFAULT_ITEM, id: uuidv4() });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  const initialFocusRef = useRef<HTMLInputElement>(null);
  
  // Reset form when item changes or modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData(item || { ...DEFAULT_ITEM, id: uuidv4() });
      setErrors({});
      setTouched({});
    }
  }, [isOpen, item]);
  
  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen && initialFocusRef.current) {
      initialFocusRef.current.focus();
    }
  }, [isOpen]);
  
  // Validate form data when it changes
  useEffect(() => {
    const validationResult = validateItem(formData);
    setErrors(validationResult.errors);
  }, [formData]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setTouched(prev => ({ ...prev, [name]: true }));
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData(prev => ({ ...prev, [name]: value === "" ? undefined : parseFloat(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handlePriceModeChange = (mode: PriceMode) => {
    setFormData(prev => ({ ...prev, priceMode: mode }));
  };
  
  const handleProteinBasisChange = (basis: ProteinBasis) => {
    setFormData(prev => ({ ...prev, proteinBasis: basis }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched for validation
    const allFields = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allFields);
    
    const validationResult = validateItem(formData);
    if (!validationResult.valid) {
      setErrors(validationResult.errors);
      return;
    }
    
    onSave(formData);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="item-modal-title">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        
        {/* Center dialog */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        {/* Dialog panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4" id="item-modal-title">
                {item ? "Edit Item" : "Add New Item"}
              </h3>
              
              {/* Basic Info */}
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  ref={initialFocusRef}
                  className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                    touched.name && errors.name ? "border-red-500" : ""
                  }`}
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                {touched.name && errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    id="brand"
                    name="brand"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={formData.brand || ""}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="store" className="block text-sm font-medium text-gray-700 mb-1">
                    Store
                  </label>
                  <input
                    type="text"
                    id="store"
                    name="store"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={formData.store || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              {/* Price Mode */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Information *
                </label>
                <div className="flex space-x-4 mb-3">
                  <div className="flex items-center">
                    <input
                      id="price-mode-total"
                      name="price-mode"
                      type="radio"
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                      checked={formData.priceMode === "totalPrice"}
                      onChange={() => handlePriceModeChange("totalPrice")}
                    />
                    <label htmlFor="price-mode-total" className="ml-2 block text-sm text-gray-700">
                      Total Price
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="price-mode-unit"
                      name="price-mode"
                      type="radio"
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                      checked={formData.priceMode === "unitPrice"}
                      onChange={() => handlePriceModeChange("unitPrice")}
                    />
                    <label htmlFor="price-mode-unit" className="ml-2 block text-sm text-gray-700">
                      Unit Price
                    </label>
                  </div>
                </div>
                
                {/* Total Price Mode Fields */}
                {formData.priceMode === "totalPrice" && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <label htmlFor="priceTotal" className="block text-sm font-medium text-gray-700 mb-1">
                          Total Price *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">{settings.currencySymbol}</span>
                          </div>
                          <input
                            type="number"
                            id="priceTotal"
                            name="priceTotal"
                            className={`pl-7 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                              touched.priceTotal && errors.priceTotal ? "border-red-500" : ""
                            }`}
                            value={formData.priceTotal || ""}
                            onChange={handleChange}
                            step="0.01"
                            min="0.01"
                          />
                        </div>
                        {touched.priceTotal && errors.priceTotal && (
                          <p className="mt-1 text-sm text-red-600">{errors.priceTotal}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="packageAmount" className="block text-sm font-medium text-gray-700 mb-1">
                          Package Amount *
                        </label>
                        <input
                          type="number"
                          id="packageAmount"
                          name="packageAmount"
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            touched.packageAmount && errors.packageAmount ? "border-red-500" : ""
                          }`}
                          value={formData.packageAmount || ""}
                          onChange={handleChange}
                          step="0.01"
                          min="0.01"
                        />
                        {touched.packageAmount && errors.packageAmount && (
                          <p className="mt-1 text-sm text-red-600">{errors.packageAmount}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="packageUnit" className="block text-sm font-medium text-gray-700 mb-1">
                          Unit *
                        </label>
                        <select
                          id="packageUnit"
                          name="packageUnit"
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            touched.packageUnit && errors.packageUnit ? "border-red-500" : ""
                          }`}
                          value={formData.packageUnit || ""}
                          onChange={handleChange}
                        >
                          <option value="">Select unit</option>
                          {MASS_UNITS.map((unit) => (
                            <option key={unit} value={unit}>
                              {unit}
                            </option>
                          ))}
                        </select>
                        {touched.packageUnit && errors.packageUnit && (
                          <p className="mt-1 text-sm text-red-600">{errors.packageUnit}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Unit Price Mode Fields */}
                {formData.priceMode === "unitPrice" && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700 mb-1">
                          Unit Price *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">{settings.currencySymbol}</span>
                          </div>
                          <input
                            type="number"
                            id="unitPrice"
                            name="unitPrice"
                            className={`pl-7 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                              touched.unitPrice && errors.unitPrice ? "border-red-500" : ""
                            }`}
                            value={formData.unitPrice || ""}
                            onChange={handleChange}
                            step="0.01"
                            min="0.01"
                          />
                        </div>
                        {touched.unitPrice && errors.unitPrice && (
                          <p className="mt-1 text-sm text-red-600">{errors.unitPrice}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="unitPriceUnit" className="block text-sm font-medium text-gray-700 mb-1">
                          Per Unit *
                        </label>
                        <select
                          id="unitPriceUnit"
                          name="unitPriceUnit"
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            touched.unitPriceUnit && errors.unitPriceUnit ? "border-red-500" : ""
                          }`}
                          value={formData.unitPriceUnit || ""}
                          onChange={handleChange}
                        >
                          <option value="">Select unit</option>
                          {MASS_UNITS.map((unit) => (
                            <option key={unit} value={unit}>
                              {unit}
                            </option>
                          ))}
                        </select>
                        {touched.unitPriceUnit && errors.unitPriceUnit && (
                          <p className="mt-1 text-sm text-red-600">{errors.unitPriceUnit}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Package Information (Optional)
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <input
                            type="number"
                            id="packageAmountOptional"
                            name="packageAmountOptional"
                            className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                              touched.packageAmountOptional && errors.packageAmountOptional ? "border-red-500" : ""
                            }`}
                            value={formData.packageAmountOptional || ""}
                            onChange={handleChange}
                            placeholder="Amount"
                            step="0.01"
                            min="0.01"
                          />
                          {touched.packageAmountOptional && errors.packageAmountOptional && (
                            <p className="mt-1 text-sm text-red-600">{errors.packageAmountOptional}</p>
                          )}
                        </div>
                        <div>
                          <select
                            id="packageUnitOptional"
                            name="packageUnitOptional"
                            className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                              touched.packageUnitOptional && errors.packageUnitOptional ? "border-red-500" : ""
                            }`}
                            value={formData.packageUnitOptional || ""}
                            onChange={handleChange}
                          >
                            <option value="">Select unit</option>
                            {MASS_UNITS.map((unit) => (
                              <option key={unit} value={unit}>
                                {unit}
                              </option>
                            ))}
                          </select>
                          {touched.packageUnitOptional && errors.packageUnitOptional && (
                            <p className="mt-1 text-sm text-red-600">{errors.packageUnitOptional}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Protein Basis */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Protein Information *
                </label>
                <div className="flex space-x-4 mb-3">
                  <div className="flex items-center">
                    <input
                      id="protein-basis-per100g"
                      name="protein-basis"
                      type="radio"
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                      checked={formData.proteinBasis === "per100g"}
                      onChange={() => handleProteinBasisChange("per100g")}
                    />
                    <label htmlFor="protein-basis-per100g" className="ml-2 block text-sm text-gray-700">
                      Per 100g
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="protein-basis-perServing"
                      name="protein-basis"
                      type="radio"
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                      checked={formData.proteinBasis === "perServing"}
                      onChange={() => handleProteinBasisChange("perServing")}
                    />
                    <label htmlFor="protein-basis-perServing" className="ml-2 block text-sm text-gray-700">
                      Per Serving
                    </label>
                  </div>
                </div>
                
                {/* Per 100g Fields */}
                {formData.proteinBasis === "per100g" && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div>
                      <label htmlFor="proteinPer100g" className="block text-sm font-medium text-gray-700 mb-1">
                        Grams of Protein per 100g *
                      </label>
                      <input
                        type="number"
                        id="proteinPer100g"
                        name="proteinPer100g"
                        className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          touched.proteinPer100g && errors.proteinPer100g ? "border-red-500" : ""
                        }`}
                        value={formData.proteinPer100g || ""}
                        onChange={handleChange}
                        step="0.1"
                        min="0.1"
                      />
                      {touched.proteinPer100g && errors.proteinPer100g && (
                        <p className="mt-1 text-sm text-red-600">{errors.proteinPer100g}</p>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Per Serving Fields */}
                {formData.proteinBasis === "perServing" && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <label htmlFor="servingSizeAmount" className="block text-sm font-medium text-gray-700 mb-1">
                          Serving Size Amount *
                        </label>
                        <input
                          type="number"
                          id="servingSizeAmount"
                          name="servingSizeAmount"
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            touched.servingSizeAmount && errors.servingSizeAmount ? "border-red-500" : ""
                          }`}
                          value={formData.servingSizeAmount || ""}
                          onChange={handleChange}
                          step="0.1"
                          min="0.1"
                        />
                        {touched.servingSizeAmount && errors.servingSizeAmount && (
                          <p className="mt-1 text-sm text-red-600">{errors.servingSizeAmount}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="servingSizeUnit" className="block text-sm font-medium text-gray-700 mb-1">
                          Unit *
                        </label>
                        <select
                          id="servingSizeUnit"
                          name="servingSizeUnit"
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            touched.servingSizeUnit && errors.servingSizeUnit ? "border-red-500" : ""
                          }`}
                          value={formData.servingSizeUnit || ""}
                          onChange={handleChange}
                        >
                          <option value="">Select unit</option>
                          {MASS_UNITS.map((unit) => (
                            <option key={unit} value={unit}>
                              {unit}
                            </option>
                          ))}
                        </select>
                        {touched.servingSizeUnit && errors.servingSizeUnit && (
                          <p className="mt-1 text-sm text-red-600">{errors.servingSizeUnit}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="proteinPerServing" className="block text-sm font-medium text-gray-700 mb-1">
                        Grams of Protein per Serving *
                      </label>
                      <input
                        type="number"
                        id="proteinPerServing"
                        name="proteinPerServing"
                        className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          touched.proteinPerServing && errors.proteinPerServing ? "border-red-500" : ""
                        }`}
                        value={formData.proteinPerServing || ""}
                        onChange={handleChange}
                        step="0.1"
                        min="0.1"
                      />
                      {touched.proteinPerServing && errors.proteinPerServing && (
                        <p className="mt-1 text-sm text-red-600">{errors.proteinPerServing}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Notes and Favorite */}
              <div className="mb-4">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={2}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.notes || ""}
                  onChange={handleChange}
                />
              </div>
              
              <div className="mb-4">
                <div className="flex items-center">
                  <input
                    id="favorite"
                    name="favorite"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={!!formData.favorite}
                    onChange={(e) => setFormData(prev => ({ ...prev, favorite: e.target.checked }))}
                  />
                  <label htmlFor="favorite" className="ml-2 block text-sm text-gray-700">
                    Add to favorites
                  </label>
                </div>
              </div>
              
              {/* Live Preview */}
              <div className="mt-6">
                <LivePreviewCard item={formData} settings={settings} />
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                disabled={Object.keys(errors).length > 0}
              >
                Save
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ItemFormModal;
