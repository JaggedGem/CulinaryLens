import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SuccessModal } from '../../components/modals';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { useFavorites } from '../../hooks/useFavorites';
import { useGroceryList } from '../../hooks/useGroceryList';

interface RecipeDetail {
  label: string;
  image: string;
  images?: {
    THUMBNAIL?: { url: string };
    SMALL?: { url: string };
    REGULAR?: { url: string };
    LARGE?: { url: string };
  };
  source: string;
  url: string;
  yield: number;
  dietLabels: string[];
  healthLabels: string[];
  cautions: string[];
  ingredientLines: string[];
  ingredients?: {
    text: string;
    quantity: number;
    measure: string;
    food: string;
    weight: number;
    foodId: string;
  }[];
  calories: number;
  totalTime: number;
  cuisineType: string[];
  mealType: string[];
  dishType: string[];
  totalNutrients: {
    [key: string]: {
      label: string;
      quantity: number;
      unit: string;
    };
  };
}

export default function RecipeDetailScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id, uri } = useLocalSearchParams();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { addItemsFromRecipe, getRecipeItems } = useGroceryList();
  
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addedToGroceries, setAddedToGroceries] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Check if this recipe is a favorite
  const recipeIsFavorite = id ? isFavorite(id as string) : false;

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Using Edamam Recipe API v2
        const appId = '9ecce6ff';
        const appKey = '7405797fee48f9c2eadbf3a4d656c6d5';

        // In v2, we should use the recipe ID directly
        if (!uri) {
          throw new Error('Recipe URI is required');
        }

        // For v2 API, we need to use the proper endpoint for recipe lookup
        const decodedUri = decodeURIComponent(uri as string);
        
        // Build the URL with proper parameters for v2 API
        const url = new URL('https://api.edamam.com/api/recipes/v2/by-uri');
        url.searchParams.append('type', 'public');
        url.searchParams.append('uri', decodedUri);
        url.searchParams.append('app_id', appId);
        url.searchParams.append('app_key', appKey);
        
        // Request all needed fields
        url.searchParams.append('field', 'uri');
        url.searchParams.append('field', 'label');
        url.searchParams.append('field', 'image');
        url.searchParams.append('field', 'images');
        url.searchParams.append('field', 'source');
        url.searchParams.append('field', 'url');
        url.searchParams.append('field', 'yield');
        url.searchParams.append('field', 'dietLabels');
        url.searchParams.append('field', 'healthLabels');
        url.searchParams.append('field', 'cautions');
        url.searchParams.append('field', 'ingredientLines');
        url.searchParams.append('field', 'ingredients');
        url.searchParams.append('field', 'calories');
        url.searchParams.append('field', 'totalTime');
        url.searchParams.append('field', 'cuisineType');
        url.searchParams.append('field', 'mealType');
        url.searchParams.append('field', 'dishType');
        url.searchParams.append('field', 'totalNutrients');
        url.searchParams.append('field', 'totalDaily');
        
        const response = await fetch(url.toString());
        
        if (!response.ok) {
          throw new Error(`Failed to fetch recipe details: ${response.status}`);
        }
        
        const data = await response.json();
        
        // The v2 API structure is slightly different
        if (data.hits && data.hits.length > 0) {
          setRecipe(data.hits[0].recipe);
        } else if (data.recipe) {
          setRecipe(data.recipe);
        } else {
          setError('Recipe not found');
        }
      } catch (err) {
        setError('Failed to load recipe details. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (uri) {
      fetchRecipeDetails();
    } else {
      setError('Recipe ID not provided');
      setLoading(false);
    }
  }, [uri]);

  useEffect(() => {
    // Check if this recipe's ingredients are in the grocery list
    if (id && recipe) {
      const recipeItems = getRecipeItems(id as string);
      setAddedToGroceries(recipeItems.length > 0);
    }
  }, [id, recipe, getRecipeItems]);

  const handleGoBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const openRecipeSource = () => {
    if (recipe?.url) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Linking.openURL(recipe.url);
    }
  };

  const toggleFavorite = () => {
    if (!recipe || !id) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (recipeIsFavorite) {
      removeFavorite(id as string);
    } else {
      addFavorite({
        id: id as string,
        uri: uri as string,
        label: recipe.label,
        image: recipe.image
      });
    }
  };

  const handleAddToGroceryList = () => {
    if (!recipe || !id) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (recipe.ingredientLines && recipe.ingredientLines.length > 0) {
      addItemsFromRecipe(
        id as string,
        recipe.label,
        recipe.ingredientLines
      );
      setAddedToGroceries(true);
      setShowSuccessModal(true);
    }
  };

  const renderNutritionItem = (key: string, value: number | undefined, unit: string | undefined, label: string) => {
    if (value === undefined) return null;
    
    return (
      <View key={key} style={styles.nutritionItem}>
        <Text style={[styles.nutritionValue, { color: colors.accent }]}>
          {Math.round(value)}{unit || ''}
        </Text>
        <Text style={[styles.nutritionLabel, { color: colors.text }]}>{label}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.tint} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading recipe...</Text>
      </View>
    );
  }

  if (error || !recipe) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.notification} />
        <Text style={[styles.errorTitle, { color: colors.text }]}>Error</Text>
        <Text style={[styles.errorText, { color: colors.icon }]}>{error || 'Failed to load recipe'}</Text>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: colors.tint }]}
          onPress={handleGoBack}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <ExpoImage
            source={{ uri: recipe.image }}
            style={styles.heroImage}
            contentFit="cover"
            transition={500}
          />
          
          {/* Gradient overlay at the top */}
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'transparent']}
            style={[styles.gradient, { height: insets.top + 60 }]}
          />
          
          <TouchableOpacity 
            style={[styles.backIconButton, { 
              top: insets.top + 10 
            }]}
            onPress={handleGoBack}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={[styles.headerActions, {
            top: insets.top + 10
          }]}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={toggleFavorite}
            >
              <Ionicons 
                name={recipeIsFavorite ? "heart" : "heart-outline"} 
                size={24} 
                color={recipeIsFavorite ? colors.notification : "white"} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleAddToGroceryList}
            >
              <Ionicons 
                name={addedToGroceries ? "cart" : "cart-outline"} 
                size={24} 
                color={addedToGroceries ? colors.tint : "white"} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Recipe Content */}
        <View style={styles.contentContainer}>
          {/* Title and meta info */}
          <Text style={[styles.recipeTitle, { color: colors.text }]}>{recipe.label}</Text>
          
          <View style={styles.metaRow}>
            {recipe.mealType && recipe.mealType.length > 0 && (
              <View style={styles.metaItem}>
                <Ionicons name="restaurant-outline" size={18} color={colors.accent} />
                <Text style={[styles.metaText, { color: colors.icon }]}>
                  {recipe.mealType[0].charAt(0).toUpperCase() + recipe.mealType[0].slice(1)}
                </Text>
              </View>
            )}
            
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={18} color={colors.accent} />
              <Text style={[styles.metaText, { color: colors.icon }]}>
                {recipe.totalTime ? `${recipe.totalTime} min` : 'N/A'}
              </Text>
            </View>
            
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={18} color={colors.accent} />
              <Text style={[styles.metaText, { color: colors.icon }]}>
                {recipe.yield} servings
              </Text>
            </View>
          </View>

          {/* Diet and Health Labels */}
          {((recipe.dietLabels && recipe.dietLabels.length > 0) || (recipe.healthLabels && recipe.healthLabels.length > 0)) && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Dietary</Text>
              <View style={styles.tagsContainer}>
                {(recipe.dietLabels || []).map((label, index) => (
                  <View 
                    key={`diet-${index}`} 
                    style={[styles.tagItem, { backgroundColor: colors.lighterAccent + '20' }]}
                  >
                    <Text style={[styles.tagText, { color: colors.accent }]}>{label}</Text>
                  </View>
                ))}
                
                {(recipe.healthLabels || []).slice(0, 6).map((label, index) => (
                  <View 
                    key={`health-${index}`} 
                    style={[styles.tagItem, { backgroundColor: colors.card }]}
                  >
                    <Text style={[styles.tagText, { color: colors.icon }]}>{label}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Ingredients */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Ingredients</Text>
          <View style={[styles.ingredientsContainer, { backgroundColor: colors.card }]}>
            {(recipe.ingredientLines || []).map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <View style={[styles.bulletPoint, { backgroundColor: colors.accent }]} />
                <Text style={[styles.ingredientText, { color: colors.text }]}>{ingredient}</Text>
              </View>
            ))}
          </View>

          {/* Nutrition */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Nutrition</Text>
          <View style={[styles.nutritionContainer, { backgroundColor: colors.card }]}>
            <View style={styles.caloriesContainer}>
              <Text style={[styles.caloriesValue, { color: colors.text }]}>
                {Math.round(recipe.calories / (recipe.yield || 1))}
              </Text>
              <Text style={[styles.caloriesLabel, { color: colors.icon }]}>
                calories / serving
              </Text>
            </View>
            
            <View style={styles.nutritionGrid}>
              {recipe.totalNutrients && recipe.totalNutrients.PROCNT && renderNutritionItem(
                'protein',
                recipe.totalNutrients.PROCNT.quantity / (recipe.yield || 1),
                recipe.totalNutrients.PROCNT.unit,
                'Protein'
              )}
              {recipe.totalNutrients && recipe.totalNutrients.FAT && renderNutritionItem(
                'fat',
                recipe.totalNutrients.FAT.quantity / (recipe.yield || 1),
                recipe.totalNutrients.FAT.unit,
                'Fat'
              )}
              {recipe.totalNutrients && recipe.totalNutrients.CHOCDF && renderNutritionItem(
                'carbs',
                recipe.totalNutrients.CHOCDF.quantity / (recipe.yield || 1),
                recipe.totalNutrients.CHOCDF.unit,
                'Carbs'
              )}
              {recipe.totalNutrients && recipe.totalNutrients.FIBTG && renderNutritionItem(
                'fiber',
                recipe.totalNutrients.FIBTG.quantity / (recipe.yield || 1),
                recipe.totalNutrients.FIBTG.unit,
                'Fiber'
              )}
            </View>
          </View>

          {/* Source */}
          <View style={styles.sourceContainer}>
            <Text style={[styles.sourceText, { color: colors.icon }]}>
              Recipe from: {recipe.source}
            </Text>
            <TouchableOpacity 
              style={[styles.viewSourceButton, { backgroundColor: colors.tint }]}
              onPress={openRecipeSource}
            >
              <Text style={styles.viewSourceText}>View Original</Text>
            </TouchableOpacity>
          </View>
          
          {/* Add to Grocery List Button */}
          <TouchableOpacity
            style={[styles.addToGroceryButton, { backgroundColor: addedToGroceries ? colors.success : colors.tint }]}
            onPress={handleAddToGroceryList}
          >
            <Ionicons 
              name={addedToGroceries ? "cart" : "cart-outline"} 
              size={24} 
              color="white" 
              style={styles.addToGroceryIcon}
            />
            <Text style={styles.addToGroceryText}>
              {addedToGroceries ? 'Added to Grocery List' : 'Add to Grocery List'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <SuccessModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Added to Grocery List"
        message={recipe ? `${recipe.ingredientLines?.length} ingredients from "${recipe.label}" have been added to your grocery list.` : ''}
        icon="cart"
        buttonText="View Grocery List"
        autoClose={false}
        onButtonPress={() => router.navigate('/(tabs)/groceries')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
    paddingTop: 0,
  },
  imageContainer: {
    width: '100%',
    height: 350,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 5,
  },
  backIconButton: {
    position: 'absolute',
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  contentContainer: {
    padding: 20,
  },
  recipeTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  metaText: {
    marginLeft: 5,
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tagItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  ingredientsContainer: {
    borderRadius: 12,
    padding: 15,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 10,
  },
  ingredientText: {
    fontSize: 16,
    flex: 1,
  },
  nutritionContainer: {
    borderRadius: 12,
    padding: 15,
  },
  caloriesContainer: {
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  caloriesValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  caloriesLabel: {
    fontSize: 14,
    marginTop: 5,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  nutritionItem: {
    alignItems: 'center',
    width: '25%',
    marginBottom: 10,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  nutritionLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  sourceContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  sourceText: {
    fontSize: 14,
    marginBottom: 10,
  },
  viewSourceButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  viewSourceText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  headerActions: {
    flexDirection: 'row',
    position: 'absolute',
    top: 10,
    right: 15,
    zIndex: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  addToGroceryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 10,
  },
  addToGroceryIcon: {
    marginRight: 8,
  },
  addToGroceryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 