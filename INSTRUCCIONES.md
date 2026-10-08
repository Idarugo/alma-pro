# Landing Alma Pro: cómo dejarla funcionando

Archivos:
- `index.html`: la landing completa (Criterio 1). Tiene un solo CTA, "Quiero mi diagnóstico gratis", repetido 2 veces y que abre el formulario.
- `apps-script.gs`: código que guarda cada registro en Google Sheets y avisa al equipo por correo (Criterio 3).

Son 4 pasos y toman unos 30 minutos en total.

---

## 1. Crear la planilla (base de datos)

1. Crear una Google Sheet nueva llamada **Alma Pro – Registros MVP**.
2. Compartirla con todo el equipo.

## 2. Conectar el formulario a la planilla y activar el aviso (Criterio 3)

1. En la planilla, abrir **Extensiones → Apps Script**.
2. Borrar lo que aparezca y pegar todo el contenido de `apps-script.gs`.
3. En la línea `EMAILS_EQUIPO`, poner los correos del equipo.
4. Guardar (ícono de disquete).
5. Hacer clic en **Implementar → Nueva implementación**.
   - Tipo: **Aplicación web**
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
6. Autorizar los permisos que pide Google. Si aparece "Google no verificó esta app", hacer clic en **Configuración avanzada → Ir a (nombre del proyecto)**. Es el script de ustedes mismos, así que es seguro.
7. Copiar la **URL de la aplicación web** (empieza con `https://script.google.com/macros/s/...`).
8. En `index.html`, pegarla en esta línea:
   ```js
   window.ALMA_FORM_ENDPOINT = "PEGAR_AQUI_URL_DE_APPS_SCRIPT";
   ```

El flujo queda así: formulario → Apps Script → nueva fila en la hoja "Registros" (fecha, nombre, correo, área, experiencia, zona, origen UTM) → correo de aviso al equipo con el conteo de registros reales sobre el umbral de 15.

Validación: el formulario rechaza los correos mal escritos y los campos vacíos, y muestra un mensaje de confirmación al terminar.

> Si después modifican el script, hay que ir a **Implementar → Gestionar implementaciones → Editar → Versión: nueva** para que el cambio se aplique.

## 3. Instalar Google Analytics 4 (Criterio 4)

1. Entrar a <https://analytics.google.com>, crear una propiedad llamada **Alma Pro** y un flujo de datos **Web**. Por ahora pueden usar cualquier URL, porque el enlace definitivo lo obtienen en el paso 4.
2. Copiar el **ID de medición** (`G-XXXXXXXXXX`) y pegarlo en `index.html`:
   ```js
   window.ALMA_GA_ID = "G-XXXXXXXXXX";
   ```
3. La página ya envía estos dos eventos:
   - **Evento 1 – `cta_click`**: clic en "Quiero mi diagnóstico gratis".
   - **Evento 2 – `generate_lead`**: envío del formulario (correo dejado).
4. Después de la prueba del paso 5, ir a **Administrar → Eventos** y activar **"Marcar como evento clave"** (antes se llamaba "conversión") en `cta_click` y `generate_lead`.

GA4 lee automáticamente los UTM, así que en **Informes → Adquisición** se ven las visitas separadas por canal.

## 4. Publicar la página (enlace público, Criterio 1)

La página está en GitHub y se publica con **Vercel**, que es gratis:
1. Entrar a <https://vercel.com> con **"Continue with GitHub"**.
2. Ir a **Add New… → Project**, elegir el repositorio `alma-pro` y hacer clic en **Import**.
3. Dejar todo como viene (Framework Preset: **Other**, sin comando de build) y hacer clic en **Deploy**.
4. En **Settings → Domains** se puede cambiar el nombre, por ejemplo `almapro-diagnostico.vercel.app`.
5. Abrir el enlace en una **ventana de incógnito** para comprobar que se ve sin haber iniciado sesión.

Para editar la página más adelante, se modifica `index.html` y se sube el cambio a GitHub (`git add`, `git commit`, `git push`). Vercel lo publica solo en unos segundos. **Cualquier cambio hecho durante el experimento hay que anotarlo en la bitácora.**

Enlaces por canal (Criterio 4):
```
WhatsApp:  https://TU-SITIO.vercel.app/?utm_source=whatsapp&utm_medium=social&utm_campaign=mvp
Instagram: https://TU-SITIO.vercel.app/?utm_source=instagram&utm_medium=social&utm_campaign=mvp
```
El canal de origen queda guardado en la planilla, en la columna "Origen (utm_source)".

## 5. Prueba de extremo a extremo (Criterio 5)

Usen este enlace para las pruebas, porque agrega `test=1`:
```
https://TU-SITIO.vercel.app/?utm_source=whatsapp&utm_medium=social&utm_campaign=mvp&test=1
```
1. Abrirlo en una ventana de incógnito.
2. Hacer clic en el CTA y llenar el formulario con datos de prueba.
3. Revisar la planilla. La fila debería aparecer **pintada de amarillo**, con "Es prueba = SI" y origen "whatsapp". 📸 Captura 1.
4. Revisar el correo. Debería llegar un aviso con el asunto **"[PRUEBA] Alma Pro: nuevo interesado"**. 📸 Captura 2.
5. En GA4, ir a **Informes → Tiempo real** y comprobar que aparecen `page_view`, `cta_click` y `generate_lead`. 📸 Captura 3.
6. Antes del lanzamiento real, borrar las filas de prueba o dejarlas marcadas. El contador de registros del correo ya no considera las filas de prueba.

Si algo falla, anótenlo en la bitácora ("Errores encontrados y cómo se resolvieron"). Algunos errores comunes:
- **No llega la fila**: la URL de Apps Script está mal copiada, o el acceso no quedó en "Cualquier usuario".
- **Llega la fila pero no el correo**: falta autorizar MailApp o el correo en `EMAILS_EQUIPO` está mal escrito.
- **GA4 no muestra eventos**: el ID está mal, o hay un bloqueador de anuncios activo (prueben sin bloqueador).

## 6. Fórmulas del embudo (para el registro de monitoreo)

- Tasa de clic = `cta_click` ÷ visitas (usuarios en GA4)
- Tasa de registro = filas reales en la planilla ÷ visitas
