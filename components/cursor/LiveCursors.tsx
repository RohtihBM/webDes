import Cursor from "./Cursor";
import { COLORS } from "@/constants";
import { useOthers } from "@liveblocks/react";

type CursorType = {
  x: number;
  y: number;
};

// display all other live cursors
const LiveCursors = () => {
  const others = useOthers();
  return others.map(({ connectionId, presence }) => {
    const cursor = presence?.cursor as CursorType | undefined;

    if (!cursor) {
      return null;
    }

    return (
      <Cursor
        key={connectionId}
        color={COLORS[Number(connectionId) % COLORS.length]}
        x={cursor.x}
        y={cursor.y}
        message={presence.message || ""}
      />
    );
  });
};

export default LiveCursors;
