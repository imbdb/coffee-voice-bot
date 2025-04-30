import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useMessages } from './MessageContext';
import { useResponseEngine } from '../services/responseEngine';

interface SpeechContextProps {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  rate: number;
  pitch: number;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => void;
  setSelectedVoice: (voice: SpeechSynthesisVoice) => void;
  setRate: (rate: number) => void;
  setPitch: (pitch: number) => void;
}

const SpeechContext = createContext<SpeechContextProps | undefined>(undefined);

interface SpeechProviderProps {
  children: ReactNode;
}

export const SpeechProvider: React.FC<SpeechProviderProps> = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [error, setError] = useState<string | null>(null);
  
  const { generateResponse } = useResponseEngine();
  const { addBotMessage } = useMessages();
  
  // Initialize voices once speech synthesis is available
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        // Try to find an English voice as default
        const englishVoice = availableVoices.find(voice => 
          voice.lang.includes('en-') && voice.localService
        );
        setSelectedVoice(englishVoice || availableVoices[0]);
      }
    };
    
    // Load initial voices
    loadVoices();
    
    // Chrome loads voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    return () => {
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);
  
  // Initialize speech recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser. Try Chrome, Edge, or Safari.');
      return;
    }
    
    // @ts-ignore - handle browser compatibility
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'en-US';
    
    recognitionInstance.onstart = () => {
      setIsListening(true);
      setError(null);
    };
    
    recognitionInstance.onend = () => {
      setIsListening(false);
    };
    
    recognitionInstance.onerror = (event: any) => {
      if (event.error === 'no-speech') {
        // This is common and not really an error, so we'll ignore it
        return;
      }
      
      let errorMessage = 'An error occurred with speech recognition.';
      
      if (event.error === 'audio-capture') {
        errorMessage = 'No microphone was detected. Please ensure your microphone is connected.';
      } else if (event.error === 'not-allowed') {
        errorMessage = 'Microphone permission was denied. Please allow microphone access to use this feature.';
      }
      
      setError(errorMessage);
      setIsListening(false);
    };
    
    recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        }
      }
      
      if (finalTranscript) {
        setTranscript(finalTranscript);
      }
    };
    
    setRecognition(recognitionInstance);
    
    return () => {
      if (recognitionInstance) {
        recognitionInstance.onend = null;
        recognitionInstance.onstart = null;
        recognitionInstance.onerror = null;
        recognitionInstance.onresult = null;
        recognitionInstance.abort();
      }
    };
  }, []);
  
  // Handle response to user speech
  useEffect(() => {
    const handleResponse = async () => {
      if (!isListening && transcript) {
        const response = await generateResponse(transcript);
        addBotMessage(response);
        speak(response);
        setTranscript('');
      }
    };
    
    handleResponse();
  }, [isListening, transcript, addBotMessage, generateResponse]);
  
  // Speech synthesis function
  const speak = useCallback((text: string) => {
    if (!text) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.rate = rate;
    utterance.pitch = pitch;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  }, [selectedVoice, rate, pitch]);
  
  // Start listening function
  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      try {
        recognition.start();
      } catch (e) {
        // If recognition is already started, restart it
        recognition.stop();
        setTimeout(() => recognition.start(), 100);
      }
    }
  }, [recognition, isListening]);
  
  // Stop listening function
  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
    }
  }, [recognition, isListening]);
  
  return (
    <SpeechContext.Provider
      value={{
        isListening,
        isSpeaking,
        transcript,
        voices,
        selectedVoice,
        rate,
        pitch,
        error,
        startListening,
        stopListening,
        speak,
        setSelectedVoice,
        setRate,
        setPitch
      }}
    >
      {children}
    </SpeechContext.Provider>
  );
};

export const useSpeech = () => {
  const context = useContext(SpeechContext);
  if (context === undefined) {
    throw new Error('useSpeech must be used within a SpeechProvider');
  }
  return context;
};