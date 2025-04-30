import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Message {
  type: 'user' | 'bot';
  content: string;
}

interface MessageContextProps {
  messages: Message[];
  addUserMessage: (text: string) => void;
  addBotMessage: (text: string) => void;
  clearMessages: () => void;
  isSettingsOpen: boolean;
  toggleSettings: () => void;
}

const MessageContext = createContext<MessageContextProps | undefined>(undefined);

interface MessageProviderProps {
  children: ReactNode;
}

export const MessageProvider: React.FC<MessageProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const addUserMessage = useCallback((text: string) => {
    setMessages(prev => [...prev, { type: 'user', content: text }]);
  }, []);
  
  const addBotMessage = useCallback((text: string) => {
    setMessages(prev => [...prev, { type: 'bot', content: text }]);
  }, []);
  
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);
  
  const toggleSettings = useCallback(() => {
    setIsSettingsOpen(prev => !prev);
  }, []);
  
  return (
    <MessageContext.Provider
      value={{
        messages,
        addUserMessage,
        addBotMessage,
        clearMessages,
        isSettingsOpen,
        toggleSettings
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
};