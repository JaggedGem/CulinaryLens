import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Define types for grocery items
export interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  category: string;
  checked: boolean;
  recipeId?: string;
  recipeName?: string;
}

// Define type for grocery list context
interface GroceryListContextType {
  groceryItems: GroceryItem[];
  addItem: (item: Omit<GroceryItem, 'id' | 'checked'>) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<GroceryItem>) => void;
  toggleChecked: (id: string) => void;
  clearCheckedItems: () => void;
  clearAllItems: () => void;
  addItemsFromRecipe: (recipeId: string, recipeName: string, ingredients: string[]) => void;
  getRecipeItems: (recipeId: string) => GroceryItem[];
}

// Create a context for the grocery list
const GroceryListContext = createContext<GroceryListContextType>({
  groceryItems: [],
  addItem: () => {},
  removeItem: () => {},
  updateItem: () => {},
  toggleChecked: () => {},
  clearCheckedItems: () => {},
  clearAllItems: () => {},
  addItemsFromRecipe: () => {},
  getRecipeItems: () => [],
});

// Common food categories for organization
export const FOOD_CATEGORIES = [
  'Produce', 
  'Meat & Seafood',
  'Dairy & Eggs',
  'Bakery',
  'Pantry',
  'Frozen',
  'Beverages',
  'Herbs & Spices',
  'Other'
];

// Create a provider component
export const GroceryListProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);

  // Load grocery list from storage when the component mounts
  useEffect(() => {
    const loadGroceryList = async () => {
      try {
        const savedList = await AsyncStorage.getItem('groceryList');
        if (savedList) {
          setGroceryItems(JSON.parse(savedList));
        }
      } catch (error) {
        console.error('Error loading grocery list:', error);
      }
    };

    loadGroceryList();
  }, []);

  // Save grocery list to storage whenever it changes
  useEffect(() => {
    const saveGroceryList = async () => {
      try {
        await AsyncStorage.setItem('groceryList', JSON.stringify(groceryItems));
      } catch (error) {
        console.error('Error saving grocery list:', error);
      }
    };

    saveGroceryList();
  }, [groceryItems]);

  // Generate a unique ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  // Add a new item to the grocery list
  const addItem = (item: Omit<GroceryItem, 'id' | 'checked'>) => {
    const newItem: GroceryItem = {
      ...item,
      id: generateId(),
      checked: false
    };
    setGroceryItems(prev => [...prev, newItem]);
  };

  // Remove an item from the grocery list
  const removeItem = (id: string) => {
    setGroceryItems(prev => prev.filter(item => item.id !== id));
  };

  // Update an existing item
  const updateItem = (id: string, updates: Partial<GroceryItem>) => {
    setGroceryItems(prev => 
      prev.map(item => item.id === id ? { ...item, ...updates } : item)
    );
  };

  // Toggle the checked status of an item
  const toggleChecked = (id: string) => {
    setGroceryItems(prev => 
      prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item)
    );
  };

  // Clear all checked items
  const clearCheckedItems = () => {
    setGroceryItems(prev => prev.filter(item => !item.checked));
  };

  // Clear all items
  const clearAllItems = () => {
    setGroceryItems([]);
  };

  // Categorize an ingredient based on common patterns
  const categorizeIngredient = (ingredient: string): string => {
    const lowerCaseIngredient = ingredient.toLowerCase();
    
    if (/apple|banana|orange|strawberr|blueberr|raspberr|lemon|lime|grape|melon|peach|pear|plum|apricot|cherry|kiwi|pineapple|tomato|potato|onion|garlic|lettuce|spinach|kale|cabbage|carrot|broccoli|pepper|celery|cucumber|avocado|zucchini|squash|mushroom|eggplant/.test(lowerCaseIngredient)) {
      return 'Produce';
    } else if (/chicken|beef|pork|turkey|lamb|fish|salmon|tuna|shrimp|crab|lobster|meat|steak|ground/.test(lowerCaseIngredient)) {
      return 'Meat & Seafood';
    } else if (/milk|cream|cheese|butter|yogurt|egg|margarine|sour cream|cream cheese/.test(lowerCaseIngredient)) {
      return 'Dairy & Eggs';
    } else if (/bread|bun|roll|bagel|tortilla|pita|croissant|muffin|cake|pastry|dough/.test(lowerCaseIngredient)) {
      return 'Bakery';
    } else if (/rice|pasta|noodle|flour|sugar|salt|vinegar|oil|sauce|syrup|honey|peanut butter|jam|jelly|cereal|oat|bean|lentil|chickpea|corn|pea|canned|condiment|ketchup|mustard|mayonnaise/.test(lowerCaseIngredient)) {
      return 'Pantry';
    } else if (/frozen|ice|ice cream/.test(lowerCaseIngredient)) {
      return 'Frozen';
    } else if (/water|juice|soda|coffee|tea|wine|beer|alcohol|drink|beverage/.test(lowerCaseIngredient)) {
      return 'Beverages';
    } else if (/pepper|salt|oregano|basil|thyme|rosemary|cumin|paprika|cinnamon|nutmeg|ginger|garlic powder|onion powder|bay leaf|curry|chili|spice|herb/.test(lowerCaseIngredient)) {
      return 'Herbs & Spices';
    } else {
      return 'Other';
    }
  };

  // Parse an ingredient string to extract quantity, unit, and name
  const parseIngredient = (ingredientLine: string): { name: string, quantity: string, unit: string } => {
    // Skip if it looks like a header (ends with ":" and is less than 25 characters)
    if (ingredientLine.trim().endsWith(':') && ingredientLine.length < 25) {
      return { name: '', quantity: '', unit: '' };
    }
    
    // Remove headers (anything before ":" on a line)
    let processedLine = ingredientLine.includes(':') 
      ? ingredientLine.substring(ingredientLine.indexOf(':') + 1).trim() 
      : ingredientLine;
    
    // Remove amounts in parentheses like "(about 2 cups)"
    processedLine = processedLine.replace(/\([^)]*\)/g, '').trim();
    
    // Replace Unicode fractions with their standard fraction notation
    const unicodeFractionMap: { [key: string]: string } = {
      '½': '1/2',
      '⅓': '1/3',
      '⅔': '2/3',
      '¼': '1/4',
      '¾': '3/4',
      '⅕': '1/5',
      '⅖': '2/5',
      '⅗': '3/5',
      '⅘': '4/5',
      '⅙': '1/6',
      '⅚': '5/6',
      '⅛': '1/8',
      '⅜': '3/8',
      '⅝': '5/8',
      '⅞': '7/8',
    };
    
    // Replace Unicode fractions with standard fractions
    for (const [unicodeFraction, standardFraction] of Object.entries(unicodeFractionMap)) {
      processedLine = processedLine.replace(new RegExp(unicodeFraction, 'g'), standardFraction);
    }
    
    // Handle no space between number and unit (e.g., "500grams")
    // Look for patterns like digits immediately followed by a unit
    processedLine = processedLine.replace(/(\d+)(tbsp|tsp|cup|cups|tablespoon|tablespoons|teaspoon|teaspoons|gram|grams|kg|kilograms|ml|milliliters|liter|liters|oz|ounce|ounces|pound|pounds)/gi, 
      (match, num, unit) => `${num} ${unit}`);
    
    // Define units and their singular forms (case-insensitive)
    const unitMappings: { [key: string]: string } = {
      'tbsp': 'tablespoon',
      'tbsps': 'tablespoon',
      'tbs': 'tablespoon',
      'tb': 'tablespoon',
      't': 'tablespoon',
      'tablespoons': 'tablespoon',
      'tablespoon': 'tablespoon',
      'tsp': 'teaspoon',
      'tsps': 'teaspoon',
      'ts': 'teaspoon',
      't.': 'teaspoon',
      'teaspoons': 'teaspoon',
      'teaspoon': 'teaspoon',
      'cup': 'cup',
      'cups': 'cup',
      'c': 'cup',
      'c.': 'cup',
      'ounce': 'ounce',
      'ounces': 'ounce',
      'oz': 'ounce',
      'oz.': 'ounce',
      'pound': 'pound',
      'pounds': 'pound',
      'lb': 'pound',
      'lbs': 'pound',
      'lb.': 'pound',
      'lbs.': 'pound',
      'gram': 'gram',
      'grams': 'gram',
      'g': 'gram',
      'g.': 'gram',
      'kilogram': 'kilogram',
      'kilograms': 'kilogram',
      'kg': 'kilogram',
      'kg.': 'kilogram',
      'milliliter': 'milliliter',
      'milliliters': 'milliliter',
      'ml': 'milliliter',
      'ml.': 'milliliter',
      'liter': 'liter',
      'liters': 'liter',
      'l': 'liter',
      'l.': 'liter',
      'piece': 'piece',
      'pieces': 'piece',
      'pc': 'piece',
      'pcs': 'piece',
      'slice': 'slice',
      'slices': 'slice',
      'clove': 'clove',
      'cloves': 'clove',
      'bunch': 'bunch',
      'bunches': 'bunch',
      'sheet': 'sheet',
      'sheets': 'sheet',
    };
    
    // Plural unit mappings to preserve original format
    const pluralUnitMappings: { [key: string]: string } = {
      'tablespoons': 'tablespoons',
      'teaspoons': 'teaspoons',
      'cups': 'cups',
      'ounces': 'ounces',
      'pounds': 'pounds',
      'grams': 'grams',
      'kilograms': 'kilograms',
      'milliliters': 'milliliters',
      'liters': 'liters',
      'pieces': 'pieces',
      'slices': 'slices',
      'cloves': 'cloves',
      'bunches': 'bunches',
      'sheets': 'sheets',
    };
    
    // Create a regex pattern to match all possible units
    const unitsList = Object.keys(unitMappings).concat(Object.values(unitMappings));
    const unitsPattern = unitsList.join('|');
    
    // Simple fraction with unit pattern (e.g., "1/3 cup")
    const fractionWithUnitRegex = new RegExp(`^(\\d+\\/\\d+)\\s+(${unitsPattern}|pinch|dash|handful|to taste)`, 'i');
    const fractionWithUnitMatch = processedLine.match(fractionWithUnitRegex);
    
    if (fractionWithUnitMatch) {
      const fraction = fractionWithUnitMatch[1].trim();
      let unit = fractionWithUnitMatch[2].trim();
      const originalUnit = unit; // Save original unit format
      
      // Get normalized unit for comparison purposes
      const normalizedUnit = unitMappings[unit.toLowerCase()] || unit.toLowerCase();
      
      // Preserve plural form if it matches one of our pluralUnitMappings
      const finalUnit = pluralUnitMappings[originalUnit.toLowerCase()] || normalizedUnit;
      
      let name = processedLine.substring(fractionWithUnitMatch[0].length).trim();
      
      // Remove "of" from the beginning of the name if it exists
      if (name.toLowerCase().startsWith('of ')) {
        name = name.substring(3).trim();
      }
      
      // Capitalize the first letter of each word in the name
      name = name.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      
      return { name, quantity: fraction, unit: finalUnit };
    }
    
    // First, try to match for ranges with units - special case for "1-5 tablespoons" pattern
    const rangeWithUnitRegex = new RegExp(`^(\\d+\\s*-\\s*\\d+)\\s+(${unitsPattern}|pinch|dash|handful|to taste)`, 'i');
    const rangeWithUnitMatch = processedLine.match(rangeWithUnitRegex);
    
    if (rangeWithUnitMatch) {
      const rangeQuantity = rangeWithUnitMatch[1].replace(/\s+/g, ''); // Remove spaces in the range
      let unit = rangeWithUnitMatch[2].trim();
      const originalUnit = unit; // Save original unit format
      
      // Get normalized unit for comparison purposes
      const normalizedUnit = unitMappings[unit.toLowerCase()] || unit.toLowerCase();
      
      // Preserve plural form if it matches one of our pluralUnitMappings
      const finalUnit = pluralUnitMappings[originalUnit.toLowerCase()] || normalizedUnit;
      
      let name = processedLine.substring(rangeWithUnitMatch[0].length).trim();
      
      // Remove "of" from the beginning of the name if it exists
      if (name.toLowerCase().startsWith('of ')) {
        name = name.substring(3).trim();
      }
      
      // Capitalize the first letter of each word in the name
      name = name.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      
      return { name, quantity: rangeQuantity, unit: finalUnit };
    }
    
    // Special case for mixed fractions with units (e.g., "3 1/2 tablespoons")
    const mixedFractionRegex = new RegExp(`^(\\d+\\s+\\d+\\/\\d+)\\s+(${unitsPattern}|pinch|dash|handful|to taste)`, 'i');
    const mixedFractionMatch = processedLine.match(mixedFractionRegex);
    
    if (mixedFractionMatch) {
      const mixedFraction = mixedFractionMatch[1].trim();
      let unit = mixedFractionMatch[2].trim();
      const originalUnit = unit; // Save original unit format
      
      // Get normalized unit for comparison purposes
      const normalizedUnit = unitMappings[unit.toLowerCase()] || unit.toLowerCase();
      
      // Preserve plural form if it matches one of our pluralUnitMappings
      const finalUnit = pluralUnitMappings[originalUnit.toLowerCase()] || normalizedUnit;
      
      let name = processedLine.substring(mixedFractionMatch[0].length).trim();
      
      // Remove "of" from the beginning of the name if it exists
      if (name.toLowerCase().startsWith('of ')) {
        name = name.substring(3).trim();
      }
      
      // Capitalize the first letter of each word in the name
      name = name.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      
      return { name, quantity: mixedFraction, unit: finalUnit };
    }
    
    // General pattern matching for other cases
    const regex = new RegExp(`^((?:\\d+(?:\\.\\d+)?|\\d+\\/\\d+|\\d+\\s+\\d+\\/\\d+|\\d+\\s*-\\s*\\d+)?\\s*(${unitsPattern}|pinch|dash|handful|to taste)?(?:\\s+of)?\\s*)`, 'i');
    
    const match = processedLine.match(regex);
    
    if (match && match[1]) {
      const quantityAndUnit = match[1].trim();
      let name = processedLine.substring(match[1].length).trim();
      
      // Remove "of" from the beginning of the name if it exists
      if (name.toLowerCase().startsWith('of ')) {
        name = name.substring(3).trim();
      }
      
      // Capitalize the first letter of each word in the name
      name = name.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      
      // Create a regex to match just the unit
      const unitRegex = new RegExp(`(${unitsPattern}|pinch|dash|handful|to taste)$`, 'i');
      const unitMatch = quantityAndUnit.match(unitRegex);
      
      if (unitMatch) {
        let unit = unitMatch[1].trim();
        const originalUnit = unit; // Save original unit format
        
        // Get normalized unit for comparison purposes
        const normalizedUnit = unitMappings[unit.toLowerCase()] || unit.toLowerCase();
        
        // Preserve plural form if it matches one of our pluralUnitMappings
        const finalUnit = pluralUnitMappings[originalUnit.toLowerCase()] || normalizedUnit;
        
        // Extract the quantity by removing the unit
        let quantity = quantityAndUnit.substring(0, quantityAndUnit.length - unitMatch[1].length).trim();
        
        // Handle ranges like "1-5"
        if (quantity.includes('-')) {
          // Just keep the range format
          quantity = quantity.replace(/\s+/g, '');
        }
        // Handle mixed fractions like "3 1/2"
        else if (quantity.includes(' ') && quantity.includes('/')) {
          // Format: "3 1/2" - keep as is, but ensure consistent spacing
          const parts = quantity.split(' ').filter(part => part.trim() !== '');
          if (parts.length === 2 && parts[1].includes('/')) {
            // It's a mixed fraction like "3 1/2"
            quantity = `${parts[0]} ${parts[1]}`;
          }
        }
        // Special handling for simple fractions
        else if (quantity.includes('/')) {
          // Keep the fraction as is
        }
        
        return { name, quantity, unit: finalUnit };
      } else {
        // Check if the entire quantityAndUnit contains fractions, numbers, or ranges
        const hasNumbers = /\d/.test(quantityAndUnit);
        const hasRange = /-/.test(quantityAndUnit);
        
        if (hasNumbers || hasRange) {
          // Handle mixed fractions without units (e.g., "3 1/2")
          if (quantityAndUnit.includes(' ') && quantityAndUnit.includes('/')) {
            const parts = quantityAndUnit.split(' ').filter(part => part.trim() !== '');
            if (parts.length === 2 && parts[1].includes('/')) {
              return { name, quantity: `${parts[0]} ${parts[1]}`, unit: '' };
            }
          }
          
          // Handle ranges
          if (hasRange) {
            const parts = quantityAndUnit.split('-').map(p => p.trim());
            return { name, quantity: parts.join('-'), unit: '' };
          }
          
          // Special case for ingredients like "1 sheet puff pastry"
          const parts = quantityAndUnit.trim().split(' ');
          if (parts.length === 2 && /^\d+$/.test(parts[0])) {
            const quantity = parts[0];
            let unit = parts[1].toLowerCase();
            const originalUnit = parts[1]; // Save original unit format
            
            // Get normalized unit for comparison purposes
            const normalizedUnit = unitMappings[unit.toLowerCase()] || unit.toLowerCase();
            
            // Preserve plural form if it matches one of our pluralUnitMappings
            const finalUnit = pluralUnitMappings[originalUnit.toLowerCase()] || normalizedUnit;
            
            return { name, quantity, unit: finalUnit };
          }
          
          // Handle "pinch of salt" type cases
          if (quantityAndUnit.toLowerCase().includes('pinch')) {
            return { name, quantity: '', unit: 'pinch' };
          }
          if (quantityAndUnit.toLowerCase().includes('dash')) {
            return { name, quantity: '', unit: 'dash' };
          }
          if (quantityAndUnit.toLowerCase().includes('handful')) {
            return { name, quantity: '', unit: 'handful' };
          }
          if (quantityAndUnit.toLowerCase().includes('to taste')) {
            return { name, quantity: '', unit: 'to taste' };
          }
          
          return { name, quantity: quantityAndUnit, unit: '' };
        } else {
          // If no numbers, it's probably just part of the name
          name = processedLine.trim();
          // Capitalize the first letter of each word in the name
          name = name.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
          return { name, quantity: '', unit: '' };
        }
      }
    }
    
    // If no match, return the whole line as the name with proper capitalization
    const capitalizedName = processedLine.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    return { name: capitalizedName, quantity: '', unit: '' };
  };

  // Add ingredients from a recipe
  const addItemsFromRecipe = (recipeId: string, recipeName: string, ingredients: string[]) => {
    // Process each ingredient and add it to the grocery list
    ingredients.forEach(ingredient => {
      const parsedIngredient = parseIngredient(ingredient);
      
      // Skip empty ingredients (like headers)
      if (!parsedIngredient.name) {
        return;
      }
      
      const { name, quantity, unit } = parsedIngredient;
      const category = categorizeIngredient(name);
      
      // Check if this ingredient is already in the list
      const existingItemIndex = groceryItems.findIndex(
        item => item.name.toLowerCase() === name.toLowerCase() && item.recipeId === recipeId
      );
      
      if (existingItemIndex >= 0) {
        // Update existing item
        const existingItem = groceryItems[existingItemIndex];
        updateItem(existingItem.id, { quantity, unit });
      } else {
        // Add new item
        addItem({
          name,
          quantity,
          unit,
          category,
          recipeId,
          recipeName
        });
      }
    });
  };

  // Get all items associated with a specific recipe
  const getRecipeItems = (recipeId: string) => {
    return groceryItems.filter(item => item.recipeId === recipeId);
  };

  return (
    <GroceryListContext.Provider 
      value={{ 
        groceryItems, 
        addItem, 
        removeItem, 
        updateItem,
        toggleChecked,
        clearCheckedItems,
        clearAllItems,
        addItemsFromRecipe,
        getRecipeItems
      }}
    >
      {children}
    </GroceryListContext.Provider>
  );
};

// Create a custom hook to use the grocery list context
export const useGroceryList = () => useContext(GroceryListContext); 