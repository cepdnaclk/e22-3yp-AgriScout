import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import * as Notifications from 'expo-notifications';

// Configure notification presentation handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true
  })
});

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { apiHost, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [lastInspection, setLastInspection] = useState(null);
  const [lastAlert, setLastAlert] = useState(null);
  const [lastRobotStatus, setLastRobotStatus] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !apiHost) return;

    let socketInstance = null;
    try {
      socketInstance = io(apiHost, {
        transports: ['websocket', 'polling'],
        timeout: 5000,
        reconnectionAttempts: 5
      });

      socketInstance.on('connect', () => {
        setConnected(true);
      });

      socketInstance.on('disconnect', () => {
        setConnected(false);
      });

      socketInstance.on('inspection:completed', (data) => {
        setLastInspection(data);
      });

      socketInstance.on('alert:created', async (data) => {
        setLastAlert(data);

        // Trigger local notification for critical alerts
        if (data.severity === 'critical') {
          try {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: 'CRITICAL GREENHOUSE ALERT',
                body: data.message,
                data: { alertId: data.alertId }
              },
              trigger: null
            });
          } catch (e) {}
        }
      });

      socketInstance.on('robot:status', (data) => {
        setLastRobotStatus(data);
      });

      socketInstance.on('robot:offline', (data) => {
        setLastRobotStatus((prev) => ({ ...prev, ...data }));
      });

      socketInstance.on('robot:online', (data) => {
        setLastRobotStatus((prev) => ({ ...prev, ...data }));
      });

      setSocket(socketInstance);
    } catch (err) {
      console.warn('Socket.IO connection could not be established', err);
    }

    return () => {
      if (socketInstance) socketInstance.disconnect();
    };
  }, [apiHost, isAuthenticated]);

  const value = {
    socket,
    connected,
    lastInspection,
    lastAlert,
    lastRobotStatus
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within a SocketProvider');
  return context;
};
