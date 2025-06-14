import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFormData, useRouteGeneratorActions } from '../stores/RouteGeneratorStore';

export const DestinationStep: React.FC = () => {
  const formData = useFormData();
  const { setDestination } = useRouteGeneratorActions();

  const destinationOptions = [
    { type: 'address', label: 'Specific Address' },
    { type: 'anywhere', label: 'Anywhere' },
    { type: 'return', label: 'Round Trip' },
  ];

  const handleDestinationTypeSelect = (type: any) => {
    setDestination(type, formData.destination.address);
  };

  return (
    <View style={styles.container}>
      <View style={styles.optionsContainer}>
        {destinationOptions.map((option) => {
          const isSelected = formData.destination.type === option.type;
          
          return (
            <View key={option.type} style={styles.buttonShadow}>
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
                  onPress={() => handleDestinationTypeSelect(option.type)}
                >
                  <Text style={[
                    { fontFamily: 'DMSans-Regular' },
                    styles.buttonText,
                    isSelected && styles.selectedButtonText,
                  ]}>
                    {option.label}
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
  optionsContainer: {
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
  addressInputContainer: {
    marginTop: 30,
  },
  addressInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FCFCFC',
  },
});