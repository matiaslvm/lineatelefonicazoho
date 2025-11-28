# Estructura del Widget - Gestión de Líneas Telefónicas

## Resumen de implementación

Se ha configurado la estructura inicial del widget para gestionar incidencias y solicitudes en líneas telefónicas dentro de Zoho CRM. El flujo se actualizó para que las solicitudes se gestionen dentro del mismo módulo `L_neas_telef_nicas`, tomando como punto de partida el campo picklist `Proyecto_Origen` y determinando disponibilidad según el `Estado = "Disponible"`.

## Archivos creados/modificados

### Configuración
- **`manifest.json`**: Configuración del widget como botón en Lista Menú Utilidades del módulo `L_neas_telef_nicas`

### Servicios
- **`src/services/zohoAPI.js`**: Servicio centralizado para interactuar con las APIs de Zoho CRM
  - `getRecord()`: Obtener un registro específico
  - `getAllRecords()`: Obtener múltiples registros
  - `insertRecord()`: Crear nuevos registros
  - `updateRecord()`: Actualizar registros existentes
  - `showNotification()`: Mostrar notificaciones nativas

### Componentes React
- **`src/components/LineaInfo.js`**: Componente para mostrar información de la línea telefónica
  - Muestra: Número de línea, Estado, Proyecto origen
  - Incluye badges de estado con colores
  
- **`src/components/SolicitudForm.js`**: Formulario para crear nuevas solicitudes
  - Campos: Tipo, Prioridad, Descripción
  - Validación de campos requeridos
  - Estados de carga

### Componente principal
- **`src/App.js`**: Componente principal del widget
  - Carga datos del módulo `L_neas_telef_nicas`
  - Gestiona el estado de la aplicación
  - Integra los componentes de UI
  - Maneja la creación de solicitudes

### Estilos
- **`src/App.css`**: Estilos principales del widget (diseño moderno y responsive)
- **`src/components/LineaInfo.css`**: Estilos del componente de información
- **`src/components/SolicitudForm.css`**: Estilos del formulario
- **`src/index.css`**: Estilos globales actualizados

## Campos del módulo utilizados

- **`Proyecto_Origen`** (picklist): Proyecto origen de la línea telefónica. Se usa como filtro inicial y para contar disponibilidad por proyecto.
- **`Linea`**: Número de línea telefónica.
- **`Estado`**: Estado actual de la línea. Determina disponibilidad (`Disponible` = libre).

## Funcionalidades implementadas

✅ Carga dinámica de valores del picklist `Proyecto_Origen`
✅ Consulta de disponibilidad (total vs. líneas con `Estado = Disponible`)
✅ Banner de estado según disponibilidad
✅ Formulario contextual (asignación vs nueva línea)
✅ Integración con APIs de Zoho CRM
✅ Manejo de errores y estados de carga
✅ Diseño responsive y moderno
✅ Notificaciones de éxito/error

### Flujo actualizado de disponibilidad
1. El usuario selecciona un valor de `Proyecto_Origen` desde un desplegable (picklist del módulo).
2. El widget consulta el módulo `L_neas_telef_nicas` con criterio `(Proyecto_Origen:equals:valor)` y calcula totales/disponibles (`Estado = Disponible`).
3. Se muestra un resumen visual (cards + banner) con la situación actual del proyecto.
4. Según la disponibilidad detectada, el formulario se preconfigura para **Asignación** (hay líneas libres) o **Solicitud de nueva línea** (sin disponibilidad).
5. Al enviar el formulario se crea un nuevo registro en `L_neas_telef_nicas` con `Proyecto_Origen`, un identificador temporal en `Linea` y la descripción formateada con tipo/prioridad.

## Próximos pasos

1. **Implementar lógica de solicitudes dentro del mismo módulo**: Crear registros nuevos en `L_neas_telef_nicas` cuando no haya líneas disponibles.
2. **Mapear campos adicionales del módulo**: Definir qué campos se completan al generar la solicitud (teléfono, estado inicial, responsable, etc.).
3. **Integrar con Blueprints**: Disparar el blueprint correspondiente al crear o asignar una línea.
4. **Testing**: Probar el widget en el entorno de Zoho CRM con distintos proyectos y estados.
5. **Ajustes de UI**: Refinar el diseño según feedback.

## Cómo probar

1. Ejecutar `npm start` para desarrollo local
2. En Zoho CRM, ir a `Settings > Widgets > New Widget`
3. Seleccionar "External Host" y pegar la URL de localhost
4. O construir con `npm run build` y subir el .zip generado en `dist/app.zip`

## Notas importantes

- El widget está configurado para ejecutarse como botón en el menú de utilidades de la lista.
- Los campos se mapean automáticamente desde el registro actual.
- El flujo de solicitudes se resuelve dentro del módulo `L_neas_telef_nicas`; si no existen líneas disponibles en un proyecto, se crea un nuevo registro para iniciar la gestión.
- Todos los servicios están basados en la documentación oficial del SDK: https://help.zwidgets.com/help/latest/index.html

