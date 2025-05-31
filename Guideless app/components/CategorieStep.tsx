import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFormData, useRouteGeneratorActions } from '../stores/RouteGeneratorStore';

export const CategoriesStep: React.FC = () => {
  const formData = useFormData();
  const { toggleCategory } = useRouteGeneratorActions();

  const categories = [
    { id: 'culture', label: 'Culture', icon: '🎭' },
    { id: 'history', label: 'History', icon: '🏛️' },
    { id: 'nature', label: 'Nature', icon: '🌿' },
    { id: 'food', label: 'Food', icon: '🍽️' },
  ];

  return (
    <View style={styles.container}>
      <Text style={[{ fontFamily: 'DMSans_700Bold' }, styles.title]}>
        What interests you?
      </Text>
      
      <Text style={[{ fontFamily: 'DMSans_400Regular' }, styles.subtitle]}>
        Select one or more categories
      </Text>
      
      <View style={styles.categoriesContainer}>
        {categories.map((category) => {
          const isSelected = formData.categories.includes(category.id);
          
          return (
            <View key={category.id} style={styles.buttonShadow}>
              <LinearGradient
                colors={
                  isSelected
                    ? ['#764D9D', '#5A3A7A', '#764D9D']
                    : ['#E0F7FC', '#F0E8FA', '#FFE9EF']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <Pressable
                  style={styles.button}
                  onPress={() => toggleCategory(category.id)}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text style={[
                    { fontFamily: 'DMSans_400Regular' },
                    styles.buttonText,
                    isSelected && styles.selectedButtonText,
                  ]}>
                    {category.label}
                  </Text>
                  {isSelected && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </Pressable>
              </LinearGradient>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    color: '#2E3A59',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#5A3A7A',
    textAlign: 'center',
    marginBottom: 32,
  },
  categoriesContainer: {
    gap: 16,
  },
  buttonShadow: {
    elevation: 2,
    shadowColor: '#2E3A59',
    shadowOffset: {
      width: 0.5,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.5,
    borderRadius: 15,
    width: '100%',
  },
  buttonGradient: {
    width: '100%',
    borderRadius: 15,
  },
  button: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    width: '100%',
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  buttonText: {
    fontSize: 18,
    color: '#2E3A59',
    flex: 1,
    textAlign: 'center',
  },
  selectedButtonText: {
    color: '#FCFCFC',
    fontFamily: 'DMSans_700Bold',
  },
  checkmark: {
    fontSize: 20,
    color: '#FCFCFC',
    marginLeft: 12,
  },
});