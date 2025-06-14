import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFormData, useRouteGeneratorActions } from '../stores/RouteGeneratorStore';

export const CategoriesStep: React.FC = () => {
  const formData = useFormData();
  const { toggleCategory } = useRouteGeneratorActions();

  const categories = [
    { id: 'culture', label: 'Culture' },
    { id: 'history', label: 'History' },
    { id: 'nature', label: 'Nature' },
    { id: 'food', label: 'Food' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.categoriesContainer}>
        {categories.map((category) => {
          const isSelected = formData.categories.includes(category.id);
          
          return (
            <View key={category.id} style={styles.buttonShadow}>
              <LinearGradient
                colors={
                  isSelected
                  ? ['#A988CD', '#ED97AB']
                  : ['#F0E8FA', '#FFE9EF']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <Pressable
                  style={styles.button}
                  onPress={() => toggleCategory(category.id)}
                >
                  <Text style={[
                    { fontFamily: 'DMSans-Regular' },
                    styles.buttonText,
                    isSelected && styles.selectedButtonText,
                  ]}>
                    {category.label}
                  </Text>
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
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContainer: {
    width: '100%',
    gap: 20,
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
  buttonText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 18,
    color: '#2E3A59',
    flex: 1,
    textAlign: 'center',
  },
  selectedButtonText: {
    color: '#FCFCFC',
  },
});