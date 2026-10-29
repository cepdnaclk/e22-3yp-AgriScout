import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import api from '../api/client';
import { useSocket } from '../context/SocketContext';
import { colors } from '../theme/colors';

const DashboardScreen = ({ navigation }) => {
  const [stats, setStats] = useState({
    totalPlants: 0,
    totalInspections: 0,
    activeAlerts: 0
  });
  const [recentInspections, setRecentInspections] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { connected, lastInspection, lastAlert, lastRobotStatus } = useSocket();

  const loadData = async () => {
    try {
      const [plantsRes, inspRes, alertsRes] = await Promise.all([
        api.get('/plants?limit=1'),
        api.get('/inspections?limit=4'),
        api.get('/alerts?acknowledged=false&limit=3')
      ]);

      setStats({
        totalPlants: plantsRes.data?.total || 0,
        totalInspections: inspRes.data?.total || 0,
        activeAlerts: alertsRes.data?.unacknowledgedCount || 0
      });
      setRecentInspections(inspRes.data?.data || []);
      setActiveAlerts(alertsRes.data?.data || []);
    } catch (e) {
      console.warn('Dashboard fetch error', e);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  // Update on socket events
  useEffect(() => {
    if (lastInspection) {
      setRecentInspections((prev) => [lastInspection, ...prev.slice(0, 3)]);
      setStats((s) => ({ ...s, totalInspections: s.totalInspections + 1 }));
    }
  }, [lastInspection]);

  useEffect(() => {
    if (lastAlert) {
      setActiveAlerts((prev) => [lastAlert, ...prev.slice(0, 2)]);
      setStats((s) => ({ ...s, activeAlerts: s.activeAlerts + 1 }));
    }
  }, [lastAlert]);

  const robotOnline = lastRobotStatus?.connectionStatus === 'online';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {/* Telemetry Status Bar */}
      <View style={styles.telemetryBar}>
        <View style={styles.telemetryItem}>
          <View style={[styles.dot, { backgroundColor: connected ? colors.healthy : colors.rose }]} />
          <Text style={styles.telemetryText}>{connected ? 'LIVE WEBSOCKET' : 'CONNECTING'}</Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Robot')}
          style={styles.telemetryItem}
        >
          <Text style={{ fontSize: 12 }}>🤖</Text>
          <Text style={[styles.telemetryText, { color: robotOnline ? colors.emerald : colors.textMuted }]}>
            {robotOnline ? 'ROBOT ONLINE' : 'ROBOT IDLE'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>PLANTS</Text>
          <Text style={styles.kpiValue}>{stats.totalPlants}</Text>
          <Text style={styles.kpiSub}>Monitored</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>SCANS</Text>
          <Text style={[styles.kpiValue, { color: colors.cyan }]}>{stats.totalInspections}</Text>
          <Text style={styles.kpiSub}>Inspections</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>ALERTS</Text>
          <Text style={[styles.kpiValue, { color: stats.activeAlerts > 0 ? colors.rose : colors.emerald }]}>
            {stats.activeAlerts}
          </Text>
          <Text style={styles.kpiSub}>Active</Text>
        </View>
      </View>

      {/* Urgent Alerts section */}
      {activeAlerts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⚠️ Urgent Alerts</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Alerts')}>
              <Text style={styles.sectionAction}>View All &gt;</Text>
            </TouchableOpacity>
          </View>

          {activeAlerts.map((alert) => (
            <View key={alert.alertId || alert._id} style={styles.alertCard}>
              <View style={styles.alertHeader}>
                <Text style={styles.alertSeverity}>{alert.severity.toUpperCase()}</Text>
                <Text style={styles.alertPlant}>{alert.plantId || alert.greenhouseId}</Text>
              </View>
              <Text style={styles.alertMessage}>{alert.message}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Latest NPK Soil Reading */}
      {recentInspections.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🧪 Latest Soil NPK Reading</Text>
            <Text style={styles.sectionSub}>Plant: {recentInspections[0].plantId}</Text>
          </View>

          <View style={styles.npkRow}>
            <View style={styles.npkBox}>
              <Text style={styles.npkTitle}>Nitrogen (N)</Text>
              <Text style={[styles.npkVal, { color: colors.emerald }]}>
                {recentInspections[0].npkValues?.nitrogen ?? '—'}
              </Text>
              <Text style={styles.npkUnit}>mg/kg</Text>
            </View>

            <View style={styles.npkBox}>
              <Text style={styles.npkTitle}>Phosphorus (P)</Text>
              <Text style={[styles.npkVal, { color: colors.cyan }]}>
                {recentInspections[0].npkValues?.phosphorus ?? '—'}
              </Text>
              <Text style={styles.npkUnit}>mg/kg</Text>
            </View>

            <View style={styles.npkBox}>
              <Text style={styles.npkTitle}>Potassium (K)</Text>
              <Text style={[styles.npkVal, { color: colors.amber }]}>
                {recentInspections[0].npkValues?.potassium ?? '—'}
              </Text>
              <Text style={styles.npkUnit}>mg/kg</Text>
            </View>
          </View>
        </View>
      )}

      {/* Recent Inspections Feed */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📸 Recent Inspections</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Inspections')}>
            <Text style={styles.sectionAction}>All &gt;</Text>
          </TouchableOpacity>
        </View>

        {recentInspections.map((insp) => (
          <TouchableOpacity
            key={insp.inspectionId}
            style={styles.inspectionCard}
            onPress={() => navigation.navigate('PlantDetail', { plantId: insp.plantId })}
          >
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <Text style={styles.inspPlantId}>{insp.plantId}</Text>
                <Text style={styles.inspZone}>({insp.greenhouseId})</Text>
              </View>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: insp.aiPrediction?.disease === 'Healthy' ? colors.emerald : colors.rose
                }}
              >
                {insp.aiPrediction?.disease || 'Unknown'} (
                {insp.aiPrediction?.confidence ? `${(insp.aiPrediction.confidence * 100).toFixed(0)}%` : 'N/A'})
              </Text>
            </View>
            <Text style={styles.inspTime}>
              {new Date(insp.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: 16,
    gap: 16
  },
  telemetryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  telemetryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  telemetryText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 8
  },
  kpiCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textDim
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginVertical: 2
  },
  kpiSub: {
    fontSize: 11,
    color: colors.textMuted
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text
  },
  sectionSub: {
    fontSize: 12,
    color: colors.textDim
  },
  sectionAction: {
    fontSize: 12,
    color: colors.emerald,
    fontWeight: '600'
  },
  alertCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: colors.rose,
    padding: 10,
    borderRadius: 6,
    marginBottom: 8
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  alertSeverity: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.rose
  },
  alertPlant: {
    fontSize: 11,
    color: colors.textMuted
  },
  alertMessage: {
    fontSize: 12,
    color: colors.text
  },
  npkRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4
  },
  npkBox: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center'
  },
  npkTitle: {
    fontSize: 10,
    color: colors.textDim
  },
  npkVal: {
    fontSize: 18,
    fontWeight: '700',
    marginVertical: 2
  },
  npkUnit: {
    fontSize: 9,
    color: colors.textDim
  },
  inspectionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)'
  },
  inspPlantId: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.emerald
  },
  inspZone: {
    fontSize: 12,
    color: colors.textDim
  },
  inspTime: {
    fontSize: 11,
    color: colors.textDim
  }
});

export default DashboardScreen;
