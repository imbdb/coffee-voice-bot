/* eslint-disable @typescript-eslint/no-explicit-any */
import { containerBootstrap } from "@nlpjs/core";
import { Nlp } from "@nlpjs/nlp";
import { LangEn } from "@nlpjs/lang-en-min";
import { LangHi } from "@nlpjs/lang-hi";
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
      this.container.use(LangHi);
      this.container.use(Ner);
      this.nlp = this.container.get("nlp");
      this.nlp.settings.autoSave = false;
      this.nlp.addLanguage("en");
      this.nlp.addLanguage("hi");

      // Initialize NER with coffee types
      const coffeeTypes = ["Espresso", "Latte", "Cappuccino", "Americano"];
      this.nlp.addEntities({
        coffeeType: {
          options: {
            coffee: ["espresso", "latte", "cappuccino", "americano"],
          },
        },
      });

      // Add entity extraction rules for both languages
      coffeeTypes.forEach((type) => {
        // English rules
        this.nlp.addNerRuleOptionTexts("en", "coffeeType", type.toLowerCase(), [
          type,
          type.toLowerCase(),
          `${type.toLowerCase()} coffee`,
          `a ${type.toLowerCase()}`,
          `an ${type.toLowerCase()}`,
        ]);

        // Hindi rules
        this.nlp.addNerRuleOptionTexts("hi", "coffeeType", type.toLowerCase(), [
          type,
          type.toLowerCase(),
          `${type.toLowerCase()} कॉफ़ी`,
        ]);
      });

      // English greetings
      this.nlp.addDocument("en", "goodbye for now", "greetings.bye");
      this.nlp.addDocument("en", "bye bye take care", "greetings.bye");
      this.nlp.addDocument("en", "okay see you later", "greetings.bye");
      this.nlp.addDocument("en", "bye for now", "greetings.bye");
      this.nlp.addDocument("en", "i must go", "greetings.bye");
      this.nlp.addDocument("en", "hello", "greetings.hello");
      this.nlp.addDocument("en", "hi", "greetings.hello");
      this.nlp.addDocument("en", "howdy", "greetings.hello");

      // Hindi greetings
      this.nlp.addDocument("hi", "फिर मिलेंगे", "greetings.bye");
      this.nlp.addDocument("hi", "अलविदा", "greetings.bye");
      this.nlp.addDocument("hi", "बाय बाय", "greetings.bye");
      this.nlp.addDocument("hi", "चलता हूं", "greetings.bye");
      this.nlp.addDocument("hi", "नमस्ते", "greetings.hello");
      this.nlp.addDocument("hi", "हाय", "greetings.hello");
      this.nlp.addDocument("hi", "हैलो", "greetings.hello");

      // English coffee ordering
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

      // Hindi coffee ordering
      this.nlp.addDocument("hi", "मुझे कॉफ़ी चाहिए", "order.coffee.detect");
      this.nlp.addDocument("hi", "कॉफ़ी मिल सकती है", "order.coffee.detect");
      this.nlp.addDocument("hi", "कॉफ़ी ऑर्डर करनी है", "order.coffee.detect");
      this.nlp.addDocument("hi", "मुझे कॉफ़ी दीजिए", "order.coffee.detect");
      this.nlp.addDocument("hi", "एक कॉफ़ी देना", "order.coffee.detect");

      // Answers for detecting coffee ordering
      this.nlp.addAnswer(
        "en",
        "order.coffee.detect",
        "What type of coffee would you like? Latte, Espresso, Cappuccino, or Americano?"
      );
      this.nlp.addAnswer(
        "hi",
        "order.coffee.detect",
        "आप किस तरह की कॉफ़ी लेना चाहेंगे? लाते, एस्प्रेसो, कैपुचीनो, या अमेरिकानो?"
      );

      // Add coffee type detection for both languages
      coffeeTypes.forEach((type) => {
        // English patterns
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
      });

      const hindiCoffeeTypes = [
        "लाते",
        "एस्प्रेसो",
        "कैपुचीनो",
        "कैप्युचीनो",
        "अमेरिकानो",
      ];

      hindiCoffeeTypes.forEach((type) => {
        // Hindi patterns
        this.nlp.addDocument("hi", type, `order.coffee.type.${type}`);
        this.nlp.addDocument(
          "hi",
          `मुझे ${type} चाहिए`,
          `order.coffee.type.${type}`
        );
        this.nlp.addDocument(
          "hi",
          `मुझे ${type} कॉफ़ी चाहिए`,
          `order.coffee.type.${type}`
        );
        this.nlp.addDocument(
          "hi",
          `${type} कॉफ़ी`,
          `order.coffee.type.${type}`
        );
        this.nlp.addDocument(
          "hi",
          `${type} कॉफ़ी देना`,
          `order.coffee.type.${type}`
        );
        this.nlp.addAnswer(
          "hi",
          `order.coffee.type.${type}`,
          `आपने ${type} कॉफ़ी ऑर्डर की है। क्या यह सही है?`
        );
      });

      // English confirmation intents
      this.nlp.addDocument("en", "Yes", "order.coffee.confirm");
      this.nlp.addDocument("en", "That's correct", "order.coffee.confirm");
      this.nlp.addDocument("en", "Sure", "order.coffee.confirm");
      this.nlp.addDocument("en", "Yep", "order.coffee.confirm");
      this.nlp.addDocument("en", "Yeah", "order.coffee.confirm");

      // Hindi confirmation intents
      this.nlp.addDocument("hi", "हां", "order.coffee.confirm");
      this.nlp.addDocument("hi", "बिल्कुल", "order.coffee.confirm");
      this.nlp.addDocument("hi", "सही है", "order.coffee.confirm");
      this.nlp.addDocument("hi", "ठीक है", "order.coffee.confirm");
      this.nlp.addDocument("hi", "हाँ जी", "order.coffee.confirm");

      // English negative responses
      this.nlp.addDocument("en", "No", "order.coffee.reject");
      this.nlp.addDocument("en", "That's wrong", "order.coffee.reject");
      this.nlp.addDocument("en", "Not correct", "order.coffee.reject");
      this.nlp.addDocument("en", "Nope", "order.coffee.reject");

      // Hindi negative responses
      this.nlp.addDocument("hi", "नहीं", "order.coffee.reject");
      this.nlp.addDocument("hi", "गलत है", "order.coffee.reject");
      this.nlp.addDocument("hi", "सही नहीं है", "order.coffee.reject");
      this.nlp.addDocument("hi", "नहीं जी", "order.coffee.reject");

      // Confirmation/rejection answers in both languages
      this.nlp.addAnswer(
        "en",
        "order.coffee.confirm",
        "Perfect! Your {{coffeeType}} will be ready soon. Have a great day!"
      );
      this.nlp.addAnswer(
        "hi",
        "order.coffee.confirm",
        "बढ़िया! आपकी {{coffeeType}} जल्द ही तैयार हो जाएगी। आपका दिन शुभ हो!"
      );

      this.nlp.addAnswer(
        "en",
        "order.coffee.reject",
        "I apologize for the confusion. What type of coffee would you like?"
      );
      this.nlp.addAnswer(
        "hi",
        "order.coffee.reject",
        "भ्रम के लिए क्षमा करें। आप किस तरह की कॉफ़ी लेना चाहेंगे?"
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
      const response = await this.nlp.process(lang, text);
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
