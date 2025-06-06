import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { FavoriteRecipe, useFavorites } from '../../hooks/useFavorites';

// Define types for recipes
interface RecipeItem {
  recipe: {
    label: string;
    image: string;
    images?: {
      THUMBNAIL?: { url: string };
      SMALL?: { url: string };
      REGULAR?: { url: string };
      LARGE?: { url: string };
    };
    totalTime: number;
    calories: number;
    yield: number;
    dietLabels: string[];
    uri: string;
    source?: string;
    url?: string;
    shareAs?: string;
    mealType?: string[];
    dishType?: string[];
    ingredientLines?: string[];
  }
}

// Sample categories for recipes
const CATEGORIES: string[] = [
  'All', 'Favorites', 'Breakfast', 'Lunch', 'Dinner', 'Vegetarian', 'Dessert', 'Healthy', 'Quick'
];

export default function RecipesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { favorites } = useFavorites();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [recipes, setRecipes] = useState<RecipeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showingFavorites, setShowingFavorites] = useState(false);
  
  // Function to convert favorite recipes to the format expected by the recipe list
  const convertFavoritesToRecipes = (favorites: FavoriteRecipe[]): RecipeItem[] => {
    return favorites.map(favorite => ({
      recipe: {
        label: favorite.label,
        image: favorite.image,
        totalTime: 0, // Default values since we don't store these in favorites
        calories: 0,
        yield: 1,
        dietLabels: [],
        uri: favorite.uri
      }
    }));
  };

  const fetchRecipes = async (query = 'popular') => {
    // If showing favorites, don't fetch from API
    if (selectedCategory === 'Favorites') {
      setShowingFavorites(true);
      setLoading(false);
      setRefreshing(false);
      setError(null);
      return;
    }
    
    setShowingFavorites(false);
    
    try {
      setLoading(true);
      setError(null);
      
      // Using Edamam Recipe API v2
      const appId = '9ecce6ff';
      const appKey = '7405797fee48f9c2eadbf3a4d656c6d5';
      
      // Adjust the query based on selected category
      let searchTerm = query;
      if (selectedCategory !== 'All' && !searchQuery) {
        searchTerm = selectedCategory.toLowerCase();
      } else if (searchQuery) {
        searchTerm = searchQuery;
      }
      
      // Build the URL with proper parameters for v2 API
      const url = new URL('https://api.edamam.com/api/recipes/v2');
      url.searchParams.append('type', 'public');
      url.searchParams.append('q', searchTerm);
      url.searchParams.append('app_id', appId);
      url.searchParams.append('app_key', appKey);
      
      // Add some additional filters to improve results
      url.searchParams.append('imageSize', 'REGULAR');
      url.searchParams.append('random', 'true');
      
      // Apply category-specific filters
      if (selectedCategory === 'Vegetarian') {
        url.searchParams.append('health', 'vegetarian');
      } else if (selectedCategory === 'Breakfast') {
        url.searchParams.append('mealType', 'breakfast');
      } else if (selectedCategory === 'Lunch') {
        url.searchParams.append('mealType', 'lunch');
      } else if (selectedCategory === 'Dinner') {
        url.searchParams.append('mealType', 'dinner');
      } else if (selectedCategory === 'Healthy') {
        url.searchParams.append('diet', 'balanced');
      } else if (selectedCategory === 'Quick') {
        url.searchParams.append('time', '30');
      } else if (selectedCategory === 'Dessert') {
        url.searchParams.append('dishType', 'desserts');
      }
      
      // Add results limit
      url.searchParams.append('field', 'uri');
      url.searchParams.append('field', 'label');
      url.searchParams.append('field', 'image');
      url.searchParams.append('field', 'images');
      url.searchParams.append('field', 'source');
      url.searchParams.append('field', 'url');
      url.searchParams.append('field', 'dietLabels');
      url.searchParams.append('field', 'healthLabels');
      url.searchParams.append('field', 'cautions');
      url.searchParams.append('field', 'ingredientLines');
      url.searchParams.append('field', 'calories');
      url.searchParams.append('field', 'totalTime');
      url.searchParams.append('field', 'cuisineType');
      url.searchParams.append('field', 'mealType');
      url.searchParams.append('field', 'dishType');
      url.searchParams.append('field', 'yield');
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Failed to fetch recipes: ${response.status}`);
      }
      
      const data = await response.json();
      
      // The v2 API structure is slightly different
      if (data.hits && Array.isArray(data.hits)) {
        setRecipes(data.hits);
      } else {
        setRecipes([]);
      }
    } catch (err) {
      setError('Failed to load recipes. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRecipes();
  };

  useEffect(() => {
    fetchRecipes();
  }, [selectedCategory]);
  
  // Get the appropriate data source based on whether we're showing favorites or API results
  const getDataSource = () => {
    if (showingFavorites) {
      if (searchQuery.trim() === '') {
        return convertFavoritesToRecipes(favorites);
      } else {
        // Filter favorites by search query
        const filteredFavorites = favorites.filter(fav => 
          fav.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return convertFavoritesToRecipes(filteredFavorites);
      }
    }
    return recipes;
  };

  const handleSearch = () => {
    // If in favorites mode, just trigger a re-render with the new search query
    if (showingFavorites) {
      setRecipes([...recipes]); // Force re-render
    } else {
      fetchRecipes(searchQuery);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleCategoryPress = (category: string) => {
    setSelectedCategory(category);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderCategoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item && {
          backgroundColor: colors.tint,
          borderColor: colors.tint,
        },
      ]}
      onPress={() => handleCategoryPress(item)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item && { color: 'white' },
          { color: selectedCategory === item ? 'white' : colors.text },
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderRecipeItem = ({ item }: { item: RecipeItem }) => {
    const recipe = item.recipe;
    
    return (
      <TouchableOpacity
        style={[styles.recipeCard, { backgroundColor: colors.card }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          // Navigate to recipe detail with the recipe uri
          router.push({
            pathname: `/recipe/[id]`,
            params: { 
              id: encodeURIComponent(recipe.label.replace(/\s+/g, '-').toLowerCase()),
              uri: encodeURIComponent(recipe.uri)
            }
          });
        }}
      >
        <View style={styles.imageContainer}>
          <ExpoImage
            source={{ uri: recipe.image }}
            style={styles.recipeImage}
            contentFit="cover"
            transition={200}
            placeholder={{ blurhash: 'L9Cdc4}]~W%LtRozaeWV4nxaoJR*' }}
          />
          <View style={styles.timeContainer}>
            <BlurView intensity={80} tint={colorScheme === 'dark' ? 'dark' : 'light'} style={styles.timeBlur}>
              <Ionicons name="time-outline" size={14} color={colors.icon} />
              <Text style={[styles.timeText, { color: colors.text }]}>
                {Math.round(recipe.totalTime || 30)} min
              </Text>
            </BlurView>
          </View>
        </View>
        
        <View style={styles.recipeInfo}>
          <Text style={[styles.recipeTitle, { color: colors.text }]} numberOfLines={1}>
            {recipe.label}
          </Text>
          
          <View style={styles.recipeMetaInfo}>
            <View style={styles.recipeDetail}>
              <Ionicons name="flame-outline" size={16} color={colors.accent} />
              <Text style={[styles.detailText, { color: colors.icon }]}>
                {Math.round(recipe.calories / (recipe.yield || 1))} cal/serving
              </Text>
            </View>
            
            <View style={styles.recipeDetail}>
              <Ionicons name="restaurant-outline" size={16} color={colors.accent} />
              <Text style={[styles.detailText, { color: colors.icon }]}>
                {recipe.yield || 1} servings
              </Text>
            </View>
          </View>
          
          <View style={styles.tagsContainer}>
            {(recipe.dietLabels || []).slice(0, 2).map((label: string, index: number) => (
              <View 
                key={index} 
                style={[styles.tagItem, { backgroundColor: colors.lighterAccent + '20' }]}
              >
                <Text style={[styles.tagText, { color: colors.accent }]}>
                  {label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      {error ? (
        <>
          <Ionicons name="alert-circle-outline" size={48} color={colors.notification} />
          <Text style={[styles.emptyText, { color: colors.text }]}>{error}</Text>
        </>
      ) : !loading ? (
        <>
          <Ionicons name="restaurant-outline" size={48} color={colors.icon} />
          <Text style={[styles.emptyText, { color: colors.text }]}>No recipes found</Text>
          <Text style={[styles.emptySubText, { color: colors.icon }]}>
            Try changing your search or category
          </Text>
        </>
      ) : null}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Recipes</Text>
        <Text style={[styles.subtitle, { color: colors.icon }]}>
          {showingFavorites ? 'Your favorite recipes' : 'Find your next culinary inspiration'}
        </Text>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <Ionicons name="search" size={20} color={colors.icon} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={showingFavorites ? "Search favorites..." : "Search recipes..."}
          placeholderTextColor={colors.icon}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton} 
            onPress={() => {
              setSearchQuery('');
              fetchRecipes();
            }}
          >
            <Ionicons name="close-circle" size={20} color={colors.icon} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          data={CATEGORIES}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesList}
          contentContainerStyle={styles.categoriesContent}
        />
      </View>

      <FlatList
        data={getDataSource()}
        renderItem={renderRecipeItem}
        keyExtractor={(item, index) => `recipe-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.recipeListContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tint}
            colors={[colors.tint]}
          />
        }
        ListEmptyComponent={renderEmptyList}
        ListFooterComponent={
          loading && !refreshing ? (
            <ActivityIndicator 
              size="large" 
              color={colors.tint} 
              style={styles.loader} 
            />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 15,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  clearButton: {
    padding: 5,
  },
  categoriesContainer: {
    height: 50,
    marginBottom: 10,
  },
  categoriesList: {
    flexGrow: 0,
  },
  categoriesContent: {
    paddingHorizontal: 15,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  recipeListContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  recipeCard: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  timeContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  timeBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    overflow: 'hidden',
  },
  timeText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: '500',
  },
  recipeInfo: {
    padding: 15,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  recipeMetaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  recipeDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 5,
    fontSize: 13,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagItem: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginTop: 5,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
  },
  emptySubText: {
    fontSize: 14,
    marginTop: 8,
  },
  loader: {
    paddingVertical: 20,
  },
}); 