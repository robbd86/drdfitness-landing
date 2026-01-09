// Google Apps Script Web App endpoint for DRD Fitness waitlist
// Stores emails in a private Google Sheet.
//
// 1) Replace SPREADSHEET_ID if needed.
// 2) Deploy as a Web App (Execute as: Me, Who has access: Anyone).
// 3) Copy the Web App URL into index.html (config.emailCapture.action).

const SPREADSHEET_ID = '1NDF_FoXCVbmps5xChZy5SoJwfj2cV0rpiilgOu-GkKU';

function doPost(e) {
  try {
    var lock = LockService.getScriptLock();
    lock.tryLock(10000);

    try {
      var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      var sheet = ss.getSheets()[0];

      var parsed = parseRequest_(e);
      var email = parsed.email;
      var returnUrl = parsed.returnUrl;

      if (!email) {
        return ContentService
          .createTextOutput("Missing email")
          .setMimeType(ContentService.MimeType.TEXT);
      }

      sheet.appendRow([new Date(), email]);

      return HtmlService.createHtmlOutput(
        `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Thanks — You're on the waitlist</title>
  <meta http-equiv="refresh" content="2;url=${returnUrl}" />
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Inter,Arial,sans-serif;margin:0;padding:48px;background:#0b0b0b;color:#fff;}
    .card{max-width:520px;margin:0 auto;padding:24px;border:1px solid #333;border-radius:12px;background:#151515;}
    h1{margin:0 0 8px;font-size:24px;}
    p{margin:0 0 16px;opacity:.85;line-height:1.5;}
    a{display:inline-block;padding:12px 16px;border-radius:8px;background:#ff7a18;color:#000;text-decoration:none;font-weight:600;}
  </style>
</head>
<body>
  <div class="card">
    <h1>You're on the waitlist</h1>
    <p>Thanks — we'll email you updates. Redirecting you back now…</p>
    <a href="${returnUrl}">Back to site</a>
  </div>
</body>
</html>`
      );
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return _htmlResponse(500, 'Server error', 'Something went wrong. Please try again.');
  }
}

function parseRequest_(e) {
  var email = "";
  var returnUrl = "";

  // 1) Standard form post
  if (e && e.parameter) {
    if (e.parameter.email) email = String(e.parameter.email).trim();
    if (e.parameter.returnUrl) returnUrl = String(e.parameter.returnUrl).trim();
  }

  // 2) JSON payload (fetch)
  if ((!email || !returnUrl) && e && e.postData && e.postData.contents) {
    var contents = String(e.postData.contents);
    try {
      var obj = JSON.parse(contents);
      if (!email && obj && obj.email) email = String(obj.email).trim();
      if (!returnUrl && obj && obj.returnUrl) returnUrl = String(obj.returnUrl).trim();
    } catch (err) {
      // ignore invalid JSON
    }
  }

  return {
    email: email,
    returnUrl: returnUrl
  };
}

    if (!email) {
      return _htmlResponse(400, 'Missing email', 'Please go back and enter an email address.');
    }

    // Lightweight validation (keeps it simple; front-end already requires type=email)
    const looksLikeEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
    if (!looksLikeEmail) {
      return _htmlResponse(400, 'Invalid email', 'Please go back and enter a valid email address.');
    }

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheets()[0];

    // Optional: write headers if the sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Email']);
    }

    sheet.appendRow([new Date(), email]);

    return HtmlService.createHtmlOutput(
      `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Thanks — You're on the waitlist</title>
  <meta http-equiv="refresh" content="2;url=${returnUrl}" />
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Inter,Arial,sans-serif;margin:0;padding:48px;background:#0b0b0b;color:#fff;}
    .card{max-width:520px;margin:0 auto;padding:24px;border:1px solid #333;border-radius:12px;background:#151515;}
    h1{margin:0 0 8px;font-size:24px;}
    p{margin:0 0 16px;opacity:.85;line-height:1.5;}
    a{display:inline-block;padding:12px 16px;border-radius:8px;background:#ff7a18;color:#000;text-decoration:none;font-weight:600;}
  </style>
</head>
<body>
  <div class="card">
    <h1>You're on the waitlist</h1>
    <p>Thanks — we'll email you updates. Redirecting you back now…</p>
    <a href="${returnUrl}">Back to site</a>
  </div>
</body>
</html>`
    );
  } catch (err) {
    return _htmlResponse(500, 'Server error', 'Something went wrong. Please try again.');
  }
}

function doGet() {
  return HtmlService.createHtmlOutput('This endpoint accepts POST submissions from the waitlist form.');
}

function _htmlResponse(statusCode, title, message) {
  const output = HtmlService.createHtmlOutput(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<body style="font-family:system-ui;margin:40px;">
  <h1>${title}</h1>
  <p>${message}</p>
</body>`
  );

  // Apps Script doesn't support arbitrary HTTP status codes reliably in HtmlService,
  // but we can still show a friendly error page.
  return output;
}
