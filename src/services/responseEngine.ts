import { useState, useCallback } from "react";
import { NLPJSResponseEngine } from "./nlpjs";

// This is a modular response engine interface
// You can replace this with any external system that processes text and returns responses
export interface ResponseEngine {
  generateResponse: (lang: string, text: string) => Promise<string>;
}

// Default implementation for demo purposes
// This can be swapped out with any other implementation that matches the interface
class DefaultResponseEngine implements ResponseEngine {
  private greetings = {
    en: ["hello", "hi", "hey", "greetings", "howdy"],
    hi: ["नमस्ते", "हाय", "हैलो"],
  };

  private farewells = {
    en: ["bye", "goodbye", "see you", "later", "farewell"],
    hi: ["अलविदा", "फिर मिलेंगे", "बाय"],
  };

  async generateResponse(lang: string, text: string): Promise<string> {
    const lowerText = text.toLowerCase();

    // Simple greeting detection
    if (
      this.greetings[lang as keyof typeof this.greetings].some((greeting) =>
        lowerText.includes(greeting)
      )
    ) {
      return lang === "en"
        ? "Hello there! How can I help you today?"
        : "नमस्ते! मैं आपकी कैसे मदद कर सकता हूं?";
    }

    // Simple farewell detection
    if (
      this.farewells[lang as keyof typeof this.farewells].some((farewell) =>
        lowerText.includes(farewell)
      )
    ) {
      return lang === "en"
        ? "Goodbye! Feel free to talk to me again whenever you want."
        : "अलविदा! जब भी चाहें मुझसे बात कर सकते हैं।";
    }

    // Check for questions
    if (
      lowerText.includes("who are you") ||
      lowerText.includes("what are you") ||
      lowerText.includes("तुम कौन हो") ||
      lowerText.includes("आप कौन हैं")
    ) {
      return lang === "en"
        ? "I'm a voice assistant created to demonstrate the Web Speech API. I can listen to you and respond to your questions."
        : "मैं एक वॉइस असिस्टेंट हूं जो वेब स्पीच API का प्रदर्शन करने के लिए बनाया गया है। मैं आपकी बात सुन सकता हूं और आपके सवालों का जवाब दे सकता हूं।";
    }

    if (lowerText.includes("time") || lowerText.includes("समय")) {
      return lang === "en"
        ? `The current time is ${new Date().toLocaleTimeString()}.`
        : `वर्तमान समय ${new Date().toLocaleTimeString()} है।`;
    }

    if (
      lowerText.includes("date") ||
      lowerText.includes("तारीख") ||
      lowerText.includes("दिनांक")
    ) {
      return lang === "en"
        ? `Today is ${new Date().toLocaleDateString()}.`
        : `आज ${new Date().toLocaleDateString()} है।`;
    }

    if (lowerText.includes("weather") || lowerText.includes("मौसम")) {
      return lang === "en"
        ? "I'm sorry, I don't have access to weather information at the moment."
        : "क्षमा करें, मेरे पास इस समय मौसम की जानकारी नहीं है।";
    }

    if (lowerText.includes("help") || lowerText.includes("मदद")) {
      return lang === "en"
        ? "I can respond to basic greetings, tell you the time and date, and answer simple questions. What would you like to know?"
        : "मैं बुनियादी अभिवादन का जवाब दे सकता हूं, आपको समय और तारीख बता सकता हूं, और सरल सवालों का जवाब दे सकता हूं। आप क्या जानना चाहेंगे?";
    }

    // Default response
    return lang === "en"
      ? "I heard what you said, but I'm not sure how to respond to that yet. My capabilities are limited, but I'm designed to be easily extended with more advanced response systems."
      : "मैंने आपकी बात सुनी, लेकिन मैं अभी इसका जवाब देने में असमर्थ हूं। मेरी क्षमताएं सीमित हैं, लेकिन मुझे उन्नत प्रतिक्रिया प्रणालियों के साथ आसानी से विस्तारित करने के लिए डिज़ाइन किया गया है।";
  }
}

// Hook to use the response engine
export const useResponseEngine = (): ResponseEngine => {
  const [engine] = useState<ResponseEngine>(new NLPJSResponseEngine());

  // You can add methods here to swap out the engine implementation
  // For example, to connect to a different backend service

  const generateResponse = useCallback(
    async (lang: string, text: string) => {
      return engine.generateResponse(lang, text);
    },
    [engine]
  );

  return { generateResponse };
};

// Example of how to create a custom response engine:
/*
export class CustomResponseEngine implements ResponseEngine {
  private apiUrl: string;
  
  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }
  
  async generateResponse(text: string): Promise<string> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: text }),
      });
      
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error generating response:', error);
      return "Sorry, I encountered an error while processing your request.";
    }
  }
}
*/
