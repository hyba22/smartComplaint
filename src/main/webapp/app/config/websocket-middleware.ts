import { Storage } from 'react-jhipster';

import { Observable } from 'rxjs';
import SockJS from 'sockjs-client';
import Stomp, { Client } from 'webstomp-client';

import { websocketActivityMessage } from 'app/modules/administration/administration.reducer';
import { getAccount, logoutSession } from 'app/shared/reducers/authentication';
import { addNotification, updateCount } from 'app/shared/reducers/notification';

let stompClient: Client | null = null;

let subscriber: any = null;
let notificationSubscriber: any = null;
let connection: Promise<any> | null = null;
let connectedPromise: ((value: string) => void) | null = null;
let listener: Observable<any> | null = null;
let notificationListener: Observable<any> | null = null;
let listenerObserver: any;
let notificationListenerObserver: any;
let alreadyConnectedOnce = false;

const createConnection = (): Promise<any> => new Promise(resolve => (connectedPromise = resolve));

const createListener = (): Observable<any> =>
  new Observable(observer => {
    listenerObserver = observer;
  });

const createNotificationListener = (): Observable<any> =>
  new Observable(observer => {
    notificationListenerObserver = observer;
  });

export const sendActivity = (page: string) => {
  connection?.then(() => {
    stompClient?.send(
      '/topic/activity', // destination
      JSON.stringify({ page }), // body
      {}, // header
    );
  });
};

const subscribe = () => {
  connection?.then(() => {
    if (stompClient) {
      subscriber = stompClient.subscribe('/topic/tracker', data => {
        listenerObserver.next(JSON.parse(data.body));
      });
    }
  });
};

const subscribeToNotifications = () => {
  connection?.then(() => {
    if (stompClient) {
      notificationSubscriber = stompClient.subscribe(`/user/queue/notifications`, data => {
        notificationListenerObserver.next(JSON.parse(data.body));
      });
    }
  });
};

const connect = () => {
  if (connectedPromise !== null || alreadyConnectedOnce) {
    // the connection is already being established
    return;
  }
  connection = createConnection();
  listener = createListener();
  notificationListener = createNotificationListener();

  // building absolute path so that websocket doesn't fail when deploying with a context path
  const loc = globalThis.location;
  const baseHref = document.querySelector('base')?.getAttribute('href')?.replace(/\/$/, '') || '';

  const headers: Record<string, string> = {};
  let url = `//${loc.host}${baseHref}/websocket/tracker`;
  const authToken = Storage.local.get('jhi-authenticationToken') || Storage.session.get('jhi-authenticationToken');
  if (authToken) {
    url += `?access_token=${authToken}`;
  }
  const socket = new SockJS(url);
  stompClient = Stomp.over(socket, { protocols: ['v12.stomp'] });

  stompClient.connect(headers, () => {
    if (connectedPromise) {
      connectedPromise('success');
    }
    connectedPromise = null;
    sendActivity(globalThis.location.pathname);
    alreadyConnectedOnce = true;
  });
};

const disconnect = () => {
  if (stompClient !== null && stompClient.connected) {
    stompClient.disconnect();
  }
  stompClient = null;
  alreadyConnectedOnce = false;
  notificationSubscriber = null;
};

const receive = (): Observable<any> => listener || new Observable(() => {});

const receiveNotifications = (): Observable<any> => notificationListener || new Observable(() => {});

const unsubscribe = () => {
  if (subscriber !== null) {
    subscriber.unsubscribe();
  }
  if (notificationSubscriber !== null) {
    notificationSubscriber.unsubscribe();
  }
  listener = createListener();
  notificationListener = createNotificationListener();
};

export default store => next => action => {
  if (getAccount.fulfilled.match(action)) {
    const userId = action.payload.data.id;
    connect();
    const isAdmin = action.payload.data.authorities.includes('ROLE_ADMIN');

    // Wait for connection to be established before subscribing
    connection?.then(() => {
      if (isAdmin && !alreadyConnectedOnce) {
        subscribe();
        receive().subscribe(activity => {
          return store.dispatch(websocketActivityMessage(activity));
        });
      }
      // Subscribe to notifications for all users after connection is ready
      if (userId && !alreadyConnectedOnce) {
        subscribeToNotifications();
        receiveNotifications().subscribe(notification => {
          if (notification.type === 'COUNT_UPDATE') {
            store.dispatch(updateCount(notification.count));
          } else {
            store.dispatch(addNotification(notification));
          }
        });
      }
    });
  } else if (getAccount.rejected.match(action) || action.type === logoutSession().type) {
    unsubscribe();
    disconnect();
  }
  return next(action);
};
