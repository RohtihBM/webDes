// App.js or App.tsx
import React from "react";
import Avatar from "./Avatar"; // Ensure correct import path

const users = [
  { id: "1", name: "Alice" },
  { id: "2", name: "Bob" },
];

const App = () => (
  <div>
    <div className="active-users">
      {users.map((user) => (
        <Avatar key={user.id} name={user.name} otherStyles="custom-class" />
      ))}
    </div>
  </div>
);

export default App;
