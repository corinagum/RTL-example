// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// Import required Bot Framework classes.
import {
  ActivityHandler,
  CardFactory,
  StatePropertyAccessor,
  TurnContext,
  UserState
} from "botbuilder";

import { readFileSync } from 'fs';
import { join } from 'path';
import { isContext } from "vm";
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
        case `تحميل`:
        await this.uploadFile(context);
          break;
        case `يشترى`:
          await this.sendCarousel(context);
          break;
        // مساعدة
        case "مساعدة": // 'help'
        case "رحب بالقارئ":
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
        }
      ]
    };

    await context.sendActivity({
      attachments: [CardFactory.adaptiveCard(card)]
    });
  }

  private async sendCarousel(context: TurnContext) {
    const carousel = [
      {
        contentType: 'application/vnd.microsoft.card.hero',
        content: {
          title: 'تفاصيل عن الصورة 1',
          subtitle: 'هذا عنوان فرعي',
          text: 'السعر: E£###.## دولار امريكي',
          images: [
            {
              url: `${process.env.HOST}/assets/surface1.jpg`
            }
          ],
          buttons: [
            {
              type: 'imBack',
              value: 'مكان الشراء',
              title: 'اماكن الشراء'
            },
            {
              type: 'imBack',
              value: 'المنتجات ذات الصلة',
              title: 'المنتجات ذات الصلة'
            }
          ]
        }
      },
      {
        contentType: 'application/vnd.microsoft.card.hero',
        content: {
          title: 'تفاصيل عن الصورة 2',
          subtitle: 'هذا عنوان فرعي',
          text: 'السعر: E£###.## دولار امريكي',
          images: [
            {
              url: `${process.env.HOST}/assets/surface2.jpg`
            }
          ],
          buttons: [
            {
              type: 'imBack',
              value: 'مكان الشراء',
              title: 'اماكن الشراء'
            },
            {
              type: 'imBack',
              value: 'المنتجات ذات الصلة',
              title: 'المنتجات ذات الصلة'
            }
          ]
        }
      },
      {
        contentType: 'application/vnd.microsoft.card.hero',
        content: {
          title: 'تفاصيل عن الصورة 3',
          subtitle: 'هذا عنوان فرعي',
          text: 'السعر: E£###.## دولار امريكي',
          images: [
            {
              url: `${process.env.HOST}/assets/surface3.jpg`
            }
          ],
          buttons: [
            {
              type: 'imBack',
              value: 'مكان الشراء',
              title: 'اماكن الشراء'
            },
            {
              type: 'imBack',
              value: 'المنتجات ذات الصلة',
              title: 'المنتجات ذات الصلة'
            }
          ]
        }
      },
      {
        contentType: 'application/vnd.microsoft.card.hero',
        content: {
          title: 'تفاصيل عن الصورة 4',
          subtitle: 'هذا عنوان فرعي',
          text: 'السعر: E£###.## دولار امريكي',
          images: [
            {
              url: `${process.env.HOST}/assets/surface4.jpg`
            }
          ],
          buttons: [
            {
              type: 'imBack',
              value: 'مكان الشراء',
              title: 'اماكن الشراء'
            },
            {
              type: 'imBack',
              value: 'المنتجات ذات الصلة',
              title: 'المنتجات ذات الصلة'
            }
          ]
        }
      }
    ]

    await context.sendActivity({
      type: 'message',
      text: '',
      attachmentLayout: 'carousel',
        attachments: carousel
    });
  }

  private async uploadFile(context: TurnContext) {
    const fileReceipt = {
      type: 'message',
      text: 'التقارير جاهزة، إطَّلع على الملف الملحق',
      attachments: [
        {
          contentType: 'application/octet-stream',
          contentUrl: `${process.env.HOST}/src/assets/الأصول.txt`,
          name: 'نص صِرف'
        },
        {
          contentType: 'application/octet-stream',
          contentUrl: `${process.env.HOST}/src/assets/الأصول.docx`,
          name: 'مستند'
        }
      ]
    }
    await context.sendActivity(fileReceipt);
  }

}
