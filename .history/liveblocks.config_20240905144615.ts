import { LiveMap, createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";
import { ReactionEvent } from "./types/type";
// Initialize the client with the public API key
const client = createClient({
  throttle: 16,
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
});

// Define the types for Presence, Storage, UserMeta, RoomEvent, and ThreadMetadata
export type Presence = {
  // Add properties here if needed
  cursor: { x: number; y: number };
  message: string | "";
};

type Storage = {
  canvasObjects: LiveMap<string, any>;
};

type UserMeta = {
  // Add properties here if needed
};

type RoomEvent = ReactionEvent;

export type ThreadMetadata = {
  resolved: boolean;
  zIndex: number;
  time?: number;
  x: number;
  y: number;
};

// Create Room Context with the defined types
export const {
  suspense: {
    RoomProvider,
    useRoom,
    useMyPresence,
    useUpdateMyPresence,
    useSelf,
    useOthers,
    useOthersMapped,
    useOthersConnectionIds,
    useOther,
    useBroadcastEvent,
    useEventListener,
    useErrorListener,
    useStorage,
    useObject,
    useMap,
    useList,
    useBatch,
    useHistory,
    useUndo,
    useRedo,
    useCanUndo,
    useCanRedo,
    useMutation,
    useStatus,
    useLostConnectionListener,
    useThreads,
    useUser,
    useCreateThread,
    useEditThreadMetadata,
    useCreateComment,
    useEditComment,
    useDeleteComment,
    useAddReaction,
    useRemoveReaction,
  },
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent, ThreadMetadata>(
  client,
  {
    async resolveUsers({ userIds }) {
      // Resolve user information from userIds for Comments
      return [];
    },
    async resolveMentionSuggestions({ text, roomId }) {
      // Resolve mention suggestions based on text and roomId
      return [];
    },
  }
);
