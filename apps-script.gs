/**
 * Alma Pro — Captura de registros de la landing (Criterio 3)
 *
 * Recibe cada envío del formulario, agrega una fila en esta planilla
 * y manda un correo de aviso al equipo. Pegar en Extensiones > Apps Script
 * de la planilla de Google Sheets (ver INSTRUCCIONES.md, paso 2).
 */

// Correos del equipo que reciben el aviso (separados por coma)
var EMAILS_EQUIPO = "correo1@gmail.com,correo2@gmail.com";

var COLUMNAS = [
  "Fecha", "Nombre", "Correo", "Área", "Experiencia", "Zona",
  "Origen (utm_source)", "utm_medium", "utm_campaign", "Es prueba", "Referrer"
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var p = e.parameter;
    var correo = String(p.correo || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(correo) || !p.nombre) {
      return respuesta({ ok: false, error: "datos inválidos" });
    }

    var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Registros")
      || SpreadsheetApp.getActiveSpreadsheet().insertSheet("Registros");
    if (hoja.getLastRow() === 0) {
      hoja.appendRow(COLUMNAS);
      hoja.getRange(1, 1, 1, COLUMNAS.length).setFontWeight("bold");
      hoja.setFrozenRows(1);
    }

    var esPrueba = p.es_prueba === "SI" ? "SI" : "NO";
    hoja.appendRow([
      new Date(), p.nombre, correo, p.area || "", p.experiencia || "", p.zona || "",
      p.utm_source || "directo", p.utm_medium || "", p.utm_campaign || "", esPrueba, p.referrer || ""
    ]);
    if (esPrueba === "SI") {
      hoja.getRange(hoja.getLastRow(), 1, 1, COLUMNAS.length).setBackground("#fff3cd");
    }

    var reales = hoja.getDataRange().getValues().filter(function (r, i) {
      return i > 0 && r[9] !== "SI";
    }).length;

    MailApp.sendEmail({
      to: EMAILS_EQUIPO,
      subject: (esPrueba === "SI" ? "[PRUEBA] " : "") + "Alma Pro: nuevo interesado (" + p.nombre + ")",
      body:
        "Nuevo registro en la landing de Alma Pro\n\n" +
        "Nombre: " + p.nombre + "\n" +
        "Correo: " + correo + "\n" +
        "Área: " + (p.area || "-") + "\n" +
        "Experiencia: " + (p.experiencia || "-") + "\n" +
        "Zona: " + (p.zona || "-") + "\n" +
        "Origen: " + (p.utm_source || "directo") + "\n\n" +
        "Registros reales acumulados: " + reales + " / 15 (umbral)\n" +
        SpreadsheetApp.getActiveSpreadsheet().getUrl()
    });

    return respuesta({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

function respuesta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
