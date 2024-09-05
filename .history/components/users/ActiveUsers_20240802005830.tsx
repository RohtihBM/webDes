// ActiveUsers.js or ActiveUsers.tsx
import React from "react";
import Avatar from "./Avatar"; // Ensure correct import path

type User = {
  id: string;
  name: string;
};

type Props = {
  users: User[];
};

const ActiveUsers = ({ users }: Props) => (
  <div className="active-users">
    {users.map((user) => (
      <Avatar key={user.id} name={user.name} otherStyles="custom-class" />
    ))}
  </div>
);

export default ActiveUsers;
