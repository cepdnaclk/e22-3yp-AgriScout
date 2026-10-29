import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import api from '../api/client';
import { colors } from '../theme/colors';

const PlantDetailScreen = ({ route }) => {
  const { plantId } = route.params;
  const [plant, setPlant] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const [plantRes, histRes] = await Promise.all([
          api.get(`/plants/${plantId}`),
          api.get(`/plants/${plantId}/history`)
        ]);
        setPlant(plantRes.data?.data || null);
        setHistory(histRes.data?.inspections || []);
      } catch (e) {
        console.warn('Plant detail error', e);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [plantId]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!plant) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={{ color: colors.textMuted }}>Plant not found</Text>
      </View>
    );
  }

  const latestInsp = plant.latestInspection || history[0];
  const npk = latestInsp?.npkValues || {};

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Info */}
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.plantId}>{plant.plantId}</Text>
          <View style={[styles.badge, { backgroundColor: `${colors.healthy}22`, borderColor: colors.healthy }]}>
            <Text style={[styles.badgeText, { color: colors.healthy }]}>{plant.healthStatus.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.species}>{plant.species}</Text>
        <Text style={styles.zoneText}>Zone: {plant.greenhouseId} | Row {plant.rowNumber}, Pos {plant.positionNumber}</Text>
      </View>

      {/* Latest NPK Readings */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Latest Soil NPK Nutrients</Text>
        <View style={styles.npkGrid}>
          <View style={styles.npkBox}>
            <Text style={styles.npkLabel}>Nitrogen (N)</Text>
            <Text style={[styles.npkVal, { color: colors.emerald }]}>{npk.nitrogen ?? '—'}</Text>
            <Text style={styles.npkUnit}>mg/kg (Target: 80-250)</Text>
          </View>
          <View style={styles.npkBox}>
            <Text style={styles.npkLabel}>Phosphorus (P)</Text>
            <Text style={[styles.npkVal, { color: colors.cyan }]}>{npk.phosphorus ?? '—'}</Text>
            <Text style={styles.npkUnit}>mg/kg (Target: 35-120)</Text>
          </View>
          <View style={styles.npkBox}>
            <Text style={styles.npkLabel}>Potassium (K)</Text>
            <Text style={[styles.npkVal, { color: colors.amber }]}>{npk.potassium ?? '—'}</Text>
            <Text style={styles.npkUnit}>mg/kg (Target: 120-350)</Text>
          </View>
        </View>
      </View>

      {/* Historical Inspections */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Historical Robot Inspections ({history.length})</Text>
        {history.length === 0 ? (
          <Text style={styles.emptyText}>No inspection history recorded.</Text>
        ) : (
          history.map((insp) => (
            <View key={insp.inspectionId} style={styles.historyRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inspId}>{insp.inspectionId}</Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: insp.aiPrediction?.disease === 'Healthy' ? colors.emerald : colors.rose
                  }}
                >
                  {insp.aiPrediction?.disease || 'Unknown'} (
                  {insp.aiPrediction?.confidence ? `${(insp.aiPrediction.confidence * 100).toFixed(0)}%` : 'N/A'})
                </Text>
              </View>
              <Text style={styles.dateText}>
                {new Date(insp.timestamp).toLocaleDateString()}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    padding: 16,
    gap: 14
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  plantId: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.emerald
  },
  badge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700'
  },
  species: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4
  },
  zoneText: {
    fontSize: 12,
    color: colors.textDim
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12
  },
  npkGrid: {
    flexDirection: 'row',
    gap: 8
  },
  npkBox: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center'
  },
  npkLabel: {
    fontSize: 10,
    color: colors.textDim
  },
  npkVal: {
    fontSize: 18,
    fontWeight: '700',
    marginVertical: 2
  },
  npkUnit: {
    fontSize: 8,
    color: colors.textDim,
    textAlign: 'center'
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)'
  },
  inspId: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: colors.textDim
  },
  dateText: {
    fontSize: 11,
    color: colors.textDim
  },
  emptyText: {
    color: colors.textDim,
    fontSize: 12
  }
});

export default PlantDetailScreen;
