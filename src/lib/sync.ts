/**
 * Cross-window synchronisation between the audience window and the
 * presenter window (opened with the "P" key). Same-origin only.
 */
export type SyncMessage =
  | { type: 'state'; index: number; step: number }
  | { type: 'hello' }
  | { type: 'command'; command: 'next' | 'prev' }
  | { type: 'goto'; index: number; step?: number };

const CHANNEL_NAME = 'est-presentation-sync';

export function createSyncChannel(onMessage: (msg: SyncMessage) => void) {
  if (typeof BroadcastChannel === 'undefined') {
    return { post: (_msg: SyncMessage) => {}, close: () => {} };
  }
  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.onmessage = (event: MessageEvent<SyncMessage>) => onMessage(event.data);
  return {
    post: (msg: SyncMessage) => channel.postMessage(msg),
    close: () => channel.close(),
  };
}

export function openPresenterWindow() {
  const url = `${window.location.pathname}?view=presenter${window.location.hash}`;
  window.open(url, 'est-presenter', 'width=1280,height=800');
}
