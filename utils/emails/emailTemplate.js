export const emailTemplate = (title, bodyContent) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');
            body {
                font-family: 'Inter', sans-serif;
                background-color: #f8f9fa;
                margin: 0;
                padding: 0;
                color: #343a40;
            }
            .container {
                max-width: 600px;
                margin: 30px auto;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                overflow: hidden;
            }
            .header {
                background-color: #ffffff;
                padding: 20px 30px;
                text-align: center;
                border-bottom: 2px solid #e9ecef;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
                color: #212529;
            }
            .header h2 {
                margin-top: 5px;
                font-size: 16px;
                font-weight: 400;
                color: #6c757d;
            }
            .body-content {
                padding: 30px;
                font-size: 16px;
                line-height: 1.6;
            }
            .footer {
                padding: 20px 30px;
                text-align: center;
                font-size: 12px;
                color: #868e96;
                border-top: 1px solid #e9ecef;
            }
            .footer p {
                margin: 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Trivix Data Solutions</h1>
                <h2>${title}</h2>
            </div>

            <div class="body-content">
                ${bodyContent}
            </div>

            <div class="footer">
                <p>
                    <a href="#" style="color: #6c757d; text-decoration: none;">Privacy Policy</a> | 
                    <a href="#" style="color: #6c757d; text-decoration: none;">Contact Us</a>
                </p>
                <p style="margin-top: 5px;">
                    © ${new Date().getFullYear()} Trivix Data Solutions. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
};
