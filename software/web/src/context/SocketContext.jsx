import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [recentEvents, setRecentEvents] = useState([]);
  const [lastInspection, setLastInspection] = useState(null);
  const [lastAlert, setLastAlert] = useState(null);
  const [lastRobotStatus, setLastRobotStatus] = useState(null);

  useEffect(() => {
    // Initialize Socket.IO client (proxied through Vite)
    const socketInstance = io(window.location.origin, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000
    });

    socketInstance.on('connect', () => {
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setConnected(false);
    });

    const addEvent = (type, payload) => {
      const eventObj = {
        id: `${Date.now()}-${Math.random()}`,
        type,
        payload,
        receivedAt: new Date().toLocaleTimeString()
      };
      setRecentEvents((prev) => [eventObj, ...prev.slice(0, 19)]);
    };

    socketInstance.on('inspection:completed', (data) => {
      setLastInspection(data);
      addEvent('inspection:completed', data);
    });

    socketInstance.on('alert:created', (data) => {
      setLastAlert(data);
      addEvent('alert:created', data);
    });

    socketInstance.on('robot:status', (data) => {
      setLastRobotStatus(data);
      addEvent('robot:status', data);
    });

    socketInstance.on('robot:offline', (data) => {
      setLastRobotStatus((prev) => ({ ...prev, ...data }));
      addEvent('robot:offline', data);
    });

    socketInstance.on('robot:online', (data) => {
      setLastRobotStatus((prev) => ({ ...prev, ...data }));
      addEvent('robot:online', data);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const value = {
    socket,
    connected,
    recentEvents,
    lastInspection,
    lastAlert,
    lastRobotStatus
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
