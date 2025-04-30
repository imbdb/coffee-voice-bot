import { useState, useCallback } from "react";
import { NLPJSResponseEngine } from "./nlpjs";

// This is a modular response engine interface
// You can replace this with any external system that processes text and returns responses
export interface ResponseEngine {
  generateResponse: (text: string) => Promise<string>;
}

// Default implementation for demo purposes
// This can be swapped out with any other implementation that matches the interface
class DefaultResponseEngine implements ResponseEngine {
  private greetings = ["hello", "hi", "hey", "greetings", "howdy"];
  private farewells = ["bye", "goodbye", "see you", "later", "farewell"];

  async generateResponse(text: string): Promise<string> {
    const lowerText = text.toLowerCase();

    // Simple greeting detection
    if (this.greetings.some((greeting) => lowerText.includes(greeting))) {
      return "Hello there! How can I help you today?";
    }

    // Simple farewell detection
    if (this.farewells.some((farewell) => lowerText.includes(farewell))) {
      return "Goodbye! Feel free to talk to me again whenever you want.";
    }

    // Check for questions
    if (
      lowerText.includes("who are you") ||
      lowerText.includes("what are you")
    ) {
      return "I'm a voice assistant created to demonstrate the Web Speech API. I can listen to you and respond to your questions.";
    }

    if (lowerText.includes("time")) {
      return `The current time is ${new Date().toLocaleTimeString()}.`;
    }

    if (lowerText.includes("date")) {
      return `Today is ${new Date().toLocaleDateString()}.`;
    }

    if (lowerText.includes("weather")) {
      return "I'm sorry, I don't have access to weather information at the moment.";
    }

    if (lowerText.includes("help")) {
      return "I can respond to basic greetings, tell you the time and date, and answer simple questions. What would you like to know?";
    }

    // Default response
    return "I heard what you said, but I'm not sure how to respond to that yet. My capabilities are limited, but I'm designed to be easily extended with more advanced response systems.";
  }
}

// Hook to use the response engine
export const useResponseEngine = (): ResponseEngine => {
  const [engine] = useState<ResponseEngine>(new NLPJSResponseEngine());

  // You can add methods here to swap out the engine implementation
  // For example, to connect to a different backend service

  const generateResponse = useCallback(
    async (text: string) => {
      return engine.generateResponse(text);
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
