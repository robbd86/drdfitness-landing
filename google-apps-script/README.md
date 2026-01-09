# Google Sheet Waitlist (Private)

This folder contains a small Google Apps Script "web app" that accepts your landing page waitlist form submissions and appends them to a private Google Sheet.

## What you get
- Waitlist emails stored in your Google Sheet
- Visitors cannot see the sheet (as long as sheet sharing is **Restricted**)

## Setup
1. Open your sheet:
   - https://docs.google.com/spreadsheets/d/1NDF_FoXCVbmps5xChZy5SoJwfj2cV0rpiilgOu-GkKU

2. In the sheet, go to **Extensions → Apps Script**.

3. Create a new script file (or use the default) and paste the contents of `Code.gs`.

4. Click **Deploy → New deployment**
   - Select type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**

5. Click **Deploy**, authorize, then copy the **Web app URL**.

## Connect the landing page
In `index.html`, set:
- `config.emailCapture.action` = `<YOUR_WEB_APP_URL>`

Example:
- `https://script.google.com/macros/s/ABCDEFG1234567890/exec`

## Notes
- The script writes headers (`Timestamp`, `Email`) if the sheet is empty.
- The sheet should remain **Restricted** (Share button → General access: Restricted).
