import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Define the type for a favorite recipe
export interface FavoriteRecipe {
  id: string;
  uri: string;
  label: string;
  image: string;
}

interface FavoritesContextType {
  favorites: FavoriteRecipe[];
  addFavorite: (recipe: FavoriteRecipe) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

// Create a context for favorites
const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  addFavorite: () => {},
  removeFavorite: () => {},
  isFavorite: () => false,
});

// Create a provider component
export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([]);

  // Load favorites from storage when the component mounts
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const savedFavorites = await AsyncStorage.getItem('favorites');
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    };

    loadFavorites();
  }, []);

  // Save favorites to storage whenever they change
  useEffect(() => {
    const saveFavorites = async () => {
      try {
        await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
      } catch (error) {
        console.error('Error saving favorites:', error);
      }
    };

    saveFavorites();
  }, [favorites]);

  // Add a recipe to favorites
  const addFavorite = (recipe: FavoriteRecipe) => {
    setFavorites((prev) => [...prev, recipe]);
  };

  // Remove a recipe from favorites
  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((recipe) => recipe.id !== id));
  };

  // Check if a recipe is in favorites
  const isFavorite = (id: string) => {
    return favorites.some((recipe) => recipe.id === id);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

// Create a custom hook to use the favorites context
export const useFavorites = () => useContext(FavoritesContext); 