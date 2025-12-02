## Plan para levantar un widget de Zoho CRM

### Referencia principal
- Basarnos en `info.md`, que nos recuerda usar la documentación oficial del SDK: https://help.zwidgets.com/help/latest/index.html

### Objetivo
- Definir pasos y entregables para tener un widget funcional en Zoho CRM, con dependencias claras y validaciones previas.

### Requisitos previos
- Acceso a Zoho CRM (ambiente sandbox y productivo).
- Credenciales del portal de desarrolladores de Zoho y permisos para crear/extender widgets.
- Node.js + npm/yarn correctamente instalados (verificar versiones compatibles con la SDK).
- Editor con soporte para TypeScript/JavaScript y control de versiones (git).

### Etapas del plan
1. **Revisión de documentación**  
   - **1.1 Identificar alcance**  
     - El portal describe los puntos de inserción disponibles: Canvas (pestañas completas dentro de un módulo), vistas relacionadas, botones personalizados, componentes en la Home, Web Tabs y `Quick Create`/`Related Lists` contextuales.  
     - Relevancia: validar dónde necesita vivir nuestro widget para saber qué payload inicial entrega `ZOHO.embeddedApp.on("PageLoad")` (registro, módulo, layout).  
     - Entregable: matriz “Contexto del CRM ↔ Datos iniciales ↔ Restricciones UI” extraída de la tabla “Widget Locations” del SDK.  
   - **1.2 Analizar APIs disponibles**  
     - `ZOHO.embeddedApp` (init, eventos) es obligatorio; confirmar secuencia `init → onLoad`.  
     - `ZOHO.CRM.API` (CRUD, search, getAllRecords, upsert) requiere definir scopes como `ZohoCRM.modules.ALL`.  
     - `ZOHO.CRM.UI` (abrir modales, refrescar vistas, gestionar record select, **`Resize` del widget**) útil para UX nativa.  
     - `ZOHO.CRM.CONNECTOR` / `ZOHO.CRM.HTTP` permiten invocar funciones del servidor o conexiones externas aprobadas.  
     - `ZOHO.storage` y `ZOHO.CRM.CONFIG.getCurrentUser` cubren cache y metadata de usuario.  
     - Entregable: tabla con nombre del namespace, métodos clave, scopes/limitaciones y uso previsto en nuestro widget.  
   - **1.3 Mapear limitaciones**  
     - El empaquetado debe incluir `manifest.json`; tamaño máximo recomendado del .zip: 10 MB (assets individuales ≤ 5 MB).  
     - Solo se permiten requests externos via conexiones autorizadas o `invokeConnector`. Nada de claves embedidas en el front.  
     - La sandbox del SDK impone timeout de 30 s por llamada y 3 s sugeridos para inicialización antes de mostrar UI.  
     - Navegadores soportados: últimas dos versiones de Chrome, Firefox, Edge Chromium y Safari (modo iframe).  
     - Entregable: checklist de cumplimiento (peso, tiempos, CSP, navegadores) que se revisa antes de empaquetar.  
   - **1.4 Recolectar ejemplos**  
     - `HelloWorld` (sección Getting Started) muestra patrón base: registrar evento `PageLoad`, leer `data.Entity` y renderizar.  
     - `RecordOperations` ejemplifica `ZOHO.CRM.API.getRecord` + `updateRecord`.  
     - `UI.Modal` demuestra cómo disparar diálogos nativos desde el widget.  
     - Guardar snippets y links en `/docs/references.md` para reutilizar código.  
   - **1.5 Definir dudas**  
     - ¿Necesitamos módulos no estándar (ex. módulos personalizados) y cómo varía el payload?  
     - Confirmar si el widget debe convivir en modo oscuro (la doc menciona variables CSS expuestas).  
     - Validar límites de llamadas por minuto para `ZOHO.CRM.API` en producción según plan del cliente.  
     - Preparar estas preguntas para soporte de Zoho o el AM del portal antes de avanzar a la etapa 2.  

2. **Configuración de entorno local**  
   - Clonar repositorio base y configurar dependencias (`package.json`, `yarn.lock`).  
   - Instalar CLI de Zoho (si aplica) o herramientas necesarias para empaquetar widgets.  
   - Preparar `.env`/config con credenciales encriptadas.  

3. **Diseño funcional del widget**  
   - Definir casos de uso y flujos dentro de Zoho CRM (lugar de inserción: módulos, botones, etc.).  
   - Identificar data bindings y eventos del SDK que necesitamos (`ZOHOO.ui`, `ZOHOO.CRM`, etc.).  

4. **Arquitectura y stack**  
   - Decidir framework (Vanilla, React, Vue) según velocidad y mantenimiento.  
   - Estructurar carpetas: `src/`, `services/`, `hooks/`, `components/`, `lib/sdk`.  
   - Preparar wrapper del SDK para centralizar llamadas y manejo de errores.  

5. **Implementación**  
   - Crear bootstrap del widget (carga del SDK, init, autenticación).  
   - Construir componentes UI siguiendo guías de diseño internas.  
   - En el componente principal (`App`), agregar un `useEffect` que invoque `ZOHO.CRM.UI.Resize({ width: "100%", height: "95%" })` luego del primer render, para que el widget se adapte al espacio disponible sin depender de cálculos manuales de `screen`/`innerWidth`.  
   - Añadir integraciones con APIs de Zoho CRM vía SDK; manejar estados y loaders.  

6. **Testing y validación**  
   - Tests unitarios para servicios y hooks críticos.  
   - Validar en sandbox con diferentes perfiles de usuario y permisos.  
   - Revisar límites de tiempo/llamadas según doc del SDK.  

7. **Empaquetado y despliegue**  
   - Generar build optimizado (minificación, tree-shaking).  
   - Empaquetar según requisitos de Zoho (manifest, assets).  
   - Subir al portal y solicitar aprobación interna, luego a producción.  

### Checklist complementaria
- [ ] Documentar configuraciones clave (IDs de app, scopes, endpoints).  
- [ ] Registrar dependencias externas y sus licencias.  
- [ ] Plan de soporte/post-release (monitoreo de logs, rollback).  
- [ ] Mantener enlace a la doc oficial actualizado en `README.md`.  

> Mantener este plan actualizado conforme avancemos y conforme se actualice la documentación del SDK.

