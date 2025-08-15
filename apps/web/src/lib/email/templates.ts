import type { LanguageTag } from '@repo/i18n';

interface EmailContent {
  subject: string;
  heading: string;
  body: string;
  buttonText: string;
  footer: string;
  altLinkText: string;
  expiryText: string;
  ignoreText: string;
}

// Email content translations
const emailTranslations: Record<LanguageTag, {
  verifyEmail: EmailContent;
  resetPassword: EmailContent;
  magicLink: EmailContent;
  copyright: string;
}> = {
  en: {
    verifyEmail: {
      subject: 'Verify your email address',
      heading: 'Verify your email address',
      body: 'To complete your Driplo account setup and start buying and selling clothes, please verify your email address.',
      buttonText: 'Verify Email Address',
      footer: 'This link will expire in 24 hours.',
      altLinkText: 'Or copy and paste this link into your browser:',
      expiryText: 'This link will expire in 24 hours.',
      ignoreText: "If you didn't create an account, you can safely ignore this email."
    },
    resetPassword: {
      subject: 'Reset your password',
      heading: 'Reset your password',
      body: 'We received a request to reset your password. Click the button below to choose a new password.',
      buttonText: 'Reset Password',
      footer: 'This link will expire in 1 hour.',
      altLinkText: 'Or copy and paste this link into your browser:',
      expiryText: 'This link will expire in 1 hour.',
      ignoreText: "If you didn't request a password reset, you can safely ignore this email."
    },
    magicLink: {
      subject: 'Sign in to Driplo',
      heading: 'Sign in to your account',
      body: 'Click the button below to sign in to your Driplo account. No password needed.',
      buttonText: 'Sign In',
      footer: 'This link will expire in 1 hour.',
      altLinkText: 'Or copy and paste this link into your browser:',
      expiryText: 'This link will expire in 1 hour.',
      ignoreText: "If you didn't request this link, you can safely ignore this email."
    },
    copyright: '© 2025 Driplo. All rights reserved.'
  },
  bg: {
    verifyEmail: {
      subject: 'Потвърдете вашия имейл адрес',
      heading: 'Потвърдете вашия имейл адрес',
      body: 'За да завършите настройката на вашия Driplo акаунт и да започнете да купувате и продавате дрехи, моля потвърдете вашия имейл адрес.',
      buttonText: 'Потвърди имейл адрес',
      footer: 'Тази връзка ще изтече след 24 часа.',
      altLinkText: 'Или копирайте и поставете тази връзка във вашия браузър:',
      expiryText: 'Тази връзка ще изтече след 24 часа.',
      ignoreText: 'Ако не сте създали акаунт, можете спокойно да игнорирате този имейл.'
    },
    resetPassword: {
      subject: 'Нулирайте вашата парола',
      heading: 'Нулирайте вашата парола',
      body: 'Получихме заявка за нулиране на вашата парола. Кликнете бутона по-долу, за да изберете нова парола.',
      buttonText: 'Нулирай парола',
      footer: 'Тази връзка ще изтече след 1 час.',
      altLinkText: 'Или копирайте и поставете тази връзка във вашия браузър:',
      expiryText: 'Тази връзка ще изтече след 1 час.',
      ignoreText: 'Ако не сте поискали нулиране на парола, можете спокойно да игнорирате този имейл.'
    },
    magicLink: {
      subject: 'Влезте в Driplo',
      heading: 'Влезте във вашия акаунт',
      body: 'Кликнете бутона по-долу, за да влезете във вашия Driplo акаунт. Не е необходима парола.',
      buttonText: 'Влез',
      footer: 'Тази връзка ще изтече след 1 час.',
      altLinkText: 'Или копирайте и поставете тази връзка във вашия браузър:',
      expiryText: 'Тази връзка ще изтече след 1 час.',
      ignoreText: 'Ако не сте поискали тази връзка, можете спокойно да игнорирате този имейл.'
    },
    copyright: '© 2025 Driplo. Всички права запазени.'
  },
  ru: {
    verifyEmail: {
      subject: 'Подтвердите ваш email адрес',
      heading: 'Подтвердите ваш email адрес',
      body: 'Чтобы завершить настройку вашего аккаунта Driplo и начать покупать и продавать одежду, пожалуйста, подтвердите ваш email адрес.',
      buttonText: 'Подтвердить email',
      footer: 'Эта ссылка истечет через 24 часа.',
      altLinkText: 'Или скопируйте и вставьте эту ссылку в ваш браузер:',
      expiryText: 'Эта ссылка истечет через 24 часа.',
      ignoreText: 'Если вы не создавали аккаунт, вы можете безопасно проигнорировать это письмо.'
    },
    resetPassword: {
      subject: 'Сбросить пароль',
      heading: 'Сбросить пароль',
      body: 'Мы получили запрос на сброс вашего пароля. Нажмите кнопку ниже, чтобы выбрать новый пароль.',
      buttonText: 'Сбросить пароль',
      footer: 'Эта ссылка истечет через 1 час.',
      altLinkText: 'Или скопируйте и вставьте эту ссылку в ваш браузер:',
      expiryText: 'Эта ссылка истечет через 1 час.',
      ignoreText: 'Если вы не запрашивали сброс пароля, вы можете безопасно проигнорировать это письмо.'
    },
    magicLink: {
      subject: 'Войти в Driplo',
      heading: 'Войти в ваш аккаунт',
      body: 'Нажмите кнопку ниже, чтобы войти в ваш аккаунт Driplo. Пароль не требуется.',
      buttonText: 'Войти',
      footer: 'Эта ссылка истечет через 1 час.',
      altLinkText: 'Или скопируйте и вставьте эту ссылку в ваш браузер:',
      expiryText: 'Эта ссылка истечет через 1 час.',
      ignoreText: 'Если вы не запрашивали эту ссылку, вы можете безопасно проигнорировать это письмо.'
    },
    copyright: '© 2025 Driplo. Все права защищены.'
  },
  ua: {
    verifyEmail: {
      subject: 'Підтвердіть вашу email адресу',
      heading: 'Підтвердіть вашу email адресу',
      body: 'Щоб завершити налаштування вашого облікового запису Driplo і почати купувати та продавати одяг, будь ласка, підтвердіть вашу email адресу.',
      buttonText: 'Підтвердити email',
      footer: 'Це посилання втратить чинність через 24 години.',
      altLinkText: 'Або скопіюйте та вставте це посилання у ваш браузер:',
      expiryText: 'Це посилання втратить чинність через 24 години.',
      ignoreText: 'Якщо ви не створювали обліковий запис, ви можете безпечно проігнорувати цей лист.'
    },
    resetPassword: {
      subject: 'Скинути пароль',
      heading: 'Скинути пароль',
      body: 'Ми отримали запит на скидання вашого пароля. Натисніть кнопку нижче, щоб вибрати новий пароль.',
      buttonText: 'Скинути пароль',
      footer: 'Це посилання втратить чинність через 1 годину.',
      altLinkText: 'Або скопіюйте та вставте це посилання у ваш браузер:',
      expiryText: 'Це посилання втратить чинність через 1 годину.',
      ignoreText: 'Якщо ви не запитували скидання пароля, ви можете безпечно проігнорувати цей лист.'
    },
    magicLink: {
      subject: 'Увійти до Driplo',
      heading: 'Увійти до вашого облікового запису',
      body: 'Натисніть кнопку нижче, щоб увійти до вашого облікового запису Driplo. Пароль не потрібен.',
      buttonText: 'Увійти',
      footer: 'Це посилання втратить чинність через 1 годину.',
      altLinkText: 'Або скопіюйте та вставте це посилання у ваш браузер:',
      expiryText: 'Це посилання втратить чинність через 1 годину.',
      ignoreText: 'Якщо ви не запитували це посилання, ви можете безпечно проігнорувати цей лист.'
    },
    copyright: '© 2025 Driplo. Всі права захищені.'
  }
};

// Generate HTML email template
export function generateEmailTemplate(
  type: 'verifyEmail' | 'resetPassword' | 'magicLink',
  locale: LanguageTag,
  confirmationUrl: string
): string {
  const content = emailTranslations[locale][type];
  const copyright = emailTranslations[locale].copyright;
  
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #ffffff;">
                    <!-- Logo -->
                    <tr>
                        <td style="padding: 48px 40px 32px 40px; text-align: center;">
                            <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #000000; letter-spacing: -0.5px;">
                                Driplo
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 0 40px 32px 40px;">
                            <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 600; color: #000000;">
                                ${content.heading}
                            </h2>
                            <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 24px; color: #525252;">
                                ${content.body}
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="${confirmationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #000000; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 500; border-radius: 6px;">
                                            ${content.buttonText}
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Alternative Link -->
                    <tr>
                        <td style="padding: 0 40px 40px 40px;">
                            <p style="margin: 0 0 8px 0; font-size: 13px; color: #737373;">
                                ${content.altLinkText}
                            </p>
                            <p style="margin: 0; font-size: 13px; word-break: break-all; color: #737373;">
                                ${confirmationUrl}
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 40px; background-color: #fafafa; border-top: 1px solid #e5e5e5;">
                            <p style="margin: 0; font-size: 13px; line-height: 20px; color: #737373; text-align: center;">
                                ${content.expiryText}<br>
                                ${content.ignoreText}
                            </p>
                        </td>
                    </tr>
                </table>
                
                <!-- Company Footer -->
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px;">
                    <tr>
                        <td style="padding: 24px 40px; text-align: center;">
                            <p style="margin: 0; font-size: 13px; color: #a3a3a3;">
                                ${copyright}<br>
                                <a href="https://driplo.xyz" style="color: #737373; text-decoration: none;">driplo.xyz</a> · 
                                <a href="mailto:hi@driplo.xyz" style="color: #737373; text-decoration: none;">hi@driplo.xyz</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

// Get email subject by type and locale
export function getEmailSubject(
  type: 'verifyEmail' | 'resetPassword' | 'magicLink',
  locale: LanguageTag
): string {
  return emailTranslations[locale][type].subject;
}