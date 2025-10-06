import { baseEmailTemplate } from './base-template';

interface WelcomeEmailProps {
  userName: string;
  locale?: string;
  verificationUrl?: string;
}

export const welcomeEmailTemplate = ({ userName, locale = 'en', verificationUrl }: WelcomeEmailProps) => {
  const translations = {
    en: {
      subject: 'Welcome to Driplo! 🎉',
      heading: `Welcome, ${userName}!`,
      intro: "We're thrilled to have you join our community of fashion enthusiasts.",
      whatNext: "What's Next?",
      step1Title: "Complete Your Profile",
      step1Desc: "Add a profile photo and bio to build trust with buyers and sellers.",
      step2Title: "Browse & Discover",
      step2Desc: "Explore thousands of unique fashion items from sellers worldwide.",
      step3Title: "Start Selling",
      step3Desc: "List your first item in under 60 seconds and start earning.",
      verifyButton: "Verify Your Email",
      verifyText: "Please verify your email address to unlock all features:",
      exploreButton: "Start Exploring",
      tips: "Pro Tips for Success",
      tip1: "📸 Use high-quality photos with good lighting",
      tip2: "📝 Write detailed descriptions with measurements",
      tip3: "💬 Respond to messages quickly",
      tip4: "📦 Ship items promptly and safely",
      questions: "Have questions?",
      support: "Our support team is here to help 24/7"
    },
    bg: {
      subject: 'Добре дошли в Driplo! 🎉',
      heading: `Добре дошъл, ${userName}!`,
      intro: "Радваме се, че се присъединявате към нашата общност от модни ентусиасти.",
      whatNext: "Какво следва?",
      step1Title: "Завършете профила си",
      step1Desc: "Добавете профилна снимка и био, за да изградите доверие.",
      step2Title: "Разгледайте и открийте",
      step2Desc: "Разгледайте хиляди уникални модни артикули от продавачи по света.",
      step3Title: "Започнете да продавате",
      step3Desc: "Качете първия си артикул за под 60 секунди и започнете да печелите.",
      verifyButton: "Потвърдете имейла си",
      verifyText: "Моля, потвърдете имейл адреса си, за да отключите всички функции:",
      exploreButton: "Започнете да разглеждате",
      tips: "Професионални съвети за успех",
      tip1: "📸 Използвайте висококачествени снимки с добро осветление",
      tip2: "📝 Пишете подробни описания с размери",
      tip3: "💬 Отговаряйте на съобщенията бързо",
      tip4: "📦 Изпращайте артикулите навреме и безопасно",
      questions: "Имате въпроси?",
      support: "Нашият екип за поддръжка е тук, за да помогне 24/7"
    }
  };
  
  const t = translations[locale as keyof typeof translations] || translations.en;
  
  const content = `
    <!-- Welcome Message -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="padding-bottom: 32px;">
          <h2 style="margin: 0 0 16px 0; color: #212529; font-size: 28px; font-weight: 700; line-height: 1.2;">
            ${t.heading}
          </h2>
          <p style="margin: 0; color: #495057; font-size: 16px; line-height: 1.6;">
            ${t.intro}
          </p>
        </td>
      </tr>
    </table>
    
    ${verificationUrl ? `
    <!-- Email Verification -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fff3cd; border-radius: 12px; padding: 20px; margin-bottom: 32px;">
      <tr>
        <td>
          <p style="margin: 0 0 16px 0; color: #856404; font-size: 14px; font-weight: 500;">
            ${t.verifyText}
          </p>
          <table border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="background-color: #ffc107; border-radius: 8px;">
                <a href="${verificationUrl}" style="display: inline-block; padding: 12px 32px; color: #000000; font-size: 14px; font-weight: 600; text-decoration: none;">
                  ${t.verifyButton}
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ` : ''}
    
    <!-- What's Next Section -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="padding-bottom: 24px;">
          <h3 style="margin: 0 0 20px 0; color: #212529; font-size: 20px; font-weight: 600;">
            ${t.whatNext}
          </h3>
          
          <!-- Steps -->
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <!-- Step 1 -->
            <tr>
              <td style="padding-bottom: 20px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td width="48" valign="top">
                      <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; text-align: center; line-height: 40px; color: #ffffff; font-weight: 600;">
                        1
                      </div>
                    </td>
                    <td valign="top">
                      <h4 style="margin: 0 0 4px 0; color: #212529; font-size: 16px; font-weight: 600;">
                        ${t.step1Title}
                      </h4>
                      <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.5;">
                        ${t.step1Desc}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Step 2 -->
            <tr>
              <td style="padding-bottom: 20px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td width="48" valign="top">
                      <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 50%; text-align: center; line-height: 40px; color: #ffffff; font-weight: 600;">
                        2
                      </div>
                    </td>
                    <td valign="top">
                      <h4 style="margin: 0 0 4px 0; color: #212529; font-size: 16px; font-weight: 600;">
                        ${t.step2Title}
                      </h4>
                      <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.5;">
                        ${t.step2Desc}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Step 3 -->
            <tr>
              <td style="padding-bottom: 20px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td width="48" valign="top">
                      <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 50%; text-align: center; line-height: 40px; color: #ffffff; font-weight: 600;">
                        3
                      </div>
                    </td>
                    <td valign="top">
                      <h4 style="margin: 0 0 4px 0; color: #212529; font-size: 16px; font-weight: 600;">
                        ${t.step3Title}
                      </h4>
                      <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.5;">
                        ${t.step3Desc}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- CTA Button -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="padding: 24px 0;">
      <tr>
        <td align="center">
          <table border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="background-color: #000000; border-radius: 8px;">
                <a href="https://driplo.com/browse" style="display: inline-block; padding: 16px 48px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none;">
                  ${t.exploreButton}
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- Pro Tips -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f9fa; border-radius: 12px; padding: 24px; margin-top: 32px;">
      <tr>
        <td>
          <h4 style="margin: 0 0 16px 0; color: #212529; font-size: 16px; font-weight: 600;">
            ${t.tips}
          </h4>
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr><td style="padding: 4px 0; color: #495057; font-size: 14px;">${t.tip1}</td></tr>
            <tr><td style="padding: 4px 0; color: #495057; font-size: 14px;">${t.tip2}</td></tr>
            <tr><td style="padding: 4px 0; color: #495057; font-size: 14px;">${t.tip3}</td></tr>
            <tr><td style="padding: 4px 0; color: #495057; font-size: 14px;">${t.tip4}</td></tr>
          </table>
        </td>
      </tr>
    </table>
    
    <!-- Support -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 32px;">
      <tr>
        <td align="center">
          <p style="margin: 0 0 8px 0; color: #6c757d; font-size: 14px;">
            ${t.questions}
          </p>
          <p style="margin: 0; color: #495057; font-size: 14px;">
            ${t.support} 
            <a href="mailto:support@driplo.com" style="color: #000000; font-weight: 600;">support@driplo.com</a>
          </p>
        </td>
      </tr>
    </table>
  `;
  
  return {
    subject: t.subject,
    html: baseEmailTemplate(content, locale)
  };
};