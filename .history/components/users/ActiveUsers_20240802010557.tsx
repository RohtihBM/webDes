// App.js or App.tsx
import React, { useMemo } from "react";
import Avatar from "./Avatar"; // Ensure correct import path
import { useOthers, useSelf } from "@liveblocks/react";
const users = useOthers;
const currUser = useSelf;
const hasMoreUsers = users.length > 3;

const memoisedUsers=useMemo(()=>{
    <div className="flex items-center gap-1 justify-center">
    <div className="flex pl-3 ">
      
    </div>
  </div>
},[users.length])

const ActiveUsers = () => (
  
);

export default ActiveUsers;
