import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Make Pusher available globally for Echo
if (typeof window !== 'undefined') {
  (window as Window & { Pusher?: typeof Pusher }).Pusher = Pusher;
}

let echoInstance: Echo<any> | null = null;

export function getEcho(): Echo<any> | null {
  if (echoInstance) return echoInstance;

  if (typeof window === 'undefined') return null;

  const key = process.env.NEXT_PUBLIC_REVERB_APP_KEY;
  const wsHost = process.env.NEXT_PUBLIC_REVERB_HOST;
  const wsPort = parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '8080');
  const wsScheme = process.env.NEXT_PUBLIC_REVERB_SCHEME || 'ws';

  if (!key) {
    return null;
  }

  try {
    echoInstance = new Echo({
      broadcaster: 'reverb',
      key,
      wsHost: wsHost || window.location.hostname,
      wsPort,
      wssPort: wsPort,
      forceTLS: wsScheme === 'wss',
      enabledTransports: ['ws', 'wss'],
    });

    return echoInstance;
  } catch {
    return null;
  }
}

/**
 * Listen to a private channel for new messages.
 */
export function listenToMessages(
  uuid: string,
  callback: (data: any) => void
): (() => void) {
  const echo = getEcho();
  if (!echo) return () => {};

  const channel = echo.private(`conversation.${uuid}`);
  channel.listen('.MessageSent', callback);

  return () => {
    echo.leave(`conversation.${uuid}`);
  };
}

/**
 * Listen to a presence channel for online status.
 */
export function listenToPresence(
  roomName: string,
  callbacks: {
    onJoin?: (data: any) => void;
    onLeave?: (data: any) => void;
    onHere?: (data: any) => void;
  }
): (() => void) {
  const echo = getEcho();
  if (!echo) return () => {};

  const channel = echo.join(roomName);

  if (callbacks.onHere) channel.here(callbacks.onHere);
  if (callbacks.onJoin) channel.joining(callbacks.onJoin);
  if (callbacks.onLeave) channel.leaving(callbacks.onLeave);

  return () => {
    echo.leave(roomName);
  };
}
