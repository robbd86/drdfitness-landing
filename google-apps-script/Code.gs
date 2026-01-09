// Google Apps Script Web App endpoint for DRD Fitness waitlist
// Stores emails in a private Google Sheet.
//
// 1) Replace SPREADSHEET_ID if needed.
// 2) Deploy as a Web App (Execute as: Me, Who has access: Anyone).
// 3) Copy the Web App URL into index.html (config.emailCapture.action).

const SPREADSHEET_ID = '1NDF_FoXCVbmps5xChZy5SoJwfj2cV0rpiilgOu-GkKU';
const DEFAULT_RETURN_URL = 'https://drdfitness.co.uk';

function doPost(e) {
  var lock = LockService.getScriptLock();
  var gotLock = lock.tryLock(10000);
  if (!gotLock) {
    return _htmlResponse('Busy', 'Please try again in a moment.');
  }

  try {
    var parsed = parseRequest_(e);
    var email = parsed.email;
    var returnUrl = parsed.returnUrl || DEFAULT_RETURN_URL;

    if (!email) {
      return _htmlResponse('Missing email', 'Please go back and enter an email address.', returnUrl);
    }

    if (!looksLikeEmail_(email)) {
      return _htmlResponse('Invalid email', 'Please go back and enter a valid email address.', returnUrl);
    }

    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheets()[0];
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Email']);
    }
    sheet.appendRow([new Date(), email]);

    return HtmlService.createHtmlOutput(thankYouPage_(returnUrl));
  } catch (err) {
    return _htmlResponse('Server error', 'Something went wrong. Please try again.', DEFAULT_RETURN_URL);
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return HtmlService.createHtmlOutput('This endpoint accepts POST submissions from the waitlist form.');
}

function parseRequest_(e) {
  var email = '';
  var returnUrl = '';

  // 1) Standard form post
  if (e && e.parameter) {
    if (e.parameter.email) email = String(e.parameter.email).trim();
    if (e.parameter.returnUrl) returnUrl = String(e.parameter.returnUrl).trim();
  }

  // 2) JSON payload (fetch)
  if ((!email || !returnUrl) && e && e.postData && e.postData.contents) {
    try {
      var obj = JSON.parse(String(e.postData.contents));
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

function looksLikeEmail_(email) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(email || ''));
}

function thankYouPage_(returnUrl) {
  var safeUrl = String(returnUrl || DEFAULT_RETURN_URL);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Thanks — You're on the waitlist</title>
  <meta http-equiv="refresh" content="2;url=${safeUrl}" />
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
    <p>Thanks — we've saved your entry. Redirecting you back now…</p>
    <a href="${safeUrl}">Back to site</a>
  </div>
</body>
</html>`;
}

function _htmlResponse(title, message, returnUrl) {
  var safeUrl = String(returnUrl || DEFAULT_RETURN_URL);
  return HtmlService.createHtmlOutput(
    `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
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
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="${safeUrl}">Back to site</a>
  </div>
</body>
</html>`
  );
}
