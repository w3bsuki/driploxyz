export const baseEmailTemplate = (content: string, locale: string = 'en') => {
  const year = new Date().getFullYear();
  
  const translations = {
    en: {
      followUs: 'Follow us',
      unsubscribe: 'Unsubscribe',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
      allRightsReserved: 'All rights reserved',
      address: 'London, United Kingdom',
      tagline: 'Premium Second-Hand Fashion Marketplace'
    },
    bg: {
      followUs: 'Последвайте ни',
      unsubscribe: 'Отписване',
      privacyPolicy: 'Политика за поверителност',
      termsOfService: 'Условия за ползване',
      allRightsReserved: 'Всички права запазени',
      address: 'София, България',
      tagline: 'Премиум пазар за втора употреба'
    }
  };
  
  const t = translations[locale as keyof typeof translations] || translations.en;
  
  return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Driplo</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    /* Reset styles */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    
    /* Remove default styling */
    a[x-apple-data-detectors] {
      font-family: inherit !important;
      font-size: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
      color: inherit !important;
      text-decoration: none !important;
    }
    
    /* Mobile styles */
    @media screen and (max-width: 600px) {
      .mobile-hide { display: none !important; }
      .mobile-center { text-align: center !important; }
      .container { width: 100% !important; max-width: 100% !important; }
      .content { padding: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8f9fa; -webkit-font-smoothing: antialiased;">
  
  <!-- Preheader Text -->
  <div style="display: none; font-size: 1px; color: #f8f9fa; line-height: 1px; font-family: 'Inter', Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    Driplo - ${t.tagline}
  </div>
  
  <!-- Email Container -->
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8f9fa;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        
        <!-- Main Content Container -->
        <table class="container" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #000000 0%, #333333 100%); padding: 32px; text-align: center;">
              <!-- Logo -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                      DRIPLO
                    </h1>
                    <p style="margin: 8px 0 0 0; color: #ffffff; opacity: 0.9; font-size: 14px; font-weight: 400;">
                      ${t.tagline}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content Area -->
          <tr>
            <td class="content" style="padding: 40px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 32px; border-top: 1px solid #e9ecef;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                
                <!-- Social Media Links -->
                <tr>
                  <td align="center" style="padding-bottom: 20px;">
                    <p style="margin: 0 0 16px 0; color: #6c757d; font-size: 14px; font-weight: 500;">
                      ${t.followUs}
                    </p>
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 0 8px;">
                          <a href="https://instagram.com/driplo" style="text-decoration: none;">
                            <img src="https://img.icons8.com/ios-filled/50/000000/instagram-new.png" width="24" height="24" alt="Instagram" style="display: block;">
                          </a>
                        </td>
                        <td style="padding: 0 8px;">
                          <a href="https://twitter.com/driplo" style="text-decoration: none;">
                            <img src="https://img.icons8.com/ios-filled/50/000000/twitter.png" width="24" height="24" alt="Twitter" style="display: block;">
                          </a>
                        </td>
                        <td style="padding: 0 8px;">
                          <a href="https://facebook.com/driplo" style="text-decoration: none;">
                            <img src="https://img.icons8.com/ios-filled/50/000000/facebook-new.png" width="24" height="24" alt="Facebook" style="display: block;">
                          </a>
                        </td>
                        <td style="padding: 0 8px;">
                          <a href="https://tiktok.com/@driplo" style="text-decoration: none;">
                            <img src="https://img.icons8.com/ios-filled/50/000000/tiktok.png" width="24" height="24" alt="TikTok" style="display: block;">
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Links -->
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 0 12px;">
                          <a href="https://driplo.com/privacy" style="color: #6c757d; font-size: 12px; text-decoration: none;">
                            ${t.privacyPolicy}
                          </a>
                        </td>
                        <td style="color: #dee2e6;">|</td>
                        <td style="padding: 0 12px;">
                          <a href="https://driplo.com/terms" style="color: #6c757d; font-size: 12px; text-decoration: none;">
                            ${t.termsOfService}
                          </a>
                        </td>
                        <td style="color: #dee2e6;">|</td>
                        <td style="padding: 0 12px;">
                          <a href="{{unsubscribe_url}}" style="color: #6c757d; font-size: 12px; text-decoration: none;">
                            ${t.unsubscribe}
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Copyright -->
                <tr>
                  <td align="center">
                    <p style="margin: 0; color: #adb5bd; font-size: 11px;">
                      © ${year} Driplo. ${t.allRightsReserved}<br>
                      ${t.address}
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
  
  <!-- Tracking Pixel -->
  <img src="{{tracking_pixel}}" width="1" height="1" style="display: block;" alt="">
  
</body>
</html>
  `.trim();
};