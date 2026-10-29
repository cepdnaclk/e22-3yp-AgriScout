import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import api from '../api/client';
import { useSocket } from '../context/SocketContext';
import { colors } from '../theme/colors';

const RobotScreen = () => {
  const [robots, setRobots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { lastRobotStatus } = useSocket();

  const fetchRobots = async () => {
    try {
      const res = await api.get('/robots');
      setRobots(res.data?.data || []);
    } catch (e) {
      console.warn('Failed to load robots', e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRobots();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchRobots();
  }, []);

  useEffect(() => {
    if (lastRobotStatus) {
      setRobots((prev) =>
        prev.map((r) =>
          r.robotId === lastRobotStatus.robotId ? { ...r, ...lastRobotStatus } : r
        )
      );
    }
  }, [lastRobotStatus]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      <Text style={styles.title}>Autonomous Rover Telemetry</Text>
      <Text style={styles.subtitle}>Raspberry Pi 5 Robot fleet status and telemetry</Text>

      {robots.map((robot) => {
        const isOnline = robot.connectionStatus === 'online' || robot.connectionStatus === 'inspecting';
        const battery = robot.batteryLevel ?? 0;
        const battColor = battery > 50 ? colors.emerald : battery > 20 ? colors.amber : colors.rose;

        return (
          <View key={robot.robotId} style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.robotName}>{robot.name}</Text>
                <Text style={styles.robotId}>{robot.robotId}</Text>
              </View>
              <View style={[styles.statusPill, { backgroundColor: isOnline ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.15)' }]}>
                <Text style={[styles.statusText, { color: isOnline ? colors.emerald : colors.textMuted }]}>
                  {robot.connectionStatus.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.metricsRow}>
              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>Battery Charge</Text>
                <Text style={[styles.metricVal, { color: battColor }]}>
                  {robot.batteryLevel !== null ? `${robot.batteryLevel}%` : 'N/A'}
                </Text>
              </View>

              <View style={styles.metricBox}>
                <Text style={styles.metricLabel}>Current Target</Text>
                <Text style={styles.metricVal}>
                  {robot.currentPlantId || 'Docked'}
                </Text>
              </View>
            </View>

            {robot.errorStatus?.hasError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>
                  Diagnostic: {robot.errorStatus.errorMessage}
                </Text>
              </View>
            )}

            <View style={styles.footer}>
              <Text style={styles.meta}>Zone: {robot.greenhouseId}</Text>
              <Text style={styles.meta}>
                Last Seen: {robot.lastSeenAt ? new Date(robot.lastSeenAt).toLocaleTimeString() : 'Never'}
              </Text>
            </View>
          </View>
        );
      })}
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
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 8
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
    marginBottom: 12
  },
  robotName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text
  },
  robotId: {
    fontSize: 12,
    color: colors.emerald,
    marginTop: 2
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700'
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12
  },
  metricBox: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 10
  },
  metricLabel: {
    fontSize: 10,
    color: colors.textDim
  },
  metricVal: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: colors.rose,
    padding: 8,
    borderRadius: 6,
    marginBottom: 10
  },
  errorText: {
    fontSize: 11,
    color: colors.rose
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 8
  },
  meta: {
    fontSize: 11,
    color: colors.textDim
  }
});

export default RobotScreen;
