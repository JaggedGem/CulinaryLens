import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
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

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;

// Dummy user data
const user = {
  firstName: 'John',
  profileImage: 'https://randomuser.me/api/portraits/men/32.jpg'
};

// Dummy data
const featuredRecipes = [
  {
    id: '1',
    name: 'Creamy Garlic Pasta',
    image: 'https://images.unsplash.com/photo-1555072956-7758afb20e8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
    time: '25 min',
    calories: '450 cal',
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Avocado Salmon Bowl',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1160&q=80',
    time: '20 min',
    calories: '380 cal',
    rating: 4.6,
  },
  {
    id: '3',
    name: 'Mediterranean Salad',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
    time: '15 min',
    calories: '280 cal',
    rating: 4.5,
  },
];

const quickRecipes = [
  {
    id: '4',
    name: 'Greek Yogurt with Berries',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
    time: '5 min',
    calories: '180 cal',
  },
  {
    id: '5',
    name: 'Avocado Toast',
    image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1172&q=80',
    time: '10 min',
    calories: '250 cal',
  },
  {
    id: '6',
    name: 'Hummus & Veggie Wrap',
    image: 'https://images.unsplash.com/photo-1600850056064-a8b380df8395?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
    time: '12 min',
    calories: '320 cal',
  },
];

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
  const [activeCategory, setActiveCategory] = useState('1');

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

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Food Scan Promo */}
        <TouchableOpacity 
          style={[styles.scanPromo, { backgroundColor: colors.card }]} 
          activeOpacity={0.9}
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Recipes</Text>
          <View style={styles.scrollContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_WIDTH + 15}
              decelerationRate="fast"
              contentContainerStyle={styles.featuredScrollContent}
            >
              {featuredRecipes.map((recipe) => (
                <TouchableOpacity
                  key={recipe.id}
                  style={styles.featuredCard}
                  activeOpacity={0.9}
                >
                  <ImageBackground
                    source={{ uri: recipe.image }}
                    style={styles.featuredImage}
                    imageStyle={{ borderRadius: 16 }}
                  >
                    <View style={styles.featuredOverlay} />
                    <View style={styles.featuredCardContent}>
                      <BlurView intensity={90} tint={colorScheme === 'dark' ? 'dark' : 'dark'} style={styles.featuredCardBlur}>
                        <Text style={styles.featuredCardTitle}>{recipe.name}</Text>
                        <View style={styles.featuredCardDetails}>
                          <View style={styles.featuredCardDetail}>
                            <Ionicons name="time-outline" size={16} color="white" />
                            <Text style={styles.featuredCardDetailText}>{recipe.time}</Text>
                          </View>
                          <View style={styles.featuredCardDetail}>
                            <Ionicons name="flame-outline" size={16} color="white" />
                            <Text style={styles.featuredCardDetailText}>{recipe.calories}</Text>
                          </View>
                          <View style={styles.featuredCardDetail}>
                            <Ionicons name="star" size={16} color="white" />
                            <Text style={styles.featuredCardDetailText}>{recipe.rating}</Text>
                          </View>
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick & Easy</Text>
          {quickRecipes.map((recipe) => (
            <TouchableOpacity 
              key={recipe.id}
              style={[styles.quickRecipeCard, { backgroundColor: colors.card }]}
              activeOpacity={0.8}
            >
              <View style={styles.quickRecipeImageWrapper}>
                <Image source={{ uri: recipe.image }} style={styles.quickRecipeImage} />
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
                <Text style={[styles.quickRecipeTitle, { color: colors.text }]}>{recipe.name}</Text>
                <View style={styles.quickRecipeDetails}>
                  <View style={styles.quickRecipeDetail}>
                    <Ionicons name="time-outline" size={14} color={colors.icon} />
                    <Text style={[styles.quickRecipeDetailText, { color: colors.icon }]}>{recipe.time}</Text>
                  </View>
                  <View style={styles.quickRecipeDetail}>
                    <Ionicons name="flame-outline" size={14} color={colors.icon} />
                    <Text style={[styles.quickRecipeDetailText, { color: colors.icon }]}>{recipe.calories}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={styles.quickRecipeButton}>
                <Ionicons name="chevron-forward" size={24} color={colors.tint} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
    marginLeft: 4,
  },
  scanPromoImageContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '40%',
  },
  scanPromoImage: {
    width: '100%',
    height: '100%',
  },
  scanPromoGradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  categoriesContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  categoriesScrollContent: {
    paddingRight: 20,
    paddingLeft: 5,
  },
  categoryItem: {
    marginRight: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryText: {
    fontWeight: '600',
  },
  featuredContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  featuredScrollContent: {
    paddingRight: 20,
    paddingLeft: 5,
  },
  featuredCard: {
    width: CARD_WIDTH,
    height: 200,
    marginRight: 15,
    borderRadius: 16,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
  },
  featuredCardContent: {
    padding: 16,
  },
  featuredCardBlur: {
    padding: 14,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  featuredCardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  featuredCardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featuredCardDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredCardDetailText: {
    marginLeft: 4,
    color: 'white',
    fontSize: 14,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  quickRecipesContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  quickRecipeCard: {
    flexDirection: 'row',
    marginBottom: 14,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    position: 'relative',
    height: 100,
  },
  quickRecipeImageWrapper: {
    position: 'relative',
    width: 100,
    overflow: 'hidden',
  },
  quickRecipeImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  quickRecipeGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 1,
  },
  quickRecipeContent: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    zIndex: 2,
  },
  quickRecipeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  quickRecipeDetails: {
    flexDirection: 'row',
  },
  quickRecipeDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  quickRecipeDetailText: {
    marginLeft: 4,
    fontSize: 12,
  },
  quickRecipeButton: {
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
}); 