import React, { useMemo } from "react";
import Avatar from "./Avatar"; // Ensure correct import path
import { useOthers, useSelf } from "@liveblocks/react";
import styles from "../Reaction/index.module.css";

const ActiveUsers = () => {
  const users = useOthers(); // Call the hook to get the actual value
  const currUser = useSelf();
  const hasMoreUsers = users.length > 3;

  // Memoize the JSX to avoid unnecessary re-renders
  const memoisedUsers = useMemo(
    () => (
      <div className="flex items-center gap-1 justify-center">
        <div className="flex pl-3">
          {currUser && (
            <Avatar
              name="you"
              otherStyles="border-[3px] border-primary-green"
            />
          )}
          {users.slice(0, 3).map(({ connectionId }) => (
            <Avatar key={connectionId} name="others" otherStyles="-ml-3" />
          ))}
          {hasMoreUsers && (
            <div className={styles.more}>+{users.length - 3}</div>
          )}
        </div>
      </div>
    ),
    [currUser, hasMoreUsers, users]
  );

  return memoisedUsers;
};

export default ActiveUsers;
