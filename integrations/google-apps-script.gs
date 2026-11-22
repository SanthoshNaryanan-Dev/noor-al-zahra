// Deploy as a web app with a high-entropy shared secret in Script Properties.
// Use a dedicated spreadsheet and service account/owner with minimum access.
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents)
    const settings = PropertiesService.getScriptProperties()
    if (!settings.getProperty('SHARED_SECRET') || payload.secret !== settings.getProperty('SHARED_SECRET')) return result(false)
    if (!['Orders', 'Enquiries'].includes(payload.sheet) || !payload.row) return result(false)
    const ss = SpreadsheetApp.openById(settings.getProperty('SPREADSHEET_ID'))
    const sheet = ss.getSheetByName(payload.sheet)
    if (!sheet) return result(false)
    const r = payload.row
    const clean = value => {
      const text = typeof value === 'object' ? JSON.stringify(value) : String(value == null ? '' : value)
      return /^[=+\-@\t\r]/.test(text) ? "'" + text : text
    }
    const columns = payload.sheet === 'Orders'
      ? ['timestamp','orderId','name','phone','email','address','pincode','items','amount','paymentStatus','paymentId','source']
      : ['timestamp','name','phone','email','message','source']
    sheet.appendRow(columns.map(key => clean(r[key])))
    return result(true)
  } catch (_) { return result(false) }
}
function result(ok) { return ContentService.createTextOutput(JSON.stringify({ok})).setMimeType(ContentService.MimeType.JSON) }
