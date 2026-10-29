import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [customHost, setCustomHost] = useState('');
  const [showHostConfig, setShowHostConfig] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { login, apiHost, changeApiHost } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please provide email and password');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await login(email, password);
      if (!res.success) {
        setError(res.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Cannot connect to backend API server');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyHost = () => {
    if (customHost) {
      changeApiHost(customHost);
      setShowHostConfig(false);
    }
  };

  const handleQuickDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>🌿</Text>
          </View>
          <Text style={styles.title}>FloraBot Mobile</Text>
          <Text style={styles.subtitle}>Greenhouse Robot Monitoring Station</Text>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.form}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="operator@greenhouse.local"
            placeholderTextColor={colors.textDim}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••••••"
            placeholderTextColor={colors.textDim}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Demo Logins */}
        <View style={styles.demoSection}>
          <Text style={styles.demoTitle}>Quick Demo Logins:</Text>
          <View style={styles.demoButtonsRow}>
            <TouchableOpacity
              style={styles.demoButton}
              onPress={() => handleQuickDemo('admin@greenhouse.local', 'AdminPass123!')}
            >
              <Text style={styles.demoButtonText}>Admin</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.demoButton}
              onPress={() => handleQuickDemo('operator@greenhouse.local', 'OperatorPass123!')}
            >
              <Text style={styles.demoButtonText}>Operator</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.demoButton}
              onPress={() => handleQuickDemo('viewer@greenhouse.local', 'ViewerPass123!')}
            >
              <Text style={styles.demoButtonText}>Viewer</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Server IP Config for physical device LAN testing */}
        <View style={styles.serverConfigSection}>
          <TouchableOpacity onPress={() => setShowHostConfig(!showHostConfig)}>
            <Text style={styles.serverConfigToggle}>
              {showHostConfig ? '▲ Hide Server Settings' : '⚙ Server Connection URL'}
            </Text>
          </TouchableOpacity>

          {showHostConfig && (
            <View style={styles.hostConfigBox}>
              <Text style={styles.hostDesc}>
                Current API: <Text style={{ color: colors.emerald }}>{apiHost}</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="http://192.168.1.50:5000"
                placeholderTextColor={colors.textDim}
                value={customHost}
                onChangeText={setCustomHost}
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.applyButton} onPress={handleApplyHost}>
                <Text style={styles.applyButtonText}>Save Server Address</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24
  },
  header: {
    alignItems: 'center',
    marginBottom: 32
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  iconText: {
    fontSize: 32
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4
  },
  form: {
    marginBottom: 24
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
    marginBottom: 6
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 10,
    padding: 12,
    color: colors.text,
    fontSize: 15,
    marginBottom: 16
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 6
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600'
  },
  errorText: {
    color: colors.rose,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16
  },
  demoSection: {
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 16,
    marginBottom: 20
  },
  demoTitle: {
    fontSize: 12,
    color: colors.textDim,
    textAlign: 'center',
    marginBottom: 10
  },
  demoButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8
  },
  demoButton: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  demoButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '500'
  },
  serverConfigSection: {
    alignItems: 'center'
  },
  serverConfigToggle: {
    color: colors.emerald,
    fontSize: 12,
    padding: 6
  },
  hostConfigBox: {
    width: '100%',
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  hostDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 8
  },
  applyButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  applyButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600'
  }
});

export default LoginScreen;
