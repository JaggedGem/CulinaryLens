import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import {
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    SectionList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfirmationModal, SuccessModal } from '../../components/modals';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { FOOD_CATEGORIES, GroceryItem, useGroceryList } from '../../hooks/useGroceryList';

export default function GroceriesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { 
    groceryItems, 
    addItem, 
    removeItem, 
    updateItem, 
    toggleChecked,
    clearCheckedItems,
    clearAllItems
  } = useGroceryList();

  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('');
  const [newItemCategory, setNewItemCategory] = useState(FOOD_CATEGORIES[0]);
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const [displayCheckedItems, setDisplayCheckedItems] = useState(true);
  
  // Modal states
  const [showClearItemsModal, setShowClearItemsModal] = useState(false);
  const [showItemOptionsModal, setShowItemOptionsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GroceryItem | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Prepare the grocery list data for the section list
  const grocerySections = useCallback(() => {
    let items = [...groceryItems];
    
    // Filter out checked items if not displaying them
    if (!displayCheckedItems) {
      items = items.filter(item => !item.checked);
    }
    
    // Sort items by category and then by name
    items.sort((a, b) => {
      if (a.category !== b.category) {
        return FOOD_CATEGORIES.indexOf(a.category) - FOOD_CATEGORIES.indexOf(b.category);
      }
      return a.name.localeCompare(b.name);
    });
    
    // Group items by category
    const sections = FOOD_CATEGORIES.map(category => {
      const categoryItems = items.filter(item => item.category === category);
      return {
        title: category,
        data: categoryItems,
        isEmpty: categoryItems.length === 0,
      };
    }).filter(section => !section.isEmpty);
    
    return sections;
  }, [groceryItems, displayCheckedItems]);

  // Handle adding a new item to the grocery list
  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (editingItem) {
      // Update existing item
      updateItem(editingItem.id, {
        name: newItemName,
        quantity: newItemQuantity,
        unit: newItemUnit,
        category: newItemCategory,
      });
      setEditingItem(null);
      setSuccessMessage('Item updated successfully');
      setShowSuccessModal(true);
    } else {
      // Add new item
      addItem({
        name: newItemName,
        quantity: newItemQuantity,
        unit: newItemUnit,
        category: newItemCategory,
      });
    }
    
    // Reset input fields
    setNewItemName('');
    setNewItemQuantity('');
    setNewItemUnit('');
    setNewItemCategory(FOOD_CATEGORIES[0]);
    Keyboard.dismiss();
  };

  // Handle long press on an item
  const handleItemLongPress = (item: GroceryItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedItem(item);
    setShowItemOptionsModal(true);
  };

  // Handle edit item
  const handleEditItem = () => {
    if (selectedItem) {
      setEditingItem(selectedItem);
      setNewItemName(selectedItem.name);
      setNewItemQuantity(selectedItem.quantity);
      setNewItemUnit(selectedItem.unit);
      setNewItemCategory(selectedItem.category);
    }
  };

  // Handle delete item
  const handleDeleteItem = () => {
    if (selectedItem) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      removeItem(selectedItem.id);
      setSuccessMessage('Item removed');
      setShowSuccessModal(true);
    }
  };

  // Handle clearing items
  const handleClearItems = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowClearItemsModal(true);
  };

  // Handle clear checked items
  const handleClearCheckedItems = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    clearCheckedItems();
    setSuccessMessage('Checked items cleared');
    setShowSuccessModal(true);
  };

  // Handle clear all items
  const handleClearAllItems = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    clearAllItems();
    setSuccessMessage('All items cleared');
    setShowSuccessModal(true);
  };

  // Render each grocery item
  const renderGroceryItem = ({ item }: { item: GroceryItem }) => (
    <TouchableOpacity
      style={[
        styles.groceryItem,
        { backgroundColor: colors.card },
        item.checked && { opacity: 0.6 }
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        toggleChecked(item.id);
      }}
      onLongPress={() => handleItemLongPress(item)}
      delayLongPress={300}
    >
      <TouchableOpacity
        style={[
          styles.checkbox,
          { borderColor: colors.icon },
          item.checked && { backgroundColor: colors.tint, borderColor: colors.tint }
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          toggleChecked(item.id);
        }}
      >
        {item.checked && <Ionicons name="checkmark" size={16} color="white" />}
      </TouchableOpacity>
      
      <View style={styles.itemContent}>
        <Text
          style={[
            styles.itemName,
            { color: colors.text },
            item.checked && styles.itemChecked
          ]}
        >
          {item.name}
        </Text>
        
        {item.recipeName && (
          <Text style={[styles.recipeLabel, { color: colors.icon }]}>
            From: {item.recipeName}
          </Text>
        )}
      </View>
      
      {(item.quantity || item.unit) && (
        <Text style={[styles.itemQuantity, { color: colors.icon }]}>
          {item.quantity} {item.unit}
        </Text>
      )}
    </TouchableOpacity>
  );

  // Render each section header
  const renderSectionHeader = ({ section }: { section: { title: string; data: GroceryItem[] } }) => (
    <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
    </View>
  );

  // Render the category selector
  const renderCategorySelector = () => (
    <View style={[styles.categorySelector, { backgroundColor: colors.card }]}>
      <FlatList
        data={FOOD_CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryItem,
              { borderColor: colors.border },
              newItemCategory === item && { backgroundColor: colors.tint, borderColor: colors.tint }
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setNewItemCategory(item);
              setShowCategorySelector(false);
            }}
          >
            <Text
              style={[
                styles.categoryText,
                { color: colors.text },
                newItemCategory === item && { color: 'white' }
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.bottom + 90}
    >
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={[styles.title, { color: colors.text }]}>Grocery List</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.card }]}
            onPress={() => setDisplayCheckedItems(!displayCheckedItems)}
          >
            <Ionicons
              name={displayCheckedItems ? "eye-off-outline" : "eye-outline"}
              size={22}
              color={colors.text}
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.card }]}
            onPress={handleClearItems}
          >
            <Ionicons name="trash-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
      
      {groceryItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="basket-outline" size={70} color={colors.icon} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Your grocery list is empty
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.icon }]}>
            Add items below or from recipes to build your grocery list
          </Text>
        </View>
      ) : (
        <SectionList
          sections={grocerySections()}
          renderItem={renderGroceryItem}
          renderSectionHeader={renderSectionHeader}
          stickySectionHeadersEnabled={true}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 150 }
          ]}
        />
      )}
      
      <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, styles.nameInput, { color: colors.text, borderColor: colors.border }]}
            placeholder="Add item..."
            placeholderTextColor={colors.icon}
            value={newItemName}
            onChangeText={setNewItemName}
            onSubmitEditing={handleAddItem}
          />
          
          <TextInput
            style={[styles.input, styles.quantityInput, { color: colors.text, borderColor: colors.border }]}
            placeholder="Qty"
            placeholderTextColor={colors.icon}
            value={newItemQuantity}
            onChangeText={setNewItemQuantity}
            keyboardType="numeric"
          />
          
          <TextInput
            style={[styles.input, styles.unitInput, { color: colors.text, borderColor: colors.border }]}
            placeholder="Unit"
            placeholderTextColor={colors.icon}
            value={newItemUnit}
            onChangeText={setNewItemUnit}
          />
        </View>
        
        <View style={styles.inputActions}>
          <TouchableOpacity
            style={[styles.categoryButton, { borderColor: colors.border }]}
            onPress={() => setShowCategorySelector(!showCategorySelector)}
          >
            <Text style={[styles.categoryButtonText, { color: colors.text }]}>
              {newItemCategory}
            </Text>
            <Ionicons
              name={showCategorySelector ? "chevron-up" : "chevron-down"}
              size={16}
              color={colors.icon}
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.addButton,
              { backgroundColor: colors.tint },
              !newItemName.trim() && { opacity: 0.5 }
            ]}
            onPress={handleAddItem}
            disabled={!newItemName.trim()}
          >
            <Ionicons name={editingItem ? "save" : "add"} size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        {showCategorySelector && renderCategorySelector()}
      </View>
      
      {/* Clear Items Confirmation Modal */}
      <ConfirmationModal
        visible={showClearItemsModal}
        onClose={() => setShowClearItemsModal(false)}
        title="Clear Items"
        message="What would you like to clear?"
        icon="trash-outline"
        iconColor={colors.notification}
        actions={[
          {
            text: 'Checked Items Only',
            onPress: handleClearCheckedItems,
            icon: 'checkmark-circle-outline',
          },
          {
            text: 'All Items',
            onPress: handleClearAllItems,
            style: 'destructive',
            icon: 'trash-outline',
          },
          {
            text: 'Cancel',
            onPress: () => {},
            style: 'cancel',
          },
        ]}
      />
      
      {/* Item Options Modal */}
      <ConfirmationModal
        visible={showItemOptionsModal}
        onClose={() => setShowItemOptionsModal(false)}
        title="Item Options"
        message={selectedItem ? `What would you like to do with "${selectedItem.name}"?` : ''}
        icon="options-outline"
        actions={[
          {
            text: 'Edit',
            onPress: handleEditItem,
            icon: 'create-outline',
          },
          {
            text: 'Delete',
            onPress: handleDeleteItem,
            style: 'destructive',
            icon: 'trash-outline',
          },
          {
            text: 'Cancel',
            onPress: () => {},
            style: 'cancel',
          },
        ]}
      />
      
      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success"
        message={successMessage}
        autoClose={true}
        autoCloseTime={2500}
        buttonText="Got it"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  groceryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginVertical: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemChecked: {
    textDecorationLine: 'line-through',
  },
  recipeLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  itemQuantity: {
    fontSize: 14,
    marginLeft: 8,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  nameInput: {
    flex: 1,
  },
  quantityInput: {
    width: 60,
    marginLeft: 8,
    textAlign: 'center',
  },
  unitInput: {
    width: 60,
    marginLeft: 8,
    textAlign: 'center',
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  categoryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  categoryButtonText: {
    fontSize: 15,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  categorySelector: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 8,
  },
  categoryItem: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 5,
  },
  categoryText: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
}); 