import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFormData, useRouteGeneratorActions } from '../stores/RouteGeneratorStore';
import { CustomSlider, SLIDER_WIDTH } from './CustomSlider';

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
      <View style={styles.durationContainer}>
        <Text style={styles.durationText}>
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
            <Text style={[styles.sliderLabel, styles.leftLabel]}>
              30 min
            </Text>
            <Text style={styles.sliderLabel}>
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
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationContainer: {
    width: '100%',
    alignItems: 'center',
  },
  durationText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 36,
    color: '#2F7EA1',
    marginBottom: 32,
    textAlign: 'center',
  },
  sliderContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  slider: {
    alignSelf: 'center',
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: SLIDER_WIDTH,
    marginTop: 8,
    alignSelf: 'center',
  },
  sliderLabel: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#F3AEBF',
  },
  leftLabel: {
    color: '#C1ACDF',
  }
});