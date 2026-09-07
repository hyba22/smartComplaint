import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

import { serializeAxiosError } from './reducer.utils';

export interface Notification {
  id?: number;
  type?: string;
  title?: string;
  message?: string;
  userId?: number;
  conversationId?: number;
  reclamationId?: number;
  read?: boolean;
  timestamp?: string;
  senderName?: string;
}

export const initialState = {
  loading: false,
  unreadCount: 0,
  latestNotification: null as Notification | null,
  notificationHistory: [] as Notification[],
  showHistory: false,
  error: null as unknown as string | null | undefined,
};

export type NotificationState = Readonly<typeof initialState>;

// Actions

export const getNotificationCount = createAsyncThunk('notification/get_count', async () => axios.get<any>('api/notifications/count'), {
  serializeError: serializeAxiosError,
});

export const markAllAsRead = createAsyncThunk('notification/mark_read', async () => axios.post('api/notifications/mark-read'), {
  serializeError: serializeAxiosError,
});

export const getLatestNotification = createAsyncThunk(
  'notification/get_latest',
  async () => axios.get<Notification>('api/notifications/latest'),
  {
    serializeError: serializeAxiosError,
  },
);

export const getNotificationHistory = createAsyncThunk(
  'notification/get_history',
  async () => axios.get<Notification[]>('api/notifications/history'),
  {
    serializeError: serializeAxiosError,
  },
);

export const NotificationSlice = createSlice({
  name: 'notification',
  initialState: initialState as NotificationState,
  reducers: {
    reset() {
      return {
        ...initialState,
      };
    },
    updateCount(state, action) {
      state.unreadCount = action.payload;
    },
    incrementCount(state) {
      state.unreadCount += 1;
    },
    addNotification(state, action) {
      state.latestNotification = action.payload;
      state.unreadCount += 1;
      // Play notification sound using Web Audio API
      if (typeof window !== 'undefined' && 'AudioContext' in window) {
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          if (audioContext.state === 'suspended') {
            audioContext.resume();
          }
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.3);
        } catch {
          // Silently fail if sound doesn't work
        }
      }
      // Add to history
      state.notificationHistory.unshift(action.payload);
      // Keep only last 50 notifications
      if (state.notificationHistory.length > 50) {
        state.notificationHistory = state.notificationHistory.slice(0, 50);
      }
    },
    setShowHistory(state, action) {
      state.showHistory = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(getNotificationCount.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getNotificationCount.fulfilled, (state, action) => {
        state.loading = false;
        state.unreadCount = action.payload.data.count;
      })
      .addCase(getNotificationCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error fetching notification count';
      })
      .addCase(markAllAsRead.pending, state => {
        state.loading = true;
      })
      .addCase(markAllAsRead.fulfilled, state => {
        state.loading = false;
        state.unreadCount = 0;
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error marking notifications as read';
      })
      .addCase(getLatestNotification.pending, state => {
        state.loading = true;
      })
      .addCase(getLatestNotification.fulfilled, (state, action) => {
        state.loading = false;
        state.latestNotification = action.payload.data;
      })
      .addCase(getLatestNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error fetching latest notification';
      })
      .addCase(getNotificationHistory.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getNotificationHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.notificationHistory = action.payload.data;
      })
      .addCase(getNotificationHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error fetching notification history';
      });
  },
});

export const { reset, updateCount, incrementCount, addNotification, setShowHistory } = NotificationSlice.actions;

// Reducer
export default NotificationSlice.reducer;
