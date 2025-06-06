import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ImageBackground,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { useFavorites } from '../../hooks/useFavorites';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;

// Define recipe interface
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

// Dummy user data
const user = {
  firstName: 'John',
  profileImage: 'https://randomuser.me/api/portraits/men/32.jpg'
};

const categories = [
  { id: '1', name: 'All', icon: 'apps' },
  { id: '2', name: 'Breakfast', icon: 'sunny' },
  { id: '3', name: 'Lunch', icon: 'restaurant' },
  { id: '4', name: 'Dinner', icon: 'moon' },
  { id: '5', name: 'Desserts', icon: 'ice-cream' },
];

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { favorites } = useFavorites();
  
  const [activeCategory, setActiveCategory] = useState('1');
  const [featuredRecipes, setFeaturedRecipes] = useState<RecipeItem[]>([]);
  const [quickRecipes, setQuickRecipes] = useState<RecipeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch recipes based on criteria
  const fetchRecipes = async (query: string, limit: number, setRecipeState: React.Dispatch<React.SetStateAction<RecipeItem[]>>) => {
    try {
      // Using Edamam Recipe API v2
      const appId = '9ecce6ff';
      const appKey = '7405797fee48f9c2eadbf3a4d656c6d5';
      
      // Build the URL with proper parameters for v2 API
      const url = new URL('https://api.edamam.com/api/recipes/v2');
      url.searchParams.append('type', 'public');
      url.searchParams.append('q', query);
      url.searchParams.append('app_id', appId);
      url.searchParams.append('app_key', appKey);
      
      // Add some additional filters to improve results
      url.searchParams.append('imageSize', 'REGULAR');
      url.searchParams.append('random', 'true');
      
      // Add results limit
      url.searchParams.append('field', 'uri');
      url.searchParams.append('field', 'label');
      url.searchParams.append('field', 'image');
      url.searchParams.append('field', 'images');
      url.searchParams.append('field', 'source');
      url.searchParams.append('field', 'url');
      url.searchParams.append('field', 'dietLabels');
      url.searchParams.append('field', 'calories');
      url.searchParams.append('field', 'totalTime');
      url.searchParams.append('field', 'yield');
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Failed to fetch recipes: ${response.status}`);
      }
      
      const data = await response.json();
      
      // The v2 API structure is slightly different
      if (data.hits && Array.isArray(data.hits)) {
        setRecipeState(data.hits.slice(0, limit));
      } else {
        setRecipeState([]);
      }
    } catch (err) {
      setError('Failed to load recipes. Please try again.');
      console.error(err);
    }
  };

  // Load recipes on component mount
  useEffect(() => {
    const loadRecipes = async () => {
      setLoading(true);
      
      // Fetch featured recipes - popular main dishes
      await fetchRecipes('main dish popular', 3, setFeaturedRecipes);
      
      // Fetch quick recipes - quick and easy
      await fetchRecipes('quick easy', 3, setQuickRecipes);
      
      setLoading(false);
    };
    
    loadRecipes();
  }, []);

  // Function to navigate to recipe detail
  const navigateToRecipe = (recipeUri: string) => {
    // Extract the recipe ID from the URI
    // URIs are in the format: http://www.edamam.com/ontologies/edamam.owl#recipe_XXXXXXXXXXXXXXXXXXXXXXXX
    const idMatch = recipeUri.match(/recipe_([a-zA-Z0-9]+)/);
    const recipeId = idMatch ? idMatch[1] : '';
    
    if (!recipeId) {
      console.error('Could not extract recipe ID from URI:', recipeUri);
      return;
    }
    
    // Navigate to the recipe detail page with both id and uri parameters
    router.push({
      pathname: "/recipe/[id]",
      params: { 
        id: recipeId,
        uri: recipeUri 
      }
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.welcomeText, { color: colors.text }]}>
            Hello, <Text style={[styles.nameText, { color: colors.tint }]}>{user.firstName}</Text>
          </Text>
          <Text style={[styles.subtitleText, { color: colors.text }]}>
            What would you like to cook today?
          </Text>
        </View>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: user.profileImage }}
            style={styles.avatar}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading recipes...
          </Text>
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Food Scan Promo */}
          <TouchableOpacity 
            style={[styles.scanPromo, { backgroundColor: colors.card }]} 
            activeOpacity={0.9}
            onPress={() => router.push('/(tabs)/camera')}
          >
            <View style={styles.scanPromoContent}>
              <View style={styles.scanPromoText}>
                <Text style={[styles.scanPromoTitle, { color: colors.text }]}>
                  Scan Your Ingredients
                </Text>
                <Text style={[styles.scanPromoDescription, { color: colors.icon }]}>
                  Take a photo of your ingredients and let us suggest recipes
                </Text>
                <TouchableOpacity 
                  style={[styles.scanButton, { backgroundColor: colors.tint }]}
                  activeOpacity={0.8}
                  onPress={() => router.push('/(tabs)/camera')}
                >
                  <Text style={styles.scanButtonText}>Scan Now</Text>
                  <Ionicons name="camera" size={18} color="white" style={styles.scanButtonIcon} />
                </TouchableOpacity>
              </View>
              <View style={styles.scanPromoImageContainer}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80' }}
                  style={styles.scanPromoImage}
                />
                <LinearGradient
                  colors={[
                    'transparent',
                    colorScheme === 'dark' ? 'rgba(45, 55, 72, 0.9)' : 'rgba(247, 250, 252, 0.9)',
                    colorScheme === 'dark' ? colors.card : colors.card,
                  ]}
                  start={{ x: 0.7, y: 0 }}
                  end={{ x: 0, y: 0 }}
                  style={styles.scanPromoGradient}
                />
              </View>
            </View>
          </TouchableOpacity>

          {/* Categories */}
          <View style={styles.categoriesContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>
            <View style={styles.scrollContainer}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesScrollContent}
              >
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryItem,
                      { backgroundColor: activeCategory === category.id ? colors.tint : colors.card },
                    ]}
                    onPress={() => setActiveCategory(category.id)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={category.icon as keyof typeof Ionicons.glyphMap}
                      size={20}
                      color={activeCategory === category.id ? 'white' : colors.tabIconDefault}
                      style={styles.categoryIcon}
                    />
                    <Text
                      style={[
                        styles.categoryText,
                        { color: activeCategory === category.id ? 'white' : colors.text },
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {/* Right fade */}
              <LinearGradient
                colors={[
                  'transparent', 
                  colorScheme === 'dark' ? 'rgba(26, 32, 44, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                  colorScheme === 'dark' ? 'rgba(26, 32, 44, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                  colorScheme === 'dark' ? colors.background : 'white',
                ]}
                start={{ x: 0.8, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.rightGradient}
              />
              {/* Left fade */}
              <LinearGradient
                colors={[
                  colorScheme === 'dark' ? colors.background : 'white',
                  colorScheme === 'dark' ? 'rgba(26, 32, 44, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                  colorScheme === 'dark' ? 'rgba(26, 32, 44, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                  'transparent', 
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.2, y: 0 }}
                style={styles.leftGradient}
              />
            </View>
          </View>

          {/* Featured Recipes */}
          <View style={styles.featuredContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Recipes</Text>
              <TouchableOpacity 
                style={styles.seeAllButton}
                onPress={() => router.push('/(tabs)/recipes')}
              >
                <Text style={[styles.seeAllText, { color: colors.tint }]}>See All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.scrollContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_WIDTH + 15}
                decelerationRate="fast"
                contentContainerStyle={styles.featuredScrollContent}
              >
                {featuredRecipes.map((item) => (
                  <TouchableOpacity
                    key={item.recipe.uri}
                    style={styles.featuredCard}
                    activeOpacity={0.9}
                    onPress={() => navigateToRecipe(item.recipe.uri)}
                  >
                    <ImageBackground
                      source={{ uri: item.recipe.image }}
                      style={styles.featuredImage}
                      imageStyle={{ borderRadius: 16 }}
                      defaultSource={require('../../assets/images/placeholder-food.png')}
                    >
                      <View style={styles.featuredOverlay} />
                      <View style={styles.featuredCardContent}>
                        <BlurView intensity={90} tint={colorScheme === 'dark' ? 'dark' : 'dark'} style={styles.featuredCardBlur}>
                          <Text 
                            style={styles.featuredCardTitle}
                            numberOfLines={2}
                            ellipsizeMode="tail"
                          >
                            {item.recipe.label}
                          </Text>
                          <View style={styles.featuredCardDetails}>
                            <View style={styles.featuredCardDetail}>
                              <Ionicons name="time-outline" size={16} color="white" />
                              <Text style={styles.featuredCardDetailText}>
                                {item.recipe.totalTime > 0 ? `${item.recipe.totalTime} min` : 'N/A'}
                              </Text>
                            </View>
                            <View style={styles.featuredCardDetail}>
                              <Ionicons name="flame-outline" size={16} color="white" />
                              <Text style={styles.featuredCardDetailText}>
                                {Math.round(item.recipe.calories / item.recipe.yield)} cal
                              </Text>
                            </View>
                            {item.recipe.dietLabels && item.recipe.dietLabels.length > 0 && (
                              <View style={styles.featuredCardDetail}>
                                <Ionicons name="nutrition-outline" size={16} color="white" />
                                <Text style={styles.featuredCardDetailText}>
                                  {item.recipe.dietLabels[0]}
                                </Text>
                              </View>
                            )}
                          </View>
                        </BlurView>
                      </View>
                    </ImageBackground>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {/* Right fade */}
              <LinearGradient
                colors={[
                  'transparent', 
                  colorScheme === 'dark' ? 'rgba(26, 32, 44, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                  colorScheme === 'dark' ? 'rgba(26, 32, 44, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                  colorScheme === 'dark' ? colors.background : 'white',
                ]}
                start={{ x: 0.8, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.rightGradient}
              />
              {/* Left fade */}
              <LinearGradient
                colors={[
                  colorScheme === 'dark' ? colors.background : 'white',
                  colorScheme === 'dark' ? 'rgba(26, 32, 44, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                  colorScheme === 'dark' ? 'rgba(26, 32, 44, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                  'transparent', 
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0.2, y: 0 }}
                style={styles.leftGradient}
              />
            </View>
          </View>

          {/* Quick Recipes */}
          <View style={styles.quickRecipesContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick & Easy</Text>
              <TouchableOpacity 
                style={styles.seeAllButton}
                onPress={() => router.push('/(tabs)/recipes')}
              >
                <Text style={[styles.seeAllText, { color: colors.tint }]}>See All</Text>
              </TouchableOpacity>
            </View>
            {quickRecipes.map((item) => (
              <TouchableOpacity 
                key={item.recipe.uri}
                style={[styles.quickRecipeCard, { backgroundColor: colors.card }]}
                activeOpacity={0.8}
                onPress={() => navigateToRecipe(item.recipe.uri)}
              >
                <View style={styles.quickRecipeImageWrapper}>
                  <Image 
                    source={{ uri: item.recipe.image }} 
                    style={styles.quickRecipeImage}
                  />
                  <LinearGradient
                    colors={[
                      'transparent',
                      colorScheme === 'dark' ? 'rgba(45, 55, 72, 0.9)' : 'rgba(247, 250, 252, 0.9)',
                      colorScheme === 'dark' ? colors.card : colors.card,
                    ]}
                    start={{ x: 0.6, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.quickRecipeGradient}
                  />
                </View>
                <View style={styles.quickRecipeContent}>
                  <Text 
                    style={[styles.quickRecipeTitle, { color: colors.text }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.recipe.label}
                  </Text>
                  <View style={styles.quickRecipeDetails}>
                    <View style={styles.quickRecipeDetail}>
                      <Ionicons name="time-outline" size={14} color={colors.icon} />
                      <Text style={[styles.quickRecipeDetailText, { color: colors.icon }]}>
                        {item.recipe.totalTime > 0 ? `${item.recipe.totalTime} min` : 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.quickRecipeDetail}>
                      <Ionicons name="flame-outline" size={14} color={colors.icon} />
                      <Text style={[styles.quickRecipeDetailText, { color: colors.icon }]}>
                        {Math.round(item.recipe.calories / item.recipe.yield)} cal
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity style={styles.quickRecipeButton} onPress={() => navigateToRecipe(item.recipe.uri)}>
                  <Ionicons name="chevron-forward" size={24} color={colors.tint} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>

          {/* My Favorites Section */}
          {favorites.length > 0 && (
            <View style={styles.quickRecipesContainer}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>My Favorites</Text>
                <TouchableOpacity 
                  style={styles.seeAllButton}
                  onPress={() => router.push('/(tabs)/recipes')}
                >
                  <Text style={[styles.seeAllText, { color: colors.tint }]}>See All</Text>
                </TouchableOpacity>
              </View>
              {favorites.slice(0, 3).map((favorite) => (
                <TouchableOpacity 
                  key={favorite.id}
                  style={[styles.quickRecipeCard, { backgroundColor: colors.card }]}
                  activeOpacity={0.8}
                  onPress={() => router.push({
                    pathname: "/recipe/[id]",
                    params: { 
                      id: favorite.id,
                      uri: favorite.uri 
                    }
                  })}
                >
                  <View style={styles.quickRecipeImageWrapper}>
                    <Image 
                      source={{ uri: favorite.image }} 
                      style={styles.quickRecipeImage}
                      defaultSource={require('../../assets/images/placeholder-food.png')}
                    />
                    <LinearGradient
                      colors={[
                        'transparent',
                        colorScheme === 'dark' ? 'rgba(45, 55, 72, 0.9)' : 'rgba(247, 250, 252, 0.9)',
                        colorScheme === 'dark' ? colors.card : colors.card,
                      ]}
                      start={{ x: 0.6, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.quickRecipeGradient}
                    />
                  </View>
                  <View style={styles.quickRecipeContent}>
                    <Text 
                      style={[styles.quickRecipeTitle, { color: colors.text }]}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {favorite.label}
                    </Text>
                    <View style={styles.quickRecipeDetails}>
                      <View style={styles.favoriteIconContainer}>
                        <Ionicons name="heart" size={16} color={colors.tint} />
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.quickRecipeButton} onPress={() => router.push({
                    pathname: "/recipe/[id]",
                    params: { 
                      id: favorite.id,
                      uri: favorite.uri 
                    }
                  })}>
                    <Ionicons name="chevron-forward" size={24} color={colors.tint} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTextContainer: {
    flex: 1,
    paddingRight: 15,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
  },
  nameText: {
    fontWeight: 'bold',
  },
  subtitleText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  scrollContainer: {
    position: 'relative',
  },
  rightGradient: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 40,
    zIndex: 1,
  },
  leftGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 40,
    zIndex: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllButton: {
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scanPromo: {
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  scanPromoContent: {
    flexDirection: 'row',
    position: 'relative',
    minHeight: 160,
  },
  scanPromoText: {
    width: '67%',
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingRight: 10,
    zIndex: 2,
  },
  scanPromoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  scanPromoDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  scanButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginRight: 6,
  },
  scanButtonIcon: {
    marginTop: 1,
  },
  scanPromoImageContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '45%',
  },
  scanPromoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  scanPromoGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  categoriesContainer: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  categoriesScrollContent: {
    paddingRight: 20,
    paddingLeft: 5,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginHorizontal: 6,
    borderRadius: 20,
    marginBottom: 5,
  },
  categoryIcon: {
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  featuredContainer: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  featuredScrollContent: {
    paddingRight: 20,
    paddingLeft: 5,
  },
  featuredCard: {
    width: CARD_WIDTH,
    height: 200,
    marginHorizontal: 8,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  featuredCardContent: {
    margin: 12,
  },
  featuredCardBlur: {
    borderRadius: 12,
    overflow: 'hidden',
    padding: 12,
  },
  featuredCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  featuredCardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredCardDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  featuredCardDetailText: {
    fontSize: 12,
    color: 'white',
    marginLeft: 4,
  },
  quickRecipesContainer: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  quickRecipeCard: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickRecipeImageWrapper: {
    width: 100,
    height: 80,
    position: 'relative',
  },
  quickRecipeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  quickRecipeGradient: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 30,
  },
  quickRecipeContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    height: 80,
    overflow: 'hidden',
  },
  quickRecipeTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
    flexShrink: 1,
    height: 40,
  },
  quickRecipeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickRecipeDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  quickRecipeDetailText: {
    fontSize: 12,
    marginLeft: 4,
  },
  quickRecipeButton: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}); 