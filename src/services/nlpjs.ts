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
  coffee: string;

  constructor() {
    this.coffee = "";
  }

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

      // Initialize NER with coffee types
      const coffeeTypes = ["Espresso", "Latte", "Cappuccino", "Americano"];
      this.nlp.addEntities({
        coffeeType: {
          options: {
            coffee: ["espresso", "latte", "cappuccino", "americano"],
          },
        },
      });

      // Add entity extraction rules
      coffeeTypes.forEach((type) => {
        this.nlp.addNerRuleOptionTexts("en", "coffeeType", type.toLowerCase(), [
          type,
          type.toLowerCase(),
          `${type.toLowerCase()} coffee`,
          `a ${type.toLowerCase()}`,
          `an ${type.toLowerCase()}`,
        ]);
      });

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

      // Add coffee type detection
      coffeeTypes.forEach((type) => {
        this.nlp.addDocument("en", type, `order.coffee.type.${type}`);
        this.nlp.addDocument(
          "en",
          `I want ${type}`,
          `order.coffee.type.${type}`
        );
        this.nlp.addDocument(
          "en",
          `I would like ${type}`,
          `order.coffee.type.${type}`
        );
        this.nlp.addDocument(
          "en",
          `I need ${type}`,
          `order.coffee.type.${type}`
        );
        this.nlp.addDocument(
          "en",
          `I want a ${type}`,
          `order.coffee.type.${type}`
        );
        this.nlp.addDocument(
          "en",
          `I would like a ${type}`,
          `order.coffee.type.${type}`
        );
        this.nlp.addDocument(
          "en",
          `I need a ${type}`,
          `order.coffee.type.${type}`
        );
        this.nlp.addDocument(
          "en",
          `${type} coffee`,
          `order.coffee.type.${type}`
        );
        this.nlp.addDocument(
          "en",
          `${type} please`,
          `order.coffee.type.${type}`
        );
        this.nlp.addAnswer(
          "en",
          `order.coffee.type.${type}`,
          `Got it! A ${type}. Is that correct?`
        );
      });

      // Adds the answers for confirming coffee type
      this.nlp.addAnswer(
        "en",
        "order.coffee.type",
        "Got it! A {{coffeeType}}. Is that correct?"
      );

      // Add confirmation intents
      this.nlp.addDocument("en", "Yes", "order.coffee.confirm");
      this.nlp.addDocument("en", "That's correct", "order.coffee.confirm");
      this.nlp.addDocument("en", "Sure", "order.coffee.confirm");
      this.nlp.addDocument("en", "Yep", "order.coffee.confirm");
      this.nlp.addDocument("en", "Yeah", "order.coffee.confirm");

      // Add negative responses
      this.nlp.addDocument("en", "No", "order.coffee.reject");
      this.nlp.addDocument("en", "That's wrong", "order.coffee.reject");
      this.nlp.addDocument("en", "Not correct", "order.coffee.reject");
      this.nlp.addDocument("en", "Nope", "order.coffee.reject");

      // Adds the answers for confirming/rejecting the order
      this.nlp.addAnswer(
        "en",
        "order.coffee.confirm",
        "Perfect! Your {{coffeeType}} will be ready soon. Have a great day!"
      );

      this.nlp.addAnswer(
        "en",
        "order.coffee.reject",
        "I apologize for the confusion. What type of coffee would you like?"
      );

      await this.nlp.train();
      this.isTrained = true;
      console.log("NLP trained successfully with entities.");
    } catch (error) {
      console.error("Error training NLP:", error);
    }
  }

  private getErrorMessage(lang: string): string {
    return lang === "en"
      ? "I'm not sure how to respond to that. Could you please try asking something else?"
      : "मैं इसका जवाब देने में असमर्थ हूं। कृपया कुछ और पूछने का प्रयास करें।";
  }

  async generateResponse(lang: string, text: string): Promise<string> {
    try {
      if (!this.isTrained) {
        await this.trainNLP();
      }
      const response = await this.nlp.process("en", text);
      console.log("NLP Response:", response);

      // Improved entity extraction
      if (
        response.classifications.length > 0 &&
        response.classifications[0].intent.startsWith("order.coffee.type.")
      ) {
        const coffeeType = response.classifications[0].intent.split(".").pop();
        this.coffee = coffeeType;
        return response.answer.replace("{{coffeeType}}", coffeeType);
      }

      if (
        response.answer &&
        response.answer.includes("{{") &&
        response.answer.includes("}}")
      ) {
        return response.answer.replace("{{coffeeType}}", this.coffee);
      }

      return response.answer || this.getErrorMessage(lang);
    } catch (error) {
      console.error("Error generating response:", error);
      return lang === "en"
        ? "Sorry, I encountered an error while processing your request."
        : "क्षमा करें, आपके अनुरोध को संसाधित करने में एक त्रुटि हुई।";
    }
  }
}
