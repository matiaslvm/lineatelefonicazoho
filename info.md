SOS UN EXPERTO EN REALIZAR WIDGETS DE ZOHO CRM CON LA SDK.

Necesito que tomes este documento como referencia para todo lo relacionado con Zoho Widgets. 
Te voy a compartir url de la web donde tenes que sacar toda la información para poder hacer consultas a la JS SDK

SIEMPRE PERO SIEMPRE VAMOS A TRABAJAR DENTRO DE ZOHO CRM

URL; https://help.zwidgets.com/help/latest/index.html

---

## AYUDA MEMORIA - SDK ZOHO WIDGETS

### APIs Disponibles en el SDK

#### 1. ZOHO.embeddedApp
- **`init()`**: Inicializar el widget (obligatorio)
- **`on("PageLoad", callback)`**: Capturar evento de carga con datos del contexto
  - `data.Entity`: Nombre del módulo
  - `data.EntityId`: ID del registro actual
- **`on("ButtonClick", callback)`**: Capturar clic en botón personalizado

#### 2. ZOHO.CRM.API
- **`getRecord({ Entity, RecordID })`**: Obtener un registro específico
- **`getAllRecords({ Entity, per_page, criteria, ... })`**: Obtener múltiples registros
- **`insertRecord({ Entity, APIData })`**: Crear un nuevo registro
  - `APIData`: `{ data: [{ campo1: valor1, campo2: valor2 }] }`
- **`updateRecord({ Entity, RecordID, APIData })`**: Actualizar un registro existente
- **`searchRecord({ Entity, Type, Criteria })`**: Buscar registros por criterios
- **`getFields({ Entity })`**: Obtener estructura de campos del módulo (incluye picklist values)
  - Retorna: `{ fields: [{ api_name, pick_list_values: [{ actual_value, display_value }] }] }`

#### 3. ZOHO.CRM.META
- **`getFields({ Entity })`**: Obtener metadata de campos del módulo
  - Retorna información completa de campos, incluyendo valores de picklists
  - Alternativa a `ZOHO.CRM.API.getFields` si está disponible

#### 4. ZOHO.CRM.UI
- **`Popup.showSuccessToast({ message })`**: Mostrar notificación de éxito
- **`Popup.showErrorToast({ message })`**: Mostrar notificación de error
- **`Resize({ width, height })`**: Redimensionar el contenedor/modal del widget (acepta valores en px o en `%` del área disponible)
- Modales nativos, record pickers, etc.

### Patrones y Mejores Prácticas

#### Inicialización del Widget
```javascript
window.ZOHO.embeddedApp.on("PageLoad", function(data) {
  // data.Entity: módulo actual
  // data.EntityId: ID del registro actual
  // Tu código aquí
});
window.ZOHO.embeddedApp.init();
```

#### Resize del Widget (tamaño y disposición)
- **Regla práctica**: el resize debe hacerse **desde el componente principal (por ej. `App`) usando `useEffect`**, no desde `index.js` con lógica propia de tamaños.
- Usar siempre la API oficial `ZOHO.CRM.UI.Resize` con porcentajes para que Zoho decida el tamaño máximo permitido del modal.

Ejemplo en React (`App.js`):

```javascript
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.ZOHO &&
      window.ZOHO.CRM &&
      window.ZOHO.CRM.UI &&
      window.ZOHO.CRM.UI.Resize
    ) {
      window.ZOHO.CRM.UI.Resize({
        width: '100%',   // ocupar todo el ancho permitido
        height: '95%'    // casi todo el alto disponible
      });
    }
  }, []);

  // ...resto del componente
}
```

**Errores a evitar (lecciones aprendidas):**
- No recalcular manualmente `width/height` con `screen.width`, `innerHeight`, etc. salvo casos muy específicos.
- No mezclar `Resize` con CSS que limite la altura (`max-height`, `overflow` en contenedores raíz), porque el contenido se “corta” aunque el modal crezca.

#### Obtener Valores de Picklist
**Método 1: Desde registros existentes** (si hay registros con valores)
```javascript
const records = await getAllRecords(module, { per_page: 200 });
const uniqueValues = new Map();
records.forEach(rec => {
  const val = rec[fieldApiName];
  if (val) uniqueValues.set(val, { value: val, label: val });
});
return Array.from(uniqueValues.values());
```

**Método 2: Desde configuración del módulo** (recomendado)
```javascript
// Intentar ZOHO.CRM.API.getFields primero
if (window.ZOHO.CRM.API.getFields) {
  const response = await window.ZOHO.CRM.API.getFields({ Entity: module });
  const field = response.fields.find(f => f.api_name === fieldApiName);
  if (field && field.pick_list_values) {
    return field.pick_list_values.map(item => ({
      value: item.actual_value || item.display_value,
      label: item.display_value || item.actual_value
    }));
  }
}

// Si no funciona, intentar ZOHO.CRM.META.getFields
if (window.ZOHO.CRM.META.getFields) {
  const response = await window.ZOHO.CRM.META.getFields({ Entity: module });
  // Mismo procesamiento...
}
```

#### Crear un Registro
```javascript
const recordData = {
  data: [{
    Campo_API_Name: valor,
    Otro_Campo: otroValor
  }]
};

await window.ZOHO.CRM.API.insertRecord({
  Entity: 'Nombre_Modulo',
  APIData: recordData
});
```

#### Actualizar un Registro
```javascript
const updateData = {
  data: [{
    Campo_API_Name: nuevoValor
  }]
};

await window.ZOHO.CRM.API.updateRecord({
  Entity: 'Nombre_Modulo',
  RecordID: '123456789',
  APIData: updateData
});
```

#### Buscar Registros con Criterios
```javascript
// Nota: La sintaxis de criteria puede variar, mejor filtrar en frontend
const records = await getAllRecords(module, { per_page: 200 });
const filtered = records.filter(rec => rec.Campo === valor);
```

### Consideraciones Importantes

1. **Nombres de Campos**: Los API names son case-sensitive. Usar exactamente como están en Zoho CRM
   - Verificar en: Configuración > Personalización > Módulos y Campos > [Módulo] > [Campo] > API Name

2. **Picklists**: 
   - Los valores tienen `actual_value` (valor interno) y `display_value` (valor mostrado)
   - Usar `actual_value` para guardar, `display_value` para mostrar

3. **Manejo de Errores**: Siempre usar try/catch y mostrar mensajes al usuario

4. **Permisos**: El widget necesita permisos adecuados en Zoho CRM para leer/escribir datos

5. **Limitaciones**:
   - Tamaño máximo del widget: 10 MB (assets individuales ≤ 5 MB)
   - Timeout sugerido: 3s para inicialización, 30s por llamada
   - Navegadores: últimas dos versiones de Chrome, Firefox, Edge, Safari

### Estructura de Respuestas

#### getRecord / insertRecord / updateRecord
```javascript
{
  data: [{
    id: "123456789",
    Campo_API_Name: "valor",
    // ... otros campos
  }]
}
```

#### getAllRecords
```javascript
[
  { id: "123", Campo: "valor1" },
  { id: "456", Campo: "valor2" }
]
```

#### getFields / META.getFields
```javascript
{
  fields: [{
    api_name: "Campo_API",
    data_type: "picklist",
    pick_list_values: [
      { actual_value: "valor1", display_value: "Valor 1" },
      { actual_value: "valor2", display_value: "Valor 2" }
    ]
  }]
}
```

### Flujo Típico de un Widget

1. **Inicialización**: `ZOHO.embeddedApp.init()` y `on("PageLoad")`
2. **Cargar datos**: `getAllRecords` o `getRecord` según necesidad
3. **Obtener opciones**: `getFields` para picklists
4. **Procesar interacción**: Validar y preparar datos
5. **Guardar**: `insertRecord` o `updateRecord`
6. **Feedback**: `showSuccessToast` o `showErrorToast`

---

**Última actualización**: Basado en experiencia práctica con el widget de Líneas Telefónicas
