import React, { useRef, useEffect } from 'react';
import { StyleSheet, TextInput, View, Keyboard, Text } from 'react-native';
import { useFormData, useRouteGeneratorActions } from '../stores/RouteGeneratorStore';

export const AddressStep: React.FC = () => {
  const formData = useFormData();
  const { setDestination } = useRouteGeneratorActions();
  const inputRef = useRef<TextInput>(null);
  const isFocusedRef = useRef(false);

  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      if (isFocusedRef.current) {
        inputRef.current?.blur();
        isFocusedRef.current = false;
      }
    });

    return () => {
      keyboardDidHideListener?.remove();
    };
  }, []);

  const handleFocus = () => {
    isFocusedRef.current = true;
  };

  const handleBlur = () => {
    isFocusedRef.current = false;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Destination address</Text>
      <TextInput
        ref={inputRef}
        style={styles.addressInput}
        placeholder="Enter address or location..."
        value={formData.destination.address || ''}
        onChangeText={(text) => setDestination('address', text)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoComplete='street-address'
      />
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
  label: {
    fontFamily: 'DMSans-Light',
    fontSize: 16,
    color: '#2F7EA1',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  addressInput: {
    fontFamily: 'DMSans-Regular',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    backgroundColor: '#FCFCFC',
    minHeight: 60,
    textAlignVertical: 'top',
    width: '100%',
  },
});