// App.js or App.tsx
import React from "react";
import Avatar from "./Avatar"; // Ensure correct import path
import { useOthers, useSelf } from "@liveblocks/react";
const users = useOthers;
const currUser = useSelf;
const hasMoreUsers = users.length > 3;

const ActiveUsers = () => (
  <div>
    <div className="active-users flex py-6 ">
      {users.map((user) => (
        <Avatar
          key={user.id}
          name={user.name}
          otherStyles="custom-class -ml-2"
        />
      ))}
    </div>
  </div>
);

export default ActiveUsers;
