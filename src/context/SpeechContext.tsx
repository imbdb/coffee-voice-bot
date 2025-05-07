import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useMessages } from "./MessageContext";
import { useResponseEngine } from "../services/responseEngine";
import { useLanguage } from "../hooks/useLanguage";

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

export const SpeechContext = createContext<SpeechContextProps | undefined>(
  undefined
);

interface SpeechProviderProps {
  children: ReactNode;
}

// Helper function for speech context to avoid Fast Refresh error
const createSpeechContextValue = (
  props: SpeechContextProps
): SpeechContextProps => props;

export const SpeechProvider: React.FC<SpeechProviderProps> = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(
    null
  );
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] =
    useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [error, setError] = useState<string | null>(null);

  const { generateResponse } = useResponseEngine();
  const { addBotMessage } = useMessages();
  const { language } = useLanguage();

  // Speech synthesis function with improved error handling
  const speak = useCallback(
    (text: string) => {
      if (!text) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.lang = language === "en" ? "en-US" : "hi-IN";

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
        console.error("Speech synthesis error:", event);
        setIsSpeaking(false);
        setError("Error occurred while speaking. Please try again.");
      };

      window.speechSynthesis.speak(utterance);
    },
    [selectedVoice, rate, pitch, language]
  );

  // Initialize voices and handle language changes
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);

        // Find appropriate voice for current language
        const langCode = language === "en" ? "en-" : "hi-";
        const languageVoice =
          availableVoices.find(
            (voice) => voice.lang.startsWith(langCode) && voice.localService
          ) || availableVoices.find((voice) => voice.lang.startsWith(langCode));

        if (languageVoice) {
          setSelectedVoice(languageVoice);
        } else {
          // Fallback to any available voice if no matching language found
          setSelectedVoice(availableVoices[0]);
        }
      }
    };

    loadVoices();

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [language]);

  // Initialize speech recognition with language support
  useEffect(() => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      setError(
        "Speech recognition is not supported in this browser. Try Chrome, Edge, or Safari."
      );
      return;
    }

    // @ts-expect-error - Browser compatibility for SpeechRecognition
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognitionAPI();

    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = language === "en" ? "en-US" : "hi-IN";

    recognitionInstance.onstart = () => {
      setIsListening(true);
      setError(null);
      setTranscript("");
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "no-speech") {
        return;
      }

      let errorMessage = "An error occurred with speech recognition.";

      if (event.error === "audio-capture") {
        errorMessage =
          "No microphone was detected. Please ensure your microphone is connected.";
      } else if (event.error === "not-allowed") {
        errorMessage =
          "Microphone permission was denied. Please allow microphone access to use this feature.";
      } else if (event.error === "language-not-supported") {
        errorMessage = `Speech recognition is not available for ${
          language === "en" ? "English" : "Hindi"
        } on this device.`;
      }

      setError(errorMessage);
      setIsListening(false);
    };

    recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript);
      } else if (interimTranscript) {
        setTranscript(interimTranscript);
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
  }, [language]);

  // Handle response to user speech
  useEffect(() => {
    const handleResponse = async () => {
      if (!isListening && transcript) {
        const response = await generateResponse(language, transcript);
        addBotMessage(response);
        speak(response);
        setTranscript("");
      }
    };

    handleResponse();
  }, [isListening, transcript, addBotMessage, generateResponse, speak]);

  // Start listening function with retry logic
  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      try {
        recognition.lang = language === "en" ? "en-US" : "hi-IN";
        recognition.start();
      } catch (error) {
        // Log the initial error for debugging
        console.debug("Recognition restart needed:", error);
        // If recognition is already started, restart it
        recognition.stop();
        setTimeout(() => {
          try {
            recognition.start();
          } catch (retryError) {
            console.error(
              "Error starting recognition after retry:",
              retryError
            );
            setError(
              "Failed to start speech recognition. Please refresh the page."
            );
          }
        }, 100);
      }
    }
  }, [recognition, isListening, language]);

  // Stop listening function
  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
    }
  }, [recognition, isListening]);

  const contextValue = createSpeechContextValue({
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
    setPitch,
  });

  return (
    <SpeechContext.Provider value={contextValue}>
      {children}
    </SpeechContext.Provider>
  );
};
