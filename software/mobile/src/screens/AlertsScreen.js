import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert as NativeAlert
} from 'react-native';
import api from '../api/client';
import { useSocket } from '../context/SocketContext';
import { colors } from '../theme/colors';

const AlertsScreen = () => {
  const [alerts, setAlerts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { lastAlert } = useSocket();

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/alerts');
      setAlerts(res.data?.data || []);
    } catch (e) {
      console.warn('Failed to load alerts', e);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAlerts();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, []);

  useEffect(() => {
    if (lastAlert) {
      setAlerts((prev) => [lastAlert, ...prev]);
    }
  }, [lastAlert]);

  const handleAcknowledge = async (alertId) => {
    try {
      const res = await api.patch(`/alerts/${alertId}/acknowledge`);
      if (res.data?.success) {
        setAlerts((prev) =>
          prev.map((a) => (a.alertId === alertId || a._id === alertId ? res.data.data : a))
        );
      }
    } catch (e) {
      NativeAlert.alert('Error', 'Unable to acknowledge alert');
    }
  };

  const renderItem = ({ item }) => {
    const isCritical = item.severity === 'critical';
    const isWarning = item.severity === 'warning';
    const borderColor = isCritical ? colors.rose : isWarning ? colors.amber : colors.cyan;

    return (
      <View style={[styles.card, { borderLeftColor: borderColor, borderLeftWidth: 4 }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.severity, { color: borderColor }]}>
            {item.severity.toUpperCase()}
          </Text>
          <Text style={styles.plantId}>{item.plantId || item.greenhouseId}</Text>
        </View>

        <Text style={styles.message}>{item.message}</Text>

        <View style={styles.cardFooter}>
          <Text style={styles.timeText}>
            {new Date(item.createdAt).toLocaleString()}
          </Text>

          {!item.acknowledged ? (
            <TouchableOpacity
              style={styles.ackButton}
              onPress={() => handleAcknowledge(item.alertId || item._id)}
            >
              <Text style={styles.ackText}>Acknowledge</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.resolvedText}>✓ Resolved</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={alerts}
        keyExtractor={(item) => item.alertId || item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No alerts reported</Text>
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
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  severity: {
    fontSize: 11,
    fontWeight: '700'
  },
  plantId: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text
  },
  message: {
    fontSize: 13,
    color: colors.text,
    marginBottom: 10
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 8
  },
  timeText: {
    fontSize: 11,
    color: colors.textDim
  },
  ackButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6
  },
  ackText: {
    color: colors.emerald,
    fontSize: 11,
    fontWeight: '600'
  },
  resolvedText: {
    color: colors.emerald,
    fontSize: 11,
    fontWeight: '500'
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textDim,
    marginTop: 40
  }
});

export default AlertsScreen;
