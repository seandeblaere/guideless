import React from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { useFormData, useRouteGeneratorActions, DestinationType } from '../stores/RouteGeneratorStore';

export const DestinationStep: React.FC = () => {
  const formData = useFormData();
  const { setDestination } = useRouteGeneratorActions();

  const handleDestinationTypeSelect = (type: DestinationType) => {
    if (type === 'address') {
      setDestination(type, formData.destination.address || '');
    } else {
      setDestination(type);
    }
  };

  const handleAddressChange = (address: string) => {
    setDestination('address', address);
  };

  const destinationOptions = [
    { type: 'address' as DestinationType, label: 'Specific Address', icon: '📍' },
    { type: 'anywhere' as DestinationType, label: 'Take me anywhere', icon: '🎯' },
    { type: 'return' as DestinationType, label: 'Return route', icon: '🔄' },
  ];

  return (
    <View style={styles.container}>
      <Text style={[{ fontFamily: 'DMSans_700Bold' }, styles.title]}>
        Where would you like to go?
      </Text>
      
      <View style={styles.optionsContainer}>
        {destinationOptions.map((option) => (
          <Pressable
            key={option.type}
            style={[
              styles.optionButton,
              formData.destination.type === option.type && styles.selectedOption,
            ]}
            onPress={() => handleDestinationTypeSelect(option.type)}
          >
            <Text style={styles.optionIcon}>{option.icon}</Text>
            <Text style={[
              { fontFamily: 'DMSans_400Regular' },
              styles.optionText,
              formData.destination.type === option.type && styles.selectedOptionText,
            ]}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {formData.destination.type === 'address' && (
        <View style={styles.addressInputContainer}>
          <Text style={[{ fontFamily: 'DMSans_400Regular' }, styles.inputLabel]}>
            Enter address
          </Text>
          <TextInput
            style={[{ fontFamily: 'DMSans_400Regular' }, styles.addressInput]}
            value={formData.destination.address || ''}
            onChangeText={handleAddressChange}
            placeholder="Type your destination address..."
            placeholderTextColor="#A0A0A0"
          />
        </View>
      )}
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
    marginBottom: 32,
  },
  optionsContainer: {
    gap: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: '#E3D7F7',
    borderColor: '#764D9D',
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  optionText: {
    fontSize: 18,
    color: '#2E3A59',
    flex: 1,
  },
  selectedOptionText: {
    color: '#764D9D',
    fontFamily: 'DMSans_700Bold',
  },
  addressInputContainer: {
    marginTop: 24,
  },
  inputLabel: {
    fontSize: 16,
    color: '#5A3A7A',
    marginBottom: 8,
  },
  addressInput: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2E3A59',
    backgroundColor: '#FCFCFC',
  },
});