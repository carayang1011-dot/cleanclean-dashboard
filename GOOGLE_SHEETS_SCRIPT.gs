/**
 * 淨淨 CleanClean 儀表板 — Google Sheets 自動備份腳本
 *
 * 設定步驟：
 *  1. 開啟一個新的 Google 試算表
 *  2. 點選「擴充功能」→「Apps Script」
 *  3. 刪除預設內容，貼上這整個檔案的內容
 *  4. 點選「部署」→「新增部署作業」
 *     - 類型選「網路應用程式」
 *     - 執行身分：「我」
 *     - 存取權：「任何人」
 *  5. 點「部署」，複製產生的網址
 *  6. 將網址貼到 Vercel 環境變數 GOOGLE_SHEETS_WEBHOOK_URL
 *     （或本地 .env.local 的 GOOGLE_SHEETS_WEBHOOK_URL=<網址>）
 *  7. 重新部署 Vercel → 完成！
 *
 * 之後儀表板每次新增／修改／刪除資料，都會自動同步到試算表。
 * 每個資料表（invitations、kols、projects…）會各自在試算表建立一個頁籤。
 */

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var table  = payload.table;
    var action = payload.action; // 'create' | 'update' | 'delete'
    var row    = payload.row;

    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(table);
    if (!sheet) {
      sheet = ss.insertSheet(table);
    }

    if (action === 'create') {
      _appendRow(sheet, row);
    } else if (action === 'update') {
      _updateRow(sheet, row);
    } else if (action === 'delete') {
      _deleteRow(sheet, row.id);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 取得或初始化標題列，回傳標題陣列
function _getHeaders(sheet, row) {
  if (sheet.getLastColumn() === 0) {
    var headers = Object.keys(row);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    return headers;
  }
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
}

function _appendRow(sheet, row) {
  var headers = _getHeaders(sheet, row);
  var values  = headers.map(function(h) { return row[h] !== undefined ? row[h] : ''; });
  sheet.appendRow(values);
}

function _updateRow(sheet, row) {
  var headers    = _getHeaders(sheet, row);
  var idColIndex = headers.indexOf('id');
  var lastRow    = sheet.getLastRow();

  if (idColIndex < 0 || lastRow <= 1) {
    _appendRow(sheet, row);
    return;
  }

  var idValues = sheet.getRange(2, idColIndex + 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < idValues.length; i++) {
    if (idValues[i][0] === row.id) {
      var values = headers.map(function(h) { return row[h] !== undefined ? row[h] : ''; });
      sheet.getRange(i + 2, 1, 1, headers.length).setValues([values]);
      return;
    }
  }
  // 找不到就 append（通常是第一次 upsert）
  _appendRow(sheet, row);
}

function _deleteRow(sheet, id) {
  var lastCol = sheet.getLastColumn();
  if (lastCol === 0) return;
  var headers    = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var idColIndex = headers.indexOf('id');
  var lastRow    = sheet.getLastRow();
  if (idColIndex < 0 || lastRow <= 1) return;

  var idValues = sheet.getRange(2, idColIndex + 1, lastRow - 1, 1).getValues();
  for (var i = idValues.length - 1; i >= 0; i--) {
    if (idValues[i][0] === id) {
      sheet.deleteRow(i + 2);
      return;
    }
  }
}
