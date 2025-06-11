import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFormData, useRouteGeneratorActions } from '../stores/RouteGeneratorStore';
import { CustomSlider } from './CustomSlider';

export const DurationStep: React.FC = () => {
  const formData = useFormData();
  const { setDuration } = useRouteGeneratorActions();

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins} min`;
    } else if (mins === 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    } else {
      return `${hours}h ${mins}m`;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[{ fontFamily: 'DMSans_700Bold' }, styles.title]}>
        How long should your journey be?
      </Text>
      
      <View style={styles.durationContainer}>
        <Text style={[{ fontFamily: 'DMSans_700Bold' }, styles.durationText]}>
          {formatDuration(formData.durationMinutes)}
        </Text>
        
        <View style={styles.sliderContainer}>
          <CustomSlider
            style={styles.slider}
            minimumValue={30}
            maximumValue={240}
            step={15}
            value={formData.durationMinutes}
            onValueChange={setDuration}
          />
          
          <View style={styles.sliderLabels}>
            <Text style={[{ fontFamily: 'DMSans_400Regular' }, styles.sliderLabel]}>
              30 min
            </Text>
            <Text style={[{ fontFamily: 'DMSans_400Regular' }, styles.sliderLabel]}>
              4 hours
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    color: '#2E3A59',
    textAlign: 'center',
    marginBottom: 48,
    paddingHorizontal: 10,
  },
  durationContainer: {
    alignItems: 'center',
  },
  durationText: {
    fontSize: 48,
    color: '#764D9D',
    marginBottom: 32,
    textAlign: 'center',
    minWidth: 200,
  },
  sliderContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  slider: {
    width: '100%',
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 5,
  },
  sliderLabel: {
    fontSize: 14,
    color: '#A0A0A0',
    minWidth: 50,
  },
});