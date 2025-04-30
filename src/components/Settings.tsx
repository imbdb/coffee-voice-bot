import React from 'react';
import { X } from 'lucide-react';
import { useSpeech } from '../context/SpeechContext';
import { useMessages } from '../context/MessageContext';

const Settings: React.FC = () => {
  const { voices, selectedVoice, setSelectedVoice, rate, setRate, pitch, setPitch } = useSpeech();
  const { toggleSettings } = useMessages();
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Settings</h2>
          <button 
            onClick={toggleSettings}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close settings"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        <div className="p-4 space-y-6">
          {/* Voice selection */}
          <div className="space-y-2">
            <label htmlFor="voice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Voice
            </label>
            <select
              id="voice"
              value={selectedVoice?.voiceURI || ''}
              onChange={(e) => {
                const voice = voices.find(v => v.voiceURI === e.target.value);
                if (voice) setSelectedVoice(voice);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {voices.map((voice) => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>
          
          {/* Speech rate */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label htmlFor="rate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Speech Rate
              </label>
              <span className="text-sm text-gray-500 dark:text-gray-400">{rate.toFixed(1)}</span>
            </div>
            <input
              id="rate"
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-md appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Slow</span>
              <span>Normal</span>
              <span>Fast</span>
            </div>
          </div>
          
          {/* Speech pitch */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label htmlFor="pitch" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Speech Pitch
              </label>
              <span className="text-sm text-gray-500 dark:text-gray-400">{pitch.toFixed(1)}</span>
            </div>
            <input
              id="pitch"
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-md appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Low</span>
              <span>Normal</span>
              <span>High</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;