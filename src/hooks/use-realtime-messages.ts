"use client";

import { useEffect, useRef } from "react";
import { listenToMessages } from "@/lib/echo";

/**
 * Subscribe to the private `conversation.{uuid}` channel and invoke
 * `onMessage` for every incoming message. Falls back silently when
 * Reverb/Echo is unavailable (e.g. env not configured).
 */
export function useRealtimeMessages(
  uuid: string | null | undefined,
  onMessage: (msg: any) => void
) {
  const cbRef = useRef(onMessage);
  cbRef.current = onMessage;

  useEffect(() => {
    if (!uuid) return;
    let cleanup: (() => void) | null = null;
    try {
      cleanup = listenToMessages(uuid, (data: any) => {
        const msg = data?.message;
        if (msg && msg.id != null) cbRef.current(msg);
      });
    } catch {
      // WebSocket unavailable — polling fallback still applies elsewhere
    }
    return () => {
      try {
        cleanup?.();
      } catch {
        // ignore
      }
    };
  }, [uuid]);
}
