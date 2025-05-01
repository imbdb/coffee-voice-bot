import React, { useEffect, useRef } from "react";
import { useMessages } from "../context/MessageContext";
import { User, Bot } from "lucide-react";

const MessageList: React.FC = () => {
  const { messages } = useMessages();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the most recent message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-grow overflow-y-auto px-4 py-6 space-y-4">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center px-4">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-2xl max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Welcome to Coffee Bot
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Click the microphone button and start speaking. I'll listen and
              respond to what you say.
            </p>
          </div>
        </div>
      ) : (
        messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start ${
              message.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex max-w-[80%] md:max-w-[70%] ${
                message.type === "user"
                  ? "bg-blue-500 text-white rounded-2xl rounded-tr-sm"
                  : "bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-2xl rounded-tl-sm shadow-sm"
              } px-4 py-3`}
            >
              <div className="mr-2 mt-1 flex-shrink-0">
                {message.type === "user" ? (
                  <User className="h-4 w-4 text-blue-100" />
                ) : (
                  <Bot className="h-4 w-4 text-gray-500 dark:text-gray-300" />
                )}
              </div>
              <p>{message.content}</p>
            </div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
