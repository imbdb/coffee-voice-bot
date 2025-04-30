import React, { useEffect } from 'react';
import { useSpeech } from '../context/SpeechContext';
import { useMessages } from '../context/MessageContext';
import { useTheme } from '../context/ThemeContext';
import Header from './Header';
import MessageList from './MessageList';
import SpeechControls from './SpeechControls';
import SpeechStatus from './SpeechStatus';
import Settings from './Settings';

const ConversationUI: React.FC = () => {
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    error 
  } = useSpeech();
  
  const { 
    messages, 
    addUserMessage, 
    isSettingsOpen, 
    toggleSettings 
  } = useMessages();
  
  const { theme } = useTheme();

  // Handle transcript and add user message when user stops speaking
  useEffect(() => {
    if (!isListening && transcript) {
      addUserMessage(transcript);
    }
  }, [isListening, transcript, addUserMessage]);

  return (
    <div className={`flex flex-col h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <Header toggleSettings={toggleSettings} />
      
      <main className="flex-grow overflow-hidden flex flex-col relative">
        <MessageList />
        
        <div className="absolute bottom-0 left-0 right-0">
          <SpeechStatus />
          
          <div className="container mx-auto px-4 pb-4">
            <SpeechControls 
              isListening={isListening}
              startListening={startListening}
              stopListening={stopListening}
              error={error}
            />
          </div>
        </div>
      </main>
      
      {isSettingsOpen && <Settings />}
    </div>
  );
};

export default ConversationUI;