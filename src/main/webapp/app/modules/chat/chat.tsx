import './chat.scss';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Storage } from 'react-jhipster';
import axios from 'axios';
import dayjs from 'dayjs';
import SockJS from 'sockjs-client';
import Stomp, { type Client, type Message, type Subscription } from 'webstomp-client';
import { toast } from 'react-toastify';
import { useSearchParams } from 'react-router';
import { Image as ImageIcon, Mic } from 'lucide-react';

import { useAppSelector } from 'app/config/store';
import Sidebar from 'app/shared/layout/sidebar/sidebar';
import ClientSidebar from 'app/shared/layout/sidebar/client-sidebar';
import ConseillerSidebar from 'app/shared/layout/sidebar/conseiller-sidebar';
import { VoiceRecorder } from './voice-recorder';
import { VoiceMessagePlayer } from './voice-message-player';
import { uploadImage, uploadVoiceMessage, getFileUrl } from './file-upload.utils';

interface IUserSummary {
  id: number;
  login: string;
  firstName?: string;
  lastName?: string;
}

interface IConversationParticipant {
  id: number;
  login: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface IMessageDTO {
  id: number;
  idMsg: string;
  contenu: string;
  dateEnvoi: string;
  estLu?: boolean;
  pieceJointe?: string;
  messageType?: 'TEXT' | 'IMAGE' | 'VOICE' | 'FILE';
  conversationId: number;
  sender?: IConversationParticipant;
}

interface IConversationDTO {
  id: number;
  idConversation: string;
  statut?: string;
  participants: IConversationParticipant[];
  messages: IMessageDTO[];
}

interface IConversationRequest {
  idConversation: string;
  statut?: string;
  participantIds: number[];
}

interface IActivityPayload {
  sessionId?: string;
  userLogin?: string;
  page?: string;
  time?: string;
}

type ConnectionState = 'connecting' | 'connected' | 'disconnected';

type ActivePresenceMap = Map<string, { sessions: Set<string>; lastSeen: number }>;

const AUTH_TOKEN_KEY = 'jhi-authenticationToken';

const buildConversationIdentifier = (a: string, b: string) => {
  const [first, second] = [a.toLowerCase(), b.toLowerCase()].sort();
  return `chat-${first}-${second}`;
};

const generateMessageId = () => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
};

const formatTime = (isoDate: string) => dayjs(isoDate).format('HH:mm');

const sortMessagesByDate = (items: IMessageDTO[]) =>
  items.slice().sort((a, b) => dayjs(a.dateEnvoi).valueOf() - dayjs(b.dateEnvoi).valueOf());

const safeBaseHref = () => {
  const baseTag = document.querySelector('base');
  return baseTag ? (baseTag.getAttribute('href')?.replace(/\/$/, '') ?? '') : '';
};

const buildWebsocketUrl = () => {
  const loc = globalThis.location;
  const baseHref = safeBaseHref();
  const protocol = loc.protocol === 'https:' ? 'https' : 'http';
  let url = `${protocol}://${loc.host}${baseHref}/websocket/tracker`;
  const authToken = Storage.local.get(AUTH_TOKEN_KEY) || Storage.session.get(AUTH_TOKEN_KEY);
  if (authToken) {
    url += `?access_token=${authToken}`;
  }
  return url;
};

const ChatPage = () => {
  const { t } = useTranslation();
  const account = useAppSelector(state => state.authentication.account);
  const isAuthenticated = useAppSelector(state => state.authentication.isAuthenticated);
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState<IUserSummary[]>([]);
  const [presence, setPresence] = useState<ActivePresenceMap>(new Map());
  const [connectionState, setConnectionState] = useState<ConnectionState>('connecting');
  const [selectedUser, setSelectedUser] = useState<IUserSummary | null>(null);
  const [messages, setMessages] = useState<IMessageDTO[]>([]);
  const [conversation, setConversation] = useState<IConversationDTO | null>(null);
  const [messageDraft, setMessageDraft] = useState('');
  const [filter, setFilter] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const stompClientRef = useRef<Client | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const trackerSubscriptionRef = useRef<Subscription | null>(null);
  const conversationSubscriptionRef = useRef<Subscription | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const messageCacheRef = useRef<Map<number, IMessageDTO[]>>(new Map());
  const activeConversationIdRef = useRef<number | null>(null);

  const currentLogin: string | undefined = account?.login;
  const currentUserId: number | undefined = account?.id;

  const sortedUsers = useMemo(() => {
    const keyword = filter.trim().toLowerCase();
    return users
      .filter(user => user.login !== currentLogin)
      .filter(user => (keyword ? user.login.toLowerCase().includes(keyword) : true))
      .sort((a, b) => a.login.localeCompare(b.login));
  }, [users, currentLogin, filter]);

  const activeLogins = useMemo(() => new Set(Array.from(presence.keys())), [presence]);

  useEffect(() => {
    activeConversationIdRef.current = conversation?.id ?? null;
  }, [conversation?.id]);

  const storeMessages = useCallback(
    (conversationId: number, items: IMessageDTO[]) => {
      const sorted = sortMessagesByDate(items);
      messageCacheRef.current.set(conversationId, sorted);
      if (activeConversationIdRef.current === conversationId) {
        setMessages(sorted);
      }
      return sorted;
    },
    [setMessages],
  );

  const appendMessageToCache = useCallback(
    (conversationId: number, message: IMessageDTO) => {
      const existing = messageCacheRef.current.get(conversationId) ?? [];
      const filtered = existing.filter(item => {
        if (message.id != null && item.id === message.id) {
          return false;
        }
        if (item.idMsg && item.idMsg === message.idMsg) {
          return false;
        }
        return true;
      });
      return storeMessages(conversationId, [...filtered, message]);
    },
    [storeMessages],
  );

  const removeMessageFromCache = useCallback(
    (conversationId: number, matcher: (message: IMessageDTO) => boolean) => {
      const existing = messageCacheRef.current.get(conversationId) ?? [];
      const filtered = existing.filter(item => !matcher(item));
      storeMessages(conversationId, filtered);
    },
    [storeMessages],
  );

  const resetConversationSubscription = useCallback(() => {
    if (conversationSubscriptionRef.current) {
      conversationSubscriptionRef.current.unsubscribe();
      conversationSubscriptionRef.current = null;
    }
  }, []);

  const handleActivity = useCallback((payload: IActivityPayload) => {
    if (!payload?.userLogin) {
      return;
    }
    setPresence(prev => {
      const login = payload.userLogin;
      if (!login) {
        return prev;
      }
      const next = new Map(prev);
      if (payload.page === 'logout') {
        if (!payload.sessionId) {
          next.delete(login);
          return next;
        }
        const existing = next.get(login);
        if (existing) {
          const updatedSessions = new Set(existing.sessions);
          updatedSessions.delete(payload.sessionId);
          if (updatedSessions.size === 0) {
            next.delete(login);
          } else {
            next.set(login, { sessions: updatedSessions, lastSeen: Date.now() });
          }
        }
        return next;
      }
      const sessions = new Set(next.get(login)?.sessions ?? []);
      if (payload.sessionId) {
        sessions.add(payload.sessionId);
      }
      const lastSeen = payload.time ? dayjs(payload.time).valueOf() : Date.now();
      next.set(login, { sessions, lastSeen });
      return next;
    });
  }, []);

  const subscribeToConversation = useCallback(
    (conversationId: number) => {
      if (!stompClientRef.current?.connected) {
        return;
      }
      resetConversationSubscription();
      conversationSubscriptionRef.current = stompClientRef.current.subscribe(
        `/topic/conversations/${conversationId}`,
        (message: Message) => {
          try {
            const payload = JSON.parse(message.body) as IMessageDTO;
            appendMessageToCache(conversationId, payload);

            // Show notification if message is from another user
            if (payload.sender?.login !== currentLogin) {
              const senderName = payload.sender?.login || 'Un utilisateur';
              toast.info(t('chat.newMessageFrom', { sender: senderName }));

              // Browser notification if permission granted
              if ('Notification' in window && Notification.permission === 'granted') {
                const notification = new Notification(t('chat.newMessageTitle'), {
                  body: `${senderName}: ${payload.contenu}`,
                  icon: '/content/images/logo-jhipster.png',
                });
                // Notification created successfully
                void notification;
              }
            }
          } catch (error) {
            if (process.env.NODE_ENV === 'development') {
              console.error('Unable to parse message payload', error);
            }
          }
        },
      );
    },
    [appendMessageToCache, resetConversationSubscription, currentLogin],
  );

  const loadConversationMessages = useCallback(
    async (conversationId: number) => {
      setLoadingConversation(true);
      setApiError(null);
      try {
        const response = await axios.get<IMessageDTO[]>(`/api/messages/conversation/${conversationId}`);
        storeMessages(conversationId, response.data ?? []);
      } catch {
        setApiError(t('chat.unableLoadConversation'));
      } finally {
        setLoadingConversation(false);
      }
    },
    [storeMessages],
  );

  const ensureConversation = useCallback(
    async (target: IUserSummary) => {
      if (!currentLogin || !currentUserId) {
        return;
      }
      setSelectedUser(target);
      setApiError(null);
      const identifier = buildConversationIdentifier(currentLogin, target.login);
      try {
        const response = await axios.get<IConversationDTO>(`/api/conversations/identifier/${identifier}`);
        const convo = response.data;
        setConversation(convo);
        const cachedMessages = messageCacheRef.current.get(convo.id);
        if (cachedMessages && cachedMessages.length > 0) {
          setMessages(cachedMessages);
        } else {
          storeMessages(convo.id, convo.messages ?? []);
        }
        subscribeToConversation(convo.id);
      } catch (error: any) {
        if (error?.response?.status !== 404) {
          setApiError(t('chat.unableLoadConversation'));
          return;
        }
        try {
          const request: IConversationRequest = {
            idConversation: identifier,
            statut: 'OPEN',
            participantIds: [currentUserId, target.id],
          };
          const creation = await axios.post<IConversationDTO>('/api/conversations', request);
          const convo = creation.data;
          setConversation(convo);
          storeMessages(convo.id, []);
          subscribeToConversation(convo.id);
        } catch {
          setApiError(t('chat.unableCreateConversation'));
        }
      }
    },
    [currentLogin, currentUserId, storeMessages, subscribeToConversation],
  );

  const connectWebsocket = useCallback(() => {
    if (stompClientRef.current?.connected) {
      return;
    }
    setConnectionState('connecting');
    const socket = new SockJS(buildWebsocketUrl());
    const client = Stomp.over(socket, { protocols: ['v12.stomp'] });
    client.connect(
      {},
      () => {
        setConnectionState('connected');
        stompClientRef.current = client;
        trackerSubscriptionRef.current = client.subscribe('/topic/tracker', (message: Message) => {
          try {
            handleActivity(JSON.parse(message.body) as IActivityPayload);
          } catch (error) {
            if (process.env.NODE_ENV === 'development') {
              console.error('Unable to parse activity payload', error);
            }
          }
        });
        client.send('/app/topic/activity', JSON.stringify({ page: 'chat' }));
        if (conversation?.id) {
          subscribeToConversation(conversation.id);
        }
      },
      () => {
        setConnectionState('disconnected');
        if (reconnectTimerRef.current) {
          window.clearTimeout(reconnectTimerRef.current);
        }
        reconnectTimerRef.current = window.setTimeout(() => {
          connectWebsocket();
        }, 5000);
      },
    );
  }, [conversation?.id, handleActivity, subscribeToConversation]);

  const disconnectWebsocket = useCallback(() => {
    if (reconnectTimerRef.current) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    resetConversationSubscription();
    trackerSubscriptionRef.current?.unsubscribe();
    trackerSubscriptionRef.current = null;
    if (stompClientRef.current && stompClientRef.current.connected) {
      try {
        stompClientRef.current.send('/app/topic/activity', JSON.stringify({ page: 'logout' }));
      } catch {
        // ignore, best effort
      }
      stompClientRef.current.disconnect();
    }
    stompClientRef.current = null;
    setConnectionState('disconnected');
  }, []);

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      connectWebsocket();
    }
    return () => {
      disconnectWebsocket();
    };
  }, [connectWebsocket, disconnectWebsocket, isAuthenticated]);

  const fetchUsersOrConversations = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const userRole = account?.role;

      if (userRole === 'CLIENT') {
        // For clients, fetch their conversations and extract users from them
        const response = await axios.get<IConversationDTO[]>('/api/conversations/my-conversations');
        const myConversations = response.data ?? [];

        // Extract unique users from conversations (excluding current user)
        const usersFromConversations: IUserSummary[] = [];
        const seenUserIds = new Set<number>();

        myConversations.forEach(conv => {
          conv.participants.forEach(participant => {
            if (participant.login !== currentLogin && !seenUserIds.has(participant.id)) {
              seenUserIds.add(participant.id);
              usersFromConversations.push({
                id: participant.id,
                login: participant.login,
                firstName: participant.firstName,
                lastName: participant.lastName,
              });
            }
          });
        });

        setUsers(usersFromConversations);
      } else {
        // For non-clients (conseiller, admin, responsable), fetch conversations to get chat history
        const conversationsResponse = await axios.get<IConversationDTO[]>('/api/conversations/my-conversations');
        const myConversations = conversationsResponse.data ?? [];

        // Extract unique users from conversations (excluding current user)
        const usersFromConversations: IUserSummary[] = [];
        const seenUserIds = new Set<number>();

        myConversations.forEach(conv => {
          conv.participants.forEach(participant => {
            if (participant.login !== currentLogin && !seenUserIds.has(participant.id)) {
              seenUserIds.add(participant.id);
              usersFromConversations.push({
                id: participant.id,
                login: participant.login,
                firstName: participant.firstName,
                lastName: participant.lastName,
              });
            }
          });
        });

        // Also load all users from the same entreprise so new managers/conseillers can start conversations
        try {
          const entrepriseUsersResponse = await axios.get<IUserSummary[]>('/api/admin/users/entreprise');
          const entrepriseUsers = entrepriseUsersResponse.data ?? [];
          entrepriseUsers.forEach(user => {
            if (user.login !== currentLogin && !seenUserIds.has(user.id)) {
              seenUserIds.add(user.id);
              usersFromConversations.push(user);
            }
          });
        } catch (entrepriseError) {
          console.error('Error fetching entreprise users:', entrepriseError);
        }

        setUsers(usersFromConversations);
      }
    } catch (error) {
      console.error('Error fetching users/conversations:', error);
      setApiError('Impossible de charger la liste des utilisateurs.');
    } finally {
      setLoadingUsers(false);
    }
  }, [account?.role, currentLogin]);

  useEffect(() => {
    if (isAuthenticated && currentLogin) {
      fetchUsersOrConversations();
    }
  }, [isAuthenticated, currentLogin, fetchUsersOrConversations]);

  // Periodic refresh for clients to detect new conversations
  useEffect(() => {
    if (account?.role === 'CLIENT' && isAuthenticated) {
      const interval = setInterval(() => {
        fetchUsersOrConversations();
      }, 5000); // Refresh every 5 seconds

      return () => clearInterval(interval);
    }
  }, [account?.role, isAuthenticated, fetchUsersOrConversations]);

  // Auto-open conversation when a new user appears for clients
  useEffect(() => {
    if (account?.role === 'CLIENT' && users.length > 0 && !selectedUser) {
      // If client has conversations but hasn't selected one, auto-select the first
      const firstUser = users[0];
      if (firstUser) {
        ensureConversation(firstUser);
      }
    }
  }, [account?.role, users, selectedUser, ensureConversation]);

  // Auto-select user from URL parameter
  useEffect(() => {
    const userLoginParam = searchParams.get('user');
    if (!userLoginParam || selectedUser || loadingUsers) {
      return;
    }

    const fetchAndSelectUser = async () => {
      // First check if user is already in the list
      let targetUser = users.find(u => u.login === userLoginParam);

      // If not found, fetch the user by login
      if (!targetUser && userLoginParam) {
        try {
          const response = await axios.get<IUserSummary>(`/api/admin/users/chat/${userLoginParam}`);
          if (response.data) {
            targetUser = {
              id: response.data.id,
              login: response.data.login,
              firstName: response.data.firstName,
              lastName: response.data.lastName,
            };
            const newUser = targetUser;
            // Add to users list
            setUsers(prev => [...prev, newUser]);
          }
        } catch (error) {
          console.error('Error fetching user:', error);
          setApiError("Impossible de charger les informations de l'utilisateur.");
          return;
        }
      }

      if (targetUser) {
        ensureConversation(targetUser);
      }
    };

    fetchAndSelectUser();
  }, [searchParams, users, selectedUser, loadingUsers, ensureConversation]);

  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !conversation?.id || !currentUserId) return;

      setIsUploadingFile(true);
      try {
        console.warn('Uploading image:', file.name);
        const filePath = await uploadImage(file);
        console.warn('Image uploaded to:', filePath);

        const generatedId = generateMessageId();
        const payload = {
          conversationId: conversation.id,
          idMsg: generatedId,
          contenu: '',
          pieceJointe: filePath,
          messageType: 'IMAGE',
          senderId: currentUserId,
        };

        console.warn('Sending message payload:', payload);
        const response = await axios.post<IMessageDTO>('/api/messages', payload);
        console.warn('Message response:', response.data);
        if (response.data) {
          appendMessageToCache(conversation.id, response.data);
        }

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Failed to upload image');
      } finally {
        setIsUploadingFile(false);
      }
    },
    [conversation?.id, currentUserId, appendMessageToCache],
  );

  const handleVoiceSend = useCallback(
    async (audioBlob: Blob) => {
      if (!conversation?.id || !currentUserId) return;

      setIsUploadingFile(true);
      try {
        console.warn('Uploading voice message, size:', audioBlob.size);
        const filePath = await uploadVoiceMessage(audioBlob);
        console.warn('Voice uploaded to:', filePath);

        const generatedId = generateMessageId();
        const payload = {
          conversationId: conversation.id,
          idMsg: generatedId,
          contenu: '',
          pieceJointe: filePath,
          messageType: 'VOICE',
          senderId: currentUserId,
        };

        console.warn('Sending voice payload:', payload);
        const response = await axios.post<IMessageDTO>('/api/messages', payload);
        console.warn('Voice message response:', response.data);
        if (response.data) {
          appendMessageToCache(conversation.id, response.data);
        }

        setShowVoiceRecorder(false);
      } catch (error) {
        console.error('Error uploading voice message:', error);
        toast.error('Failed to upload voice message');
      } finally {
        setIsUploadingFile(false);
      }
    },
    [conversation?.id, currentUserId, appendMessageToCache],
  );

  const handleSendMessage = useCallback(
    async (event?: React.FormEvent) => {
      event?.preventDefault();
      if (!messageDraft.trim() || !conversation?.id || !currentUserId) {
        return;
      }
      const trimmed = messageDraft.trim();
      const conversationId = conversation.id;
      const generatedId = generateMessageId();
      const payload = {
        conversationId,
        idMsg: generatedId,
        contenu: trimmed,
        senderId: currentUserId,
      };
      const optimisticMessage: IMessageDTO = {
        id: Number.MAX_SAFE_INTEGER - Math.floor(Math.random() * 100000),
        idMsg: payload.idMsg,
        contenu: payload.contenu,
        dateEnvoi: new Date().toISOString(),
        conversationId,
        sender: {
          id: currentUserId,
          login: currentLogin ?? 'moi',
        },
      };
      appendMessageToCache(conversationId, optimisticMessage);
      setMessageDraft('');
      setApiError(null);
      try {
        const response = await axios.post<IMessageDTO>('/api/messages', payload);
        if (response.data) {
          appendMessageToCache(conversationId, response.data);
        }
      } catch {
        setApiError("Impossible d'envoyer le message.");
        removeMessageFromCache(conversationId, message => message.idMsg === generatedId);
        setMessageDraft(trimmed);
      }
    },
    [appendMessageToCache, conversation?.id, currentLogin, currentUserId, messageDraft, removeMessageFromCache],
  );

  useEffect(() => {
    if (!selectedUser || !conversation?.id) {
      return;
    }
    loadConversationMessages(conversation.id);
  }, [conversation?.id, loadConversationMessages, selectedUser]);

  useEffect(() => () => resetConversationSubscription(), [resetConversationSubscription]);

  const renderSidebar = () => {
    const role = account?.role;
    if (role === 'CLIENT') {
      return <ClientSidebar />;
    } else if (role === 'CONSEILLER') {
      return <ConseillerSidebar />;
    }
    return <Sidebar />;
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen bg-slate-100">
        {renderSidebar()}
        <main className="flex-1 ml-[280px] p-6">
          <div className="chat-guest-warning">
            <div className="chat-guest-warning__card">{t('chat.guestWarning')}</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      {renderSidebar()}
      <main className="flex-1 ml-[280px] p-6">
        <div className="flex gap-6 h-[calc(100vh-3rem)]">
          {/* Users List */}
          <div className="w-80 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200">
              <input
                type="text"
                placeholder={t('common.search')}
                value={filter}
                onChange={event => setFilter(event.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {loadingUsers ? (
                <div className="p-4 text-center text-slate-500">{t('common.loading')}</div>
              ) : sortedUsers.length === 0 && account?.role === 'CLIENT' ? (
                <div className="p-6 text-center">
                  <div className="text-5xl mb-4">⏳</div>
                  <div className="text-slate-700 font-medium mb-2">{t('chat.waitingAdvisorTitle')}</div>
                  <div className="text-sm text-slate-500 leading-relaxed">{t('chat.waitingAdvisorText')}</div>
                </div>
              ) : (
                sortedUsers.map(user => {
                  const isActive = activeLogins.has(user.login);
                  const isSelected = selectedUser?.login === user.login;
                  const displayName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.login;
                  const initial = user.firstName?.charAt(0)?.toUpperCase() || user.login.charAt(0).toUpperCase();

                  return (
                    <div
                      key={user.id}
                      className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
                      onClick={() => ensureConversation(user)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                          {initial}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-slate-800">{displayName}</div>
                          <div className="text-sm text-slate-500">{isActive ? t('chat.online') : t('chat.offline')}</div>
                        </div>
                        {isActive && <div className="w-2 h-2 rounded-full bg-green-500" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
            {apiError && <div className="p-4 bg-red-50 text-red-600">{apiError}</div>}
            {!selectedUser ? (
              <div className="flex-1 flex items-center justify-center text-slate-500">
                <div className="text-center px-8">
                  {account?.role === 'CLIENT' && sortedUsers.length === 0 ? (
                    <>
                      <div className="text-6xl mb-4">⏳</div>
                      <p className="text-lg font-medium text-slate-700 mb-2">{t('chat.pleaseWaitTitle')}</p>
                      <p className="text-slate-500">{t('chat.pleaseWaitText')}</p>
                    </>
                  ) : (
                    <>
                      <div className="text-6xl mb-4">💬</div>
                      <p>{t('chat.selectUser')}</p>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {loadingConversation && <div className="text-center text-slate-500">{t('chat.loadingMessages')}</div>}
                  {!loadingConversation && messages.length === 0 && (
                    <div className="text-center text-slate-500 mt-20">
                      <div className="text-4xl mb-4">✨</div>
                      <p>{t('chat.startDiscussion')}</p>
                    </div>
                  )}
                  {messages.map(message => {
                    const outbound = message.sender?.login === currentLogin;
                    const messageType = message.messageType || 'TEXT';

                    return (
                      <div key={`${message.id}-${message.idMsg}`} className={`flex ${outbound ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-xs lg:max-w-md ${outbound ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'} rounded-2xl px-4 py-3`}
                        >
                          {!outbound && <div className="text-xs text-slate-500 mb-1">{message.sender?.login}</div>}

                          {messageType === 'IMAGE' && message.pieceJointe ? (
                            <div className="message-image" style={{ marginTop: '4px' }}>
                              <img
                                src={getFileUrl(message.pieceJointe)}
                                alt={t('chat.sharedImage')}
                                style={{
                                  maxWidth: '250px',
                                  maxHeight: '300px',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  display: 'block',
                                }}
                                onClick={() => message.pieceJointe && window.open(getFileUrl(message.pieceJointe), '_blank')}
                              />
                            </div>
                          ) : messageType === 'VOICE' && message.pieceJointe ? (
                            <VoiceMessagePlayer audioUrl={getFileUrl(message.pieceJointe)} isOutbound={outbound} />
                          ) : (
                            <div>{message.contenu}</div>
                          )}

                          <div className={`text-xs mt-1 ${outbound ? 'text-blue-200' : 'text-slate-400'}`}>
                            {formatTime(message.dateEnvoi)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-200">
                  {showVoiceRecorder ? (
                    <VoiceRecorder onSend={handleVoiceSend} onCancel={() => setShowVoiceRecorder(false)} />
                  ) : (
                    <>
                      {/* Hidden file input */}
                      <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />

                      <form onSubmit={handleSendMessage}>
                        <div className="flex gap-2 items-center">
                          {/* Image upload button */}
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={connectionState !== 'connected' || isUploadingFile}
                            className="p-3 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={t('chat.sendImage')}
                          >
                            <ImageIcon size={20} className="text-slate-600" />
                          </button>

                          {/* Voice message button */}
                          <button
                            type="button"
                            onClick={() => setShowVoiceRecorder(true)}
                            disabled={connectionState !== 'connected' || isUploadingFile}
                            className="p-3 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={t('chat.sendVoice')}
                          >
                            <Mic size={20} className="text-slate-600" />
                          </button>

                          {/* Text input */}
                          <input
                            type="text"
                            placeholder={t('chat.messagePlaceholder')}
                            value={messageDraft}
                            onChange={event => setMessageDraft(event.target.value)}
                            disabled={connectionState !== 'connected' || isUploadingFile}
                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                          />

                          {/* Send button */}
                          <button
                            type="submit"
                            disabled={!messageDraft.trim() || connectionState !== 'connected' || isUploadingFile}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                          >
                            {isUploadingFile ? t('chat.sending') : t('chat.send')}
                          </button>
                        </div>
                      </form>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
