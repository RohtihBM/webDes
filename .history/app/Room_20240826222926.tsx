"use client";

import { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { LiveMap } from "@liveblocks/client";

export function Room({ children }: { children: ReactNode }) {
  return (
    <LiveblocksProvider
      publicApiKey={
        "pk_dev_rXYZNHV9x9fF0jSn3xBkPPq8a5XutJcuw7Zx3Gl1v5hg1gitAAxPMLZevYleVKE7"
      }
    >
      <RoomProvider
        id="my-room"
        initialPresence={{ cursor: null, cursorColor: null, editingText: null }}
        initialStorage={{
          canvasObjects: new LiveMap(),
        }}
      >
        <ClientSideSuspense fallback={<div>Loading…</div>}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
