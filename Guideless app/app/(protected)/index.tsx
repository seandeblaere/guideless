import { View, Text, StyleSheet, StatusBar, Pressable, Animated, Dimensions, Alert, ActivityIndicator } from 'react-native';
import React, { useRef, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCurrentStep, useRouteGeneratorActions, useCanProceedToNextStep, useFormData } from '../../stores/RouteGeneratorStore';
import { DestinationStep } from '../../components/DestinationStep';
import { DurationStep } from '../../components/DurationStep';
import { CategoriesStep } from '../../components/CategorieStep';
import { useRouteActions, useHasActiveRoute, useRouteStore } from '@/stores/RouteStore';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { router } from 'expo-router';

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

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: -(currentStep - 1) * width,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentStep]);

  const handleNext = () => {
    if (canProceedToNextStep && currentStep < 3) {
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

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((step) => (
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

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Destination';
      case 2:
        return 'Duration';
      case 3:
        return 'Categories';
    }
  };

  return (
    <>
      <StatusBar translucent backgroundColor="#FCFCFC" />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <View style={[styles.container]}>
          <View style={styles.header}>
            <Text style={[{ fontFamily: 'DMSans_700Bold' }, styles.mainTitle]}>
              Create your journey
            </Text>
            <Text style={[{ fontFamily: 'DMSans_400Regular' }, styles.stepTitle]}>
              Step {currentStep} of 3: {getStepTitle()}
            </Text>
            {renderStepIndicator()}
          </View>

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
              <View style={[styles.stepContainer, { width }]}>
                <DurationStep />
              </View>
              <View style={[styles.stepContainer, { width }]}>
                <CategoriesStep />
              </View>
            </Animated.View>
          </View>

          <View style={styles.navigationContainer}>
            {currentStep > 1 && (
              <Pressable style={styles.backButton} onPress={handleBack}>
                <Text style={[{ fontFamily: 'DMSans_400Regular' }, styles.backButtonText]}>
                  ← Back
                </Text>
              </Pressable>
            )}
            
            <View style={styles.spacer} />
            
            {currentStep < 3 ? (
              <Pressable
                style={[
                  styles.nextButton,
                  !canProceedToNextStep && styles.disabledButton,
                ]}
                onPress={handleNext}
                disabled={!canProceedToNextStep}
              >
                <Text style={[{ fontFamily: 'DMSans_700Bold' }, styles.nextButtonText]}>
                  Continue
                </Text>
              </Pressable>
            ) : (
              <Pressable
                style={[
                  styles.generateButton,
                  !canProceedToNextStep && styles.disabledButton,
                ]}
                onPress={handleGenerateRoute}
                disabled={!canProceedToNextStep}
              >
                {isGeneratingRoute ? (
                  <ActivityIndicator size="small" color="#FCFCFC" />
                ) : (
                  <Text style={[{ fontFamily: 'DMSans_700Bold' }, styles.generateButtonText]}>
                    Generate Route
                  </Text>
                )}
              </Pressable>
            )}
          </View>
        </View>
      </SafeAreaView>
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
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 24,
    color: '#2E3A59',
    marginBottom: 8,
    textAlign: 'center',
    paddingHorizontal: 10,
    minWidth: 250,
  },
  stepTitle: {
    fontSize: 12,
    color: '#5A3A7A',
    marginBottom: 16,
  },
  stepIndicator: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E0E0E0',
  },
  activeStepDot: {
    backgroundColor: '#764D9D',
  },
  formContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  slidingContainer: {
    flexDirection: 'row',
    height: '100%',
  },
  stepContainer: {
    paddingVertical: 20,
  },
  navigationContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  spacer: {
    flex: 1,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#764D9D',
  },
  nextButton: {
    backgroundColor: '#2E3A59',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  nextButtonText: {
    color: '#FCFCFC',
    fontSize: 16,
  },
  generateButton: {
    backgroundColor: '#764D9D',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  generateButtonText: {
    color: '#FCFCFC',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#A0A0A0',
  },
  resetButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  resetButtonText: {
    fontSize: 14,
    color: '#A0A0A0',
  },
});