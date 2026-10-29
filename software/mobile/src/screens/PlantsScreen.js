import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  RefreshControl
} from 'react-native';
import api from '../api/client';
import { colors } from '../theme/colors';

const PlantsScreen = ({ navigation }) => {
  const [plants, setPlants] = useState([]);
  const [search, setSearch] = useState('');
  const [healthFilter, setHealthFilter] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchPlants = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (healthFilter) params.append('healthStatus', healthFilter);

      const res = await api.get(`/plants?${params.toString()}`);
      setPlants(res.data?.data || []);
    } catch (e) {
      console.warn('Plants fetch error', e);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPlants();
    setRefreshing(false);
  }, [search, healthFilter]);

  useEffect(() => {
    fetchPlants();
  }, [search, healthFilter]);

  const renderItem = ({ item }) => {
    const isCritical = item.healthStatus === 'critical';
    const isWarning = item.healthStatus === 'warning';
    const statusColor = isCritical ? colors.critical : isWarning ? colors.warning : colors.healthy;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('PlantDetail', { plantId: item.plantId })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.plantId}>{item.plantId}</Text>
          <View style={[styles.badge, { borderColor: statusColor, backgroundColor: `${statusColor}22` }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>{item.healthStatus.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.species}>{item.species}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.meta}>Zone: {item.greenhouseId}</Text>
          <Text style={styles.meta}>Row {item.rowNumber}, Pos {item.positionNumber}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Plant ID or Species..."
          placeholderTextColor={colors.textDim}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filtersRow}>
        <TouchableOpacity
          style={[styles.filterChip, healthFilter === '' && styles.filterChipActive]}
          onPress={() => setHealthFilter('')}
        >
          <Text style={[styles.filterChipText, healthFilter === '' && styles.filterChipTextActive]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, healthFilter === 'healthy' && styles.filterChipActive]}
          onPress={() => setHealthFilter('healthy')}
        >
          <Text style={[styles.filterChipText, healthFilter === 'healthy' && styles.filterChipTextActive]}>Healthy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, healthFilter === 'warning' && styles.filterChipActive]}
          onPress={() => setHealthFilter('warning')}
        >
          <Text style={[styles.filterChipText, healthFilter === 'warning' && styles.filterChipTextActive]}>Warning</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, healthFilter === 'critical' && styles.filterChipActive]}
          onPress={() => setHealthFilter('critical')}
        >
          <Text style={[styles.filterChipText, healthFilter === 'critical' && styles.filterChipTextActive]}>Critical</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={plants}
        keyExtractor={(item) => item.plantId}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No plant records found</Text>
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
  searchContainer: {
    padding: 12,
    paddingBottom: 6
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    padding: 10,
    color: colors.text,
    fontSize: 14
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 6
  },
  filterChip: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  filterChipActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: colors.primary
  },
  filterChipText: {
    fontSize: 11,
    color: colors.textMuted
  },
  filterChipTextActive: {
    color: colors.emerald,
    fontWeight: '700'
  },
  list: {
    padding: 12,
    gap: 10
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  plantId: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.emerald
  },
  badge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700'
  },
  species: {
    fontSize: 13,
    color: colors.text,
    marginBottom: 8
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 8
  },
  meta: {
    fontSize: 11,
    color: colors.textDim
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textDim,
    marginTop: 40
  }
});

export default PlantsScreen;
