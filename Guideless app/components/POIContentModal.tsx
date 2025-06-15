import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { POI, ContentType } from '@/stores/RouteStore';

interface POIContentModalProps {
  poi: POI | null;
  visible: boolean;
  onClose: () => void;
}

export function POIContentModal({ poi, visible, onClose }: POIContentModalProps) {
  const [activeTab, setActiveTab] = useState<ContentType | null>(null);

  useEffect(() => {
    if (poi?.content?.contentTypes && poi.content.contentTypes.length > 0) {
      setActiveTab(poi.content.contentTypes[0] as ContentType);
    }
  }, [poi]);

  if (!poi?.content?.content || !poi.content.contentTypes) return null;

  const getContentTypeIcon = (type: ContentType): keyof typeof MaterialIcons.glyphMap => {
    switch (type) {
      case ContentType.STORY: return "auto-stories";
      case ContentType.FOOD_TIP: return "restaurant";
      case ContentType.NATURE_INFO: return "park";
      case ContentType.FUN_FACT: return "lightbulb";
      case ContentType.HISTORICAL_CONTEXT: return "account-balance";
      case ContentType.DESCRIPTION: return "info";
      default: return "info";
    }
  };

  const getContentTypeLabel = (type: ContentType): string => {
    switch (type) {
      case ContentType.STORY: return "Story";
      case ContentType.FOOD_TIP: return "Food Tips";
      case ContentType.NATURE_INFO: return "Nature";
      case ContentType.FUN_FACT: return "Fun Facts";
      case ContentType.HISTORICAL_CONTEXT: return "History";
      case ContentType.DESCRIPTION: return "About";
      default: return String(type).replace('_', ' ');
    }
  };

  const getContentTypeColor = (type: ContentType): string => {
    switch (type) {
      case ContentType.STORY: return "#8B68B1";
      case ContentType.FOOD_TIP: return "#E67E22";
      case ContentType.NATURE_INFO: return "#27AE60";
      case ContentType.FUN_FACT: return "#F39C12";
      case ContentType.HISTORICAL_CONTEXT: return "#8E44AD";
      case ContentType.DESCRIPTION: return "#34495E";
      default: return "#764D9D";
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title} numberOfLines={2}>{poi.name}</Text>
            <Text style={styles.subtitle}>Discover more about this place</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.tabContainer}
          contentContainerStyle={styles.tabContent}
        >
          {poi.content.contentTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.tab,
                activeTab === type && { 
                  backgroundColor: getContentTypeColor(type as ContentType),
                  borderColor: getContentTypeColor(type as ContentType)
                }
              ]}
              onPress={() => setActiveTab(type as ContentType)}
            >
              <MaterialIcons 
                name={getContentTypeIcon(type as ContentType)} 
                size={18} 
                color={activeTab === type ? "white" : getContentTypeColor(type as ContentType)} 
              />
              <Text style={[
                styles.tabText,
                activeTab === type && { color: "white" }
              ]}>
                {getContentTypeLabel(type as ContentType)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView style={styles.contentContainer}>
          {activeTab && poi.content.content[activeTab] && (
            <View style={styles.contentSection}>
              <View style={[styles.contentHeader, { backgroundColor: getContentTypeColor(activeTab) + '20' }]}>
                <MaterialIcons 
                  name={getContentTypeIcon(activeTab)} 
                  size={24} 
                  color={getContentTypeColor(activeTab)} 
                />
                <Text style={[styles.contentTitle, { color: getContentTypeColor(activeTab) }]}>
                  {getContentTypeLabel(activeTab)}
                </Text>
              </View>
              <Text style={styles.contentText}>
                {poi.content.content[activeTab]}
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFCFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerContent: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  closeButton: {
    padding: 8,
  },
  tabContainer: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: 'white',
  },
  tabText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  contentContainer: {
    flex: 1,
  },
  contentSection: {
    padding: 20,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2C3E50',
    textAlign: 'justify',
  },
});