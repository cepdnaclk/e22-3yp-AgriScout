import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Image
} from 'react-native';
import api, { DEFAULT_API_HOST } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

const InspectionsScreen = ({ navigation }) => {
  const [inspections, setInspections] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { apiHost } = useAuth();

  const fetchInspections = async () => {
    try {
      const res = await api.get('/inspections?limit=25');
      setInspections(res.data?.data || []);
    } catch (e) {
      console.warn('Failed to load inspections', e);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchInspections();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchInspections();
  }, []);

  const renderItem = ({ item }) => {
    const ai = item.aiPrediction || {};
    const isHealthy = ai.disease === 'Healthy';
    const npk = item.npkValues || {};
    const imgUrl = item.leafImageUrl ? `${apiHost || DEFAULT_API_HOST}${item.leafImageUrl}` : null;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.inspId}>{item.inspectionId}</Text>
          <Text style={styles.dateText}>
            {new Date(item.timestamp).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.bodyRow}>
          {imgUrl ? (
            <Image source={{ uri: imgUrl }} style={styles.thumb} />
          ) : (
            <View style={[styles.thumb, styles.placeholderThumb]}>
              <Text style={{ fontSize: 20 }}>🍃</Text>
            </View>
          )}

          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.plantId}>Plant: {item.plantId}</Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '700',
                color: isHealthy ? colors.emerald : colors.rose
              }}
            >
              {ai.disease || 'Unknown Condition'}
            </Text>
            <Text style={styles.confText}>
              Confidence: {ai.confidence ? `${(ai.confidence * 100).toFixed(1)}%` : 'N/A'}
            </Text>
          </View>
        </View>

        {/* NPK Values Pill */}
        <View style={styles.npkFooter}>
          <Text style={styles.npkTag}>
            N: <Text style={{ color: colors.emerald, fontWeight: '700' }}>{npk.nitrogen ?? '—'}</Text>
          </Text>
          <Text style={styles.npkTag}>
            P: <Text style={{ color: colors.cyan, fontWeight: '700' }}>{npk.phosphorus ?? '—'}</Text>
          </Text>
          <Text style={styles.npkTag}>
            K: <Text style={{ color: colors.amber, fontWeight: '700' }}>{npk.potassium ?? '—'}</Text>
          </Text>
          <Text style={[styles.npkTag, { marginLeft: 'auto', color: colors.textDim }]}>
            Zone {item.greenhouseId}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={inspections}
        keyExtractor={(item) => item.inspectionId}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No inspection records found</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  list: {
    padding: 14,
    gap: 12
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  inspId: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.emerald
  },
  dateText: {
    fontSize: 11,
    color: colors.textDim
  },
  bodyRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 10
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: colors.card
  },
  placeholderThumb: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  plantId: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text
  },
  confText: {
    fontSize: 11,
    color: colors.textDim
  },
  npkFooter: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 8,
    alignItems: 'center'
  },
  npkTag: {
    fontSize: 11,
    color: colors.textMuted
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textDim,
    marginTop: 40
  }
});

export default InspectionsScreen;
