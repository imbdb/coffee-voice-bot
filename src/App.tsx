import React from 'react';
import ConversationUI from './components/ConversationUI';
import { SpeechProvider } from './context/SpeechContext';
import { MessageProvider } from './context/MessageContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <MessageProvider>
        <SpeechProvider>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <ConversationUI />
          </div>
        </SpeechProvider>
      </MessageProvider>
    </ThemeProvider>
  );
}

export default App;