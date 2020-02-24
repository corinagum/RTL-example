// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// Import required Bot Framework classes.
import {
  ActionTypes,
  ActivityHandler,
  CardFactory,
  StatePropertyAccessor,
  TurnContext,
  UserState
} from "botbuilder";

// Welcomed User property name
const WELCOMED_USER = "welcomedUserProperty";

export class WelcomeBot extends ActivityHandler {
  private welcomedUserProperty: StatePropertyAccessor<boolean>;
  private userState: UserState;
  /**
   *
   * @param {UserState} User state to persist boolean flag to indicate
   *          if the bot had already welcomed the user
   */
  constructor(userState: UserState) {
    super();

    this.welcomedUserProperty = userState.createProperty(WELCOMED_USER);

    this.userState = userState;

    this.onMessage(async (context, next) => {
      // Read UserState. If the 'DidBotWelcomedUser' does not exist (first time ever for a user)
      // set the default to false.
      const didBotWelcome = await this.welcomedUserProperty.get(context, false);

      // Your bot should proactively send a welcome message to a personal chat the first time
      // (and only the first time) a user initiates a personal chat with your bot.
      if (didBotWelcome === false) {
        // The channel should send the user name in the 'From' object
        const userName = context.activity.from.name;
        await context.sendActivity(
          "You are seeing this message because this was your first message ever sent to this bot."
        );
        await context.sendActivity(
          `It is a good practice to welcome the user and provide personal greeting. For example, welcome ${userName}.`
        );

        // Set the flag indicating the bot handled the user's first message.
        await this.welcomedUserProperty.set(context, true);
      } else {
        // This example uses an exact match on user's input utterance.
        // Consider using LUIS or QnA for Natural Language Processing.
        const text = context.activity.text.toLowerCase();
        switch (text) {
          case "مرحبا":
            await context.sendActivity(`أنت قلت "${context.activity.text}"`);
            break;
          // case 'intro':
          case "مساعدة": // 'help'
            await this.sendIntroCard(context);
            break;
          default:
            await context.sendActivity(
              `أهلا بك. اكتب المساعدة لمعرفة الأوامر سبيل المثال.`
            );
        }
      }
      // Save state changes
      await this.userState.saveChanges(context);

      // By calling next() you ensure that the next BotHandler is run.
      await next();
    });
  }

  private async sendIntroCard(context: TurnContext) {
    await context.sendActivity({
      attachments: [
        {
          contentType: "application/vnd.microsoft.card.adaptive",
          content: {
            $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
            type: "AdaptiveCard",
            version: "1.0",
            speak: "<s>مرحبا! إختر من إحدى النشاطاط بالأسفل</s>",
            body: [
              {
                type: "TextBlock",
                text: "مرحباً! انا اتحدث القليل من اللغة العربية",
                size: "Large",
                weight: "Bolder"
              },
              {
                type: "TextBlock",
                text: "(Hello! I speak some Arabic)",
                size: "Large",
                weight: "Bolder"
              },
              {
                type: "TextBlock",
                text: "اختر من احدى الأوامر العربية المتاحة بالأسفل",
                isSubtle: true
              },
              {
                type: "TextBlock",
                text: "(Select from the available Arabic commands below)",
                isSubtle: true,
                spacing: "None"
              }
            ],
            actions: [
              {
                data: "رحب بالقارئ",
                type: "Action.Submit",
                title: "رحب بالقارئ"
              },
              {
                data: "يشترى",
                type: "Action.Submit",
                title: "carousel إظهر مكتبة دوارة"
              },
              {
                data: "تحميل",
                type: "Action.Submit",
                title: "اظهر خاصية تحميل المرفقات"
              },
              {
                data: "typing 1",
                type: "Action.Submit",
                title: "اعدادات تأثيرات الحركة للكتابة"
              },
              {
                data: "نص",
                type: "Action.Submit",
                title: "markdown كارت"
              }
            ]
          }
        }
      ]
    });
  }
}
