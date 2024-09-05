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
        id="fig-room"
        /**
         * initialPresence is used to initialize the presence of the current
         * user in the room.
         *
         * initialPresence: https://liveblocks.io/docs/api-reference/liveblocks-react#RoomProvider
         */
        initialPresence={{ cursor: null, cursorColor: null, editingText: null }}
        /**
         * initialStorage is used to initialize the storage of the room.
         *
         * initialStorage: https://liveblocks.io/docs/api-reference/liveblocks-react#RoomProvider
         */
        initialStorage={{
          /**
           * We're using a LiveMap to store the canvas objects
           *
           * LiveMap: https://liveblocks.io/docs/api-reference/liveblocks-client#LiveMap
           */
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
