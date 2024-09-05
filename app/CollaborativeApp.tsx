"use client";

import { useOthers } from "@liveblocks/react/suspense";

export function CollaborativeApp() {
  const others = useOthers(); // helps to check whether any other uses are present in our room
  const userCount = others.length;
  return <div>There are {userCount} other user(s) online</div>;
}
