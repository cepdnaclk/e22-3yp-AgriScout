import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

const SettingsScreen = () => {
  const { user, logout, apiHost, changeApiHost } = useAuth();
  const [newHost, setNewHost] = useState(apiHost);

  const handleSaveHost = () => {
    if (newHost) {
      changeApiHost(newHost);
      Alert.alert('Saved', 'API server host updated successfully');
    }
  };

  return (
    <View style={styles.container}>
      {/* User profile card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>User Session</Text>
        <Text style={styles.userName}>{user?.name || 'Authorized User'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'user@greenhouse.local'}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>ROLE: {(user?.role || 'VIEWER').toUpperCase()}</Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Backend Server Configuration */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Backend Server Configuration</Text>
        <Text style={styles.label}>
          Configure your local development machine IP for physical Wi-Fi testing:
        </Text>
        <TextInput
          style={styles.input}
          value={newHost}
          onChangeText={setNewHost}
          placeholder="http://192.168.1.100:5000"
          placeholderTextColor={colors.textDim}
          autoCapitalize="none"
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveHost}>
          <Text style={styles.saveButtonText}>Update Server Address</Text>
        </TouchableOpacity>
      </View>

      <View style={{ alignItems: 'center', marginTop: 'auto', paddingBottom: 20 }}>
        <Text style={{ fontSize: 11, color: colors.textDim }}>
          FloraBot Automated Greenhouse Robot Mobile App
        </Text>
        <Text style={{ fontSize: 11, color: colors.emerald, marginTop: 2 }}>
          v1.0.0 (Production Build)
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
    gap: 16
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text
  },
  userEmail: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16,185,129,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 8,
    marginBottom: 16
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.emerald
  },
  logoutButton: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: colors.rose,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  logoutText: {
    color: colors.rose,
    fontSize: 13,
    fontWeight: '600'
  },
  label: {
    fontSize: 12,
    color: colors.textDim,
    marginBottom: 10
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    padding: 10,
    color: colors.text,
    fontSize: 14,
    marginBottom: 12
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600'
  }
});

export default SettingsScreen;
