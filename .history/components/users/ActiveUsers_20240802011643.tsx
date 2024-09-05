// App.js or App.tsx
import React, { useMemo } from "react";
import Avatar from "./Avatar"; // Ensure correct import path
import { useOthers, useSelf } from "@liveblocks/react";
const ActiveUsers = () => {
  const users = useOthers;
  const currUser = useSelf();
  const hasMoreUsers = users.length > 3;

  const memoisedUsers = useMemo(() => {
    <div className="flex items-center gap-1 justify-center">
      <div className="flex pl-3 ">
        {currUser && (
          <Avatar name="you" otherStyles="border-[3px] border-primary-green" />
        )}
        {users.slice(0, 3).map(({ connectionId }) => (
          <Avatar key={connectionId} name="others" otherStyles="-ml-3" />
        ))}

        {hasMoreUsers && <div className={styles.more}>+{users.length - 3}</div>}
      </div>
    </div>;
  }, [currUser, hasMoreUsers, users]);

  return memoisedUsers;
};

export default ActiveUsers;
