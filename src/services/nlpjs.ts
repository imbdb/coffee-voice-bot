/* eslint-disable @typescript-eslint/no-explicit-any */
import { containerBootstrap } from "@nlpjs/core";
import { Nlp } from "@nlpjs/nlp";
import { LangEn } from "@nlpjs/lang-en-min";
import { Ner } from "@nlpjs/ner";

import { ResponseEngine } from "./responseEngine";

export class NLPJSResponseEngine implements ResponseEngine {
  container: any;
  nlp: any;
  lang: any;
  isTrained: boolean = false;
  ner: any;
  constructor() {}

  async trainNLP() {
    try {
      if (this.isTrained) {
        console.log("NLP is already trained.");
        return;
      }

      this.container = await containerBootstrap();
      this.container.use(Nlp);
      this.container.use(LangEn);
      this.container.use(Ner);
      this.nlp = this.container.get("nlp");
      this.nlp.settings.autoSave = false;
      this.nlp.addLanguage("en");
      this.ner = this.container.get("ner");
      console.log(this.ner);
      // Adds the utterances and intents for the NLP
      this.nlp.addDocument("en", "goodbye for now", "greetings.bye");
      this.nlp.addDocument("en", "bye bye take care", "greetings.bye");
      this.nlp.addDocument("en", "okay see you later", "greetings.bye");
      this.nlp.addDocument("en", "bye for now", "greetings.bye");
      this.nlp.addDocument("en", "i must go", "greetings.bye");
      this.nlp.addDocument("en", "hello", "greetings.hello");
      this.nlp.addDocument("en", "hi", "greetings.hello");
      this.nlp.addDocument("en", "howdy", "greetings.hello");

      // Adds the utterances and intents for detecting coffee ordering
      this.nlp.addDocument("en", "I want coffee", "order.coffee.detect");
      this.nlp.addDocument(
        "en",
        "Can I get some coffee",
        "order.coffee.detect"
      );
      this.nlp.addDocument(
        "en",
        "I'd like to order coffee",
        "order.coffee.detect"
      );
      this.nlp.addDocument("en", "Give me coffee", "order.coffee.detect");
      this.nlp.addDocument("en", "I need coffee", "order.coffee.detect");

      // Adds the answers for detecting coffee ordering
      this.nlp.addAnswer(
        "en",
        "order.coffee.detect",
        "What type of coffee would you like? Latte, Espresso, Cappuccino, or Americano?"
      );

      // Adds the utterances and intents for specifying coffee type
      this.nlp.addDocument("en", "Latte", "order.coffee.type");
      this.nlp.addDocument("en", "Espresso", "order.coffee.type");
      this.nlp.addDocument("en", "Cappuccino", "order.coffee.type");
      this.nlp.addDocument("en", "Americano", "order.coffee.type");

      // Adds the answers for confirming coffee type
      this.nlp.addAnswer(
        "en",
        "order.coffee.type",
        "Got it! A {{ context.coffeeType }}. Is that correct?"
      );

      // Adds the utterances and intents for confirming the order
      this.nlp.addDocument("en", "Yes", "order.coffee.confirm");
      this.nlp.addDocument("en", "That's correct", "order.coffee.confirm");
      this.nlp.addDocument("en", "Sure", "order.coffee.confirm");

      // Adds the answers for confirming the order
      this.nlp.addAnswer(
        "en",
        "order.coffee.confirm",
        "Thank you! Your {{ context.coffeeType }} will be ready soon."
      );

      await this.nlp.train();
      this.isTrained = true;
      console.log("NLP trained successfully.");
    } catch (error) {
      console.error("Error training NLP:", error);
    }
  }

  async generateResponse(text: string): Promise<string> {
    try {
      if (!this.isTrained) {
        await this.trainNLP();
      }
      const response = await this.nlp.process("en", text);
      console.log(response);
      return (
        response.answer || "I didn't understand that. Can you please rephrase?"
      );
    } catch (error) {
      console.error("Error generating response:", error);
      return "Sorry, I encountered an error while processing your request.";
    }
  }
}
