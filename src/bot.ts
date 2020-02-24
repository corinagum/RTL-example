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

      // This example uses an exact match on user's input utterance.
      // Consider using LUIS or QnA for Natural Language Processing.
      const text = context.activity.text.toLowerCase();
      switch (text) {
        case `يشترى`:
          await this.sendCarousel(context);
        case "مساعدة": // 'help'
          await this.sendIntroCard(context);
          break;
        default:
          await context.sendActivity(
            `أهلا بك. اكتب المساعدة لمعرفة الأوامر سبيل المثال.`  // welcome. Write help
          );
      }
      // Save state changes
      await this.userState.saveChanges(context);

      // By calling next() you ensure that the next BotHandler is run.
      await next();
    });

    this.onMembersAdded(async (context, next) => {
      // Iterate over all new members added to the conversation
      for (const idx in context.activity.membersAdded) {
        if (
          context.activity.membersAdded[idx].id !==
          context.activity.recipient.id
        ) {
          await context.sendActivity(
            "أهلا بك. اكتب المساعدة لمعرفة الأوامر سبيل المثال." // welcome. Write help
          );
        }
      }

      await next();
    });
  }

  private async sendIntroCard(context: TurnContext) {
    const card = {
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
          text: "اختر من احدى الأوامر العربية المتاحة بالأسفل",
          isSubtle: true
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
    };

    await context.sendActivity({
      attachments: [CardFactory.adaptiveCard(card)]
    });
  }

  private async sendCarousel(context: TurnContext) {
    console.log("carousel");
  }
}
