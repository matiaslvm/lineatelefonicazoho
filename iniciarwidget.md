## Etapa 1 – Información del widget para desarrollo

### 1. Contexto y alcance del widget

#### Módulo y ubicación
- **Módulo**: `L_neas_telef_nicas` (API name)
- **Ubicación**: Botón personalizado en **Lista Menú Utilidades**
- **Contexto de ejecución**: El widget se ejecutará desde la lista de registros del módulo, permitiendo acciones sobre los registros seleccionados o el contexto actual

#### Objetivo funcional
- **Problema a resolver**: Gestionar y solventar incidencias en líneas telefónicas
- **Flujo principal**: 
  - El widget forma parte de un circuito que incluye blueprints
  - Permite realizar solicitudes relacionadas con las incidencias
  - Facilita el seguimiento y resolución de problemas en líneas telefónicas
- **Acciones principales**: 
  - Crear solicitudes de incidencias
  - Gestionar el flujo de trabajo alrededor de las líneas telefónicas
  - Interactuar con blueprints existentes

### 2. Accesos y permisos

#### Permisos del SDK
- Usar los permisos estándar proporcionados por el SDK de Zoho Widgets
- Seguir la documentación oficial: https://help.zwidgets.com/help/latest/index.html
- Los scopes se configurarán según las APIs que utilicemos del SDK:
  - `ZOHO.embeddedApp` (inicialización y eventos)
  - `ZOHO.CRM.API` (lectura/escritura de datos)
  - `ZOHO.CRM.UI` (interacciones con la UI nativa si es necesario)

#### Entorno
- Trabajar dentro de Zoho CRM (según `info.md`)
- Requiere acceso al portal de desarrolladores de Zoho para desplegar el widget

### 3. Datos y campos del módulo

#### Campos iniciales a utilizar
Los siguientes campos del módulo `L_neas_telef_nicas` deben ser levantados y gestionados:

1. **Proyecto_Origen** (API name: `Proyecto_Origen`)
   - Tipo: Campo de relación o lookup (verificar en el módulo)
   - Uso: Identificar el proyecto origen de la línea telefónica

2. **Linea** (API name: `Linea`)
   - Tipo: Campo de texto o número (verificar en el módulo)
   - Uso: Número o identificador de la línea telefónica

3. **Estado** (API name: `Estado`)
   - Tipo: Campo picklist (verificar valores permitidos)
   - Uso: Estado actual de la línea telefónica

#### Operaciones necesarias
- **Lectura**: Obtener estos campos del registro actual o seleccionado
- **Escritura**: Actualizar campos cuando se creen/modifiquen solicitudes
- **Búsqueda**: Filtrar registros según estos campos si es necesario

### 4. Diseño y UI

#### Estilo visual
- **Estilo**: Moderno y limpio
- **Enfoque**: Centrado en la funcionalidad de realizar solicitudes
- **UX**: 
  - Interfaz intuitiva para crear solicitudes rápidamente
  - Visualización clara del estado de las incidencias
  - Flujo de trabajo optimizado para resolver problemas

#### Consideraciones técnicas
- El widget se ejecutará dentro de un iframe en Zoho CRM
- Debe ser responsive y adaptarse al espacio disponible
- Considerar el modo oscuro si aplica (según variables CSS del SDK)

### 5. Arquitectura técnica

#### Stack tecnológico
- **Framework**: React (ya configurado en el proyecto según `package.json`)
- **SDK**: Zoho Embedded App SDK v1.1+
- **Hosting**: Interno (según configuración de Zoho)

#### Estructura del widget
```
widget/
├── manifest.json          # Configuración del widget
├── widget.html           # Punto de entrada HTML
├── src/
│   ├── App.js            # Componente principal React
│   ├── components/       # Componentes UI
│   ├── services/         # Servicios para APIs de Zoho
│   └── utils/            # Utilidades y helpers
└── assets/               # Recursos estáticos
```

#### APIs del SDK a utilizar
1. **ZOHO.embeddedApp**
   - `init()`: Inicializar el widget
   - `on("PageLoad")`: Capturar evento de carga con datos del contexto
   - Manejo de eventos del widget

2. **ZOHO.CRM.API**
   - `getRecord()`: Obtener datos del registro actual
   - `getAllRecords()`: Obtener múltiples registros si es necesario
   - `insertRecord()`: Crear nuevas solicitudes/registros relacionados
   - `updateRecord()`: Actualizar campos del módulo

3. **ZOHO.CRM.UI** (si es necesario)
   - Modales nativos
   - Notificaciones
   - Record pickers

### 6. Próximos pasos

#### Tareas inmediatas
- [x] Configurar el `manifest.json` con la ubicación correcta (botón en menú utilidades) ✅
- [x] Crear estructura base del widget con React ✅
- [x] Implementar servicios para APIs de Zoho ✅
- [x] Crear componentes UI para gestión de solicitudes ✅
- [x] Diseñar UI moderna enfocada en solicitudes ✅
- [ ] Verificar estructura exacta del módulo `L_neas_telef_nicas` en Zoho CRM
- [ ] Confirmar tipos de datos y valores permitidos de los campos (especialmente `Estado`)
- [ ] Confirmar API name del módulo de Solicitudes para crear registros
- [ ] Revisar blueprints existentes para entender el flujo completo
- [ ] Probar el widget en el entorno de Zoho CRM

#### Configuración del manifest.json
El `manifest.json` debe especificar:
- Tipo de widget: `button` (botón personalizado)
- Ubicación: `list_menu_utilities` (Lista Menú Utilidades)
- Módulo: `L_neas_telef_nicas`
- Permisos necesarios según las APIs utilizadas

### 7. Referencias

- Documentación oficial del SDK: https://help.zwidgets.com/help/latest/index.html
- Documento de referencia: `info.md`
- Plan completo: `planwidget.md`

---

> **Nota**: Este documento se actualizará conforme avancemos en el desarrollo y descubramos más detalles técnicos específicos del módulo y los blueprints.
