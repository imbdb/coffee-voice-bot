import React from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

interface SpeechControlsProps {
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  error: string | null;
}

const SpeechControls: React.FC<SpeechControlsProps> = ({
  isListening,
  startListening,
  stopListening,
  error
}) => {
  return (
    <div className="flex flex-col items-center">
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      <button
        onClick={isListening ? stopListening : startListening}
        disabled={!!error}
        className={`
          ${isListening 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-blue-500 hover:bg-blue-600'} 
          ${error ? 'opacity-50 cursor-not-allowed' : ''}
          text-white p-5 rounded-full shadow-lg transform transition-all
          hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2
          focus:ring-blue-500
        `}
        aria-label={isListening ? 'Stop listening' : 'Start listening'}
      >
        {isListening ? (
          <MicOff className="h-8 w-8" />
        ) : (
          <Mic className="h-8 w-8" />
        )}
      </button>
    </div>
  );
};

export default SpeechControls;