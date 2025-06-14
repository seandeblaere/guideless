import { View, Text, StyleSheet, StatusBar, Pressable, Animated, Dimensions, Alert, ActivityIndicator } from 'react-native';
import React, { useRef, useEffect, useState } from 'react';
import { useCurrentStep, useRouteGeneratorActions, useCanProceedToNextStep, useFormData } from '../../stores/RouteGeneratorStore';
import { DestinationStep } from '../../components/DestinationStep';
import { DurationStep } from '../../components/DurationStep';
import { CategoriesStep } from '../../components/CategorieStep';
import { useRouteActions, useHasActiveRoute } from '@/stores/RouteStore';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { router } from 'expo-router';
import { AddressStep } from '../../components/AddressStep';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const currentStep = useCurrentStep();
  const { nextStep, previousStep, resetForm } = useRouteGeneratorActions();
  const { generateRoute, clearRoute } = useRouteActions();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const canProceedToNextStep = useCanProceedToNextStep();
  const formData = useFormData();
  const { getCurrentLocation } = useCurrentLocation();
  const [isGeneratingRoute, setIsGeneratingRoute] = useState(false);
  const hasActiveRoute = useHasActiveRoute();

  const getSlidePosition = () => {
    const { destination } = formData;
    
    if (destination.type === 'address') {
      return currentStep - 1;
    } else {
      switch (currentStep) {
        case 1: return 0;
        case 3: return 1;
        case 4: return 2;
        default: return 0;
      }
    }
  };

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: -getSlidePosition() * width,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentStep, formData.destination.type]);

  const handleNext = () => {
    if (canProceedToNextStep && currentStep < 4) {
      nextStep();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      previousStep();
    }
  };

  const canProceed = async (): Promise<boolean> => {
    let canProceed = true;
    if(!hasActiveRoute) {
      return canProceed;
    }
    Alert.alert(
      "Active route detected",
      "You still have an active route. Do you want to generate a new one?",
      [
        {
          text: "Yes",
          onPress: () => canProceed = false,
        },
        {
          text: "No",
          onPress: () => canProceed = false,
          style: 'cancel'
        }
      ],
      { cancelable: false }
    );  
    return canProceed;
  };

  const handleGenerateRoute = async () => {
    setIsGeneratingRoute(true);
    try {
      const location = await getCurrentLocation();
      
      if (!location) {
        Alert.alert('Location Required', 'Location is needed to generate a route.');
        return;
      }

      const canProceedToGenerate = await canProceed();
      if(!canProceedToGenerate) {
        return;
      }
      hasActiveRoute && clearRoute();
      await generateRoute(formData, location);
      resetForm();
      router.push('/maps');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate route: ' + error);
    } finally {
      setIsGeneratingRoute(false);
    } 
  };

  const getStepTitle = () => {
    const { destination } = formData;
    
    switch (currentStep) {
      case 1: return 'Destination';
      case 2: return destination.type === 'address' ? 'Address' : 'Duration';
      case 3: return destination.type === 'address' ? 'Duration' : 'Categories';
      case 4: return 'Categories';
      default: return '';
    }
  };

  const renderStepIndicator = () => {
    const { destination } = formData;
    
    if (destination.type === 'address') {
      return (
        <View style={styles.stepIndicator}>
          {[1, 2, 3, 4].map((step) => (
            <View
              key={step}
              style={[
                styles.stepDot,
                currentStep >= step && styles.activeStepDot,
              ]}
            />
          ))}
        </View>
      );
    } else {
      const stepMapping = [1, 3, 4];
      return (
        <View style={styles.stepIndicator}>
          {stepMapping.map((step, index) => (
            <View
              key={index}
              style={[
                styles.stepDot,
                currentStep >= step && styles.activeStepDot,
              ]}
            />
          ))}
        </View>
      );
    }
  };

  const renderStepTitle = () => {
    const title = getStepTitle();
    return (
      <View style={styles.titleContainer}>
        <Text style={styles.stepTitle}>
          {title}
        </Text>
        <Text style={styles.stepDescription}>
          {getStepDescription()}
        </Text>
      </View>
    );
  };

  const getStepDescription = () => {
    const { destination } = formData;
    
    switch (currentStep) {
      case 1: return "Choose how you want to explore";
      case 2: return "Tell us where you want to go";
      case 3: return destination.type === 'address' ? "How much time do you have?" : "Select your interests";
      case 4: return "Select your interests";
      default: return '';
    }
  };

  return (
    <>
      <StatusBar translucent backgroundColor="#FCFCFC" />
      <View style={[styles.container]}>
        <View style={styles.header}>
          <Text style={[{ fontFamily: 'DMSans-Bold' }, styles.mainTitle]}>
            Create your journey
          </Text>
          {renderStepIndicator()}
        </View>

        <View style={styles.contentContainer}>
          {renderStepTitle()}

          <View style={styles.formContainer}>
            <Animated.View
              style={[
                styles.slidingContainer,
                {
                  transform: [{ translateX: slideAnim }],
                },
              ]}
            >
              <View style={[styles.stepContainer, { width }]}>
                <DestinationStep />
              </View>
              {formData.destination.type === 'address' && (
                <View style={[styles.stepContainer, { width }]}>
                  <AddressStep />
                </View>
              )}
              <View style={[styles.stepContainer, { width }]}>
                <DurationStep />
              </View>
              <View style={[styles.stepContainer, { width }]}>
                <CategoriesStep />
              </View>
            </Animated.View>
          </View>
        </View>

        <View style={styles.navigationContainer}>
          <Pressable disabled={currentStep === 1} style={[styles.circleButton, currentStep === 1 && styles.disabledCircleButton]} onPress={handleBack}>
            <MaterialIcons name="arrow-back" size={28} color={currentStep === 1 ? "#A0A3AD" : "#2F7EA1"} />
          </Pressable>
        
          <Pressable
            style={[
              styles.circleButton,
              !canProceedToNextStep && styles.disabledCircleButton,
            ]}
            onPress={handleNext}
            disabled={!canProceedToNextStep}
          >
            <MaterialIcons 
              name="arrow-forward" 
              size={28} 
              color={!canProceedToNextStep ? "#A0A3AD" : "#2F7EA1"} 
            />
          </Pressable>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFCFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 0,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 18,
    color: '#2E3A59',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 10,
    minWidth: 250,
  },
  stepIndicator: {
    marginTop: 5,
    marginBottom: 20,
    flexDirection: 'row',
    gap: 8,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F0E8FA',
  },
  activeStepDot: {
    backgroundColor: '#A988CD',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 100,
  },
  slidingContainer: {
    flexDirection: 'row',
    height: '100%',
  },
  stepContainer: {
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    height: 350,
    overflow: 'hidden',
  },
  navigationContainer: {
    position: 'absolute',
    bottom: 150,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 60,
  },
  circleButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FCFCFC',
    borderWidth: 2,
    borderColor: '#2F7EA1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledCircleButton: {
    backgroundColor: '#FCFCFC',
    borderColor: '#A0A3AD',
  },
  stepTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 40,
    color: '#2E3A59',
    textAlign: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 0,
    paddingHorizontal: 20,
  },
  stepDescription: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    color: '#5A6176',
    textAlign: 'center',
  },
});