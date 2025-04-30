import React from 'react';
import { useSpeech } from '../context/SpeechContext';

const SpeechStatus: React.FC = () => {
  const { isListening, isSpeaking, transcript } = useSpeech();
  
  return (
    <div className="container mx-auto px-4 mb-4">
      {/* Visualization container */}
      {isListening && (
        <div className="flex justify-center mb-2">
          <div className="flex items-center space-x-1 h-12">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="bg-blue-500 w-2 rounded-full animate-sound-wave"
                style={{
                  height: `${Math.random() * 100}%`,
                  animationDelay: `${index * 0.1}s`
                }}
              ></div>
            ))}
          </div>
        </div>
      )}
      
      {/* Status text */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 h-6 mb-2">
        {isListening && (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span>Listening...</span>
          </div>
        )}
        {isSpeaking && (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span>Speaking...</span>
          </div>
        )}
      </div>
      
      {/* Transcript display */}
      {isListening && transcript && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 max-w-lg mx-auto">
          <p className="text-gray-800 dark:text-white text-sm">
            {transcript}
          </p>
        </div>
      )}
    </div>
  );
};

export default SpeechStatus;