import { CursorChatProps } from "@/types/type";
import React from "react";

const CursorChat = ({
  cursor,
  cursorState,
  setCursorState,
  updateMyPresence,
}: CursorChatProps) => {
  return (
    <div
      className="absolute top-0 left-0"
      style={{
        transform: `translateX(${cursor.x}px) translateY(${cursor.y}px)`,
      }}
    >
      {/* Show message input when cursor is in chat mode */}

      {/* Custom Cursor shape */}
      <CursorSVG color="#000" />

      <div
        className="absolute left-2 top-5 bg-blue-500 px-4 py-2 text-sm leading-relaxed text-white"
        onKeyUp={(e) => e.stopPropagation()}
        style={{
          borderRadius: 20,
        }}
      >
        {/**
         * if there is a previous message, show it above the input
         *
         * We're doing this because when user press enter, we want to
         * show the previous message at top and the input at bottom
         */}
        {cursorState.previousMessage && (
          <div>{cursorState.previousMessage}</div>
        )}
        <input
          className="z-10 w-60 border-none	bg-transparent text-white placeholder-blue-300 outline-none"
          autoFocus={true}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={cursorState.previousMessage ? "" : "Say something…"}
          value={cursorState.message}
          maxLength={50}
        />
      </div>
    </div>
  );
};

export default CursorChat;
