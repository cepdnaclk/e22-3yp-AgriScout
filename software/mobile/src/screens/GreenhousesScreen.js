import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl
} from 'react-native';
import api from '../api/client';
import { colors } from '../theme/colors';

const GreenhousesScreen = ({ navigation }) => {
  const [greenhouses, setGreenhouses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGreenhouses = async () => {
    try {
      const res = await api.get('/greenhouses');
      setGreenhouses(res.data?.data || []);
    } catch (e) {
      console.warn('Failed to load greenhouses', e);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchGreenhouses();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchGreenhouses();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.ghId}>{item.greenhouseId}</Text>
          <Text style={styles.ghName}>{item.name}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.location}>📍 {item.location || 'Main Agricultural Zone'}</Text>

      <View style={styles.statsRow}>
        <Text style={styles.stat}>🌱 <Text style={{ color: colors.text, fontWeight: '700' }}>{item.plantCount || 0}</Text> Plants</Text>
        <Text style={styles.stat}>⚠️ <Text style={{ color: item.activeAlertCount > 0 ? colors.rose : colors.text, fontWeight: '700' }}>{item.activeAlertCount || 0}</Text> Alerts</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={greenhouses}
        keyExtractor={(item) => item.greenhouseId}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No greenhouse zones registered</Text>
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
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6
  },
  ghId: {
    fontSize: 12,
    color: colors.emerald,
    fontWeight: '700'
  },
  ghName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(16,185,129,0.15)'
  },
  statusText: {
    fontSize: 10,
    color: colors.emerald,
    fontWeight: '700'
  },
  location: {
    fontSize: 12,
    color: colors.textDim,
    marginBottom: 12
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 10
  },
  stat: {
    fontSize: 12,
    color: colors.textMuted
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textDim,
    marginTop: 40
  }
});

export default GreenhousesScreen;
