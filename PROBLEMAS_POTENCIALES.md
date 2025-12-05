# ⚠️ Problemas Potenciales Identificados

Este documento lista problemas potenciales encontrados en el código que deben validarse durante las pruebas.

---

## 🔴 CRÍTICOS (Deben validarse antes del MVP)

### 1. Formato de `insertRecord` - Posible Inconsistencia

**Ubicación**: `src/services/zohoAPI.js` línea 202-227

**Problema**: 
- Según `info.md` (líneas 123-135), el formato debería ser:
  ```javascript
  const recordData = {
    data: [{
      Campo_API_Name: valor
    }]
  };
  ```
- Pero el código actual pasa `recordData` directamente sin envolver en `{ data: [...] }`
- El comentario dice "La JS SDK de widgets espera el body plano (no envuelto en data[])"

**Acción requerida**:
- [ ] Validar en sandbox si el formato actual funciona
- [ ] Si falla, ajustar para usar el formato `{ data: [...] }`
- [ ] Actualizar comentario según el resultado

**Código actual**:
```javascript
window.ZOHO.CRM.API.insertRecord({
  Entity: module,
  APIData: recordData  // recordData se pasa directamente
})
```

**Código sugerido (si falla)**:
```javascript
const apiData = {
  data: [recordData]
};

window.ZOHO.CRM.API.insertRecord({
  Entity: module,
  APIData: apiData
})
```

---

### 2. Formato de `updateRecord` - Posible Inconsistencia

**Ubicación**: `src/services/zohoAPI.js` línea 236-267

**Problema**:
- Según `info.md` (líneas 138-150), `updateRecord` debería usar `RecordID` como parámetro separado:
  ```javascript
  window.ZOHO.CRM.API.updateRecord({
    Entity: 'Nombre_Modulo',
    RecordID: '123456789',
    APIData: updateData
  });
  ```
- Pero el código actual incluye `id` dentro del `APIData` y no usa `RecordID` como parámetro

**Acción requerida**:
- [ ] Validar en sandbox si el formato actual funciona
- [ ] Si falla, ajustar para usar `RecordID` como parámetro separado
- [ ] Verificar si `APIData` también necesita `{ data: [...] }`

**Código actual**:
```javascript
const apiData = {
  id: recordId,
  ...recordData
};

window.ZOHO.CRM.API.updateRecord({
  Entity: module,
  APIData: apiData
})
```

**Código sugerido (si falla)**:
```javascript
const apiData = {
  data: [{
    id: recordId,
    ...recordData
  }]
};

window.ZOHO.CRM.API.updateRecord({
  Entity: module,
  RecordID: recordId,
  APIData: apiData
})
```

---

### 3. Notificaciones - API Incorrecta

**Ubicación**: `src/services/zohoAPI.js` línea 274-290

**Problema**:
- El código intenta usar `window.ZOHO.CRM.UI.Popup.show()` pero según `info.md` (líneas 39-40), debería ser:
  - `ZOHO.CRM.UI.Popup.showSuccessToast({ message })`
  - `ZOHO.CRM.UI.Popup.showErrorToast({ message })`

**Acción requerida**:
- [ ] Cambiar a usar `showSuccessToast` y `showErrorToast` según el tipo
- [ ] Validar que estas APIs existen en el SDK

**Código actual**:
```javascript
window.ZOHO.CRM.UI.Popup.show({
  type: type === 'error' ? 'error' : 'success',
  message
});
```

**Código sugerido**:
```javascript
if (type === 'error') {
  window.ZOHO.CRM.UI.Popup.showErrorToast({ message });
} else {
  window.ZOHO.CRM.UI.Popup.showSuccessToast({ message });
}
```

---

## 🟡 IMPORTANTES (Afectan UX pero no bloquean)

### 4. Normalización de Tipos de Solicitud - Frágil

**Ubicación**: `src/App.js` múltiples lugares (líneas 158-217, 241-392)

**Problema**:
- La lógica de normalización (quitar acentos, convertir a minúsculas) es frágil
- Si los valores del picklist cambian ligeramente, la lógica falla
- Ejemplo: "Asignar línea disponible" vs "Asignar Linea Disponible" vs "Asignar Línea Disponible"

**Riesgo**: 
- Si los valores del CRM no coinciden exactamente con lo esperado, las validaciones fallan

**Acción requerida**:
- [ ] Validar valores exactos del picklist `Tipo_de_solicitud` en el CRM
- [ ] Considerar usar `actual_value` en lugar de normalización de strings
- [ ] Agregar logging para debug cuando la normalización no encuentra coincidencias

---

### 5. Manejo de Estados - Case Sensitive

**Ubicación**: `src/services/zohoAPI.js` línea 173, `src/App.js` múltiples lugares

**Problema**:
- El código convierte estados a minúsculas para comparar: `estado.toLowerCase()`
- Pero si el CRM devuelve estados con diferentes casos o espacios, puede fallar
- Ejemplo: "Disponible" vs "disponible" vs "DISPONIBLE" vs " Disponible "

**Acción requerida**:
- [ ] Validar valores exactos del campo `Estado` en el CRM
- [ ] Considerar usar trim() además de toLowerCase()
- [ ] Documentar valores esperados

---

### 6. Performance - getAllRecords sin límite

**Ubicación**: `src/services/zohoAPI.js` línea 163

**Problema**:
- `getAllRecords` se llama con `per_page: 200` pero no hay manejo de paginación
- Si hay más de 200 registros, no se obtendrán todos
- Si hay muchos registros, puede ser lento

**Acción requerida**:
- [ ] Validar cuántos registros hay típicamente por proyecto
- [ ] Si hay > 200, implementar paginación o usar criterios de filtrado más específicos
- [ ] Considerar usar `searchRecord` con criterios en lugar de traer todos

---

### 7. Manejo de Errores - Mensajes Genéricos

**Ubicación**: Múltiples lugares en `src/App.js`

**Problema**:
- Los mensajes de error son genéricos: "Error al procesar la solicitud"
- No se muestra el error específico del SDK al usuario
- Dificulta debugging en producción

**Acción requerida**:
- [ ] Mejorar manejo de errores para mostrar mensajes más específicos
- [ ] Loggear errores completos en consola para debugging
- [ ] Considerar mostrar mensajes diferentes según el tipo de error (permisos, validación, red, etc.)

---

## 🟢 MENORES (Mejoras de código)

### 8. Validación de Campos Requeridos

**Ubicación**: `src/components/SolicitudForm.js` línea 155-165

**Problema**:
- La validación es compleja y podría simplificarse
- Algunos campos requeridos condicionalmente pueden no estar claros

**Sugerencia**:
- [ ] Simplificar lógica de validación
- [ ] Agregar validación visual en tiempo real
- [ ] Documentar qué campos son requeridos para cada tipo de solicitud

---

### 9. Reset de Formulario

**Ubicación**: `src/components/SolicitudForm.js` línea 38-40

**Problema**:
- El formulario se resetea cuando cambia `selectedProject`, `availabilityStatus`, o `selectedTipoSolicitud`
- Pero `initialFormState` está definido dentro del componente, podría causar problemas de referencia

**Sugerencia**:
- [ ] Mover `initialFormState` fuera del componente o usar `useMemo`
- [ ] Considerar si realmente queremos resetear todos los campos al cambiar tipo de solicitud

---

### 10. Autocompletado de Plan

**Ubicación**: `src/components/SolicitudForm.js` línea 47-59

**Problema**:
- El autocompletado de Plan solo funciona para "Asignar línea disponible"
- Podría ser útil para otros tipos también

**Sugerencia**:
- [ ] Considerar extender autocompletado a otros tipos de solicitud
- [ ] Validar que el Plan existe en los picklists antes de autocompletar

---

## 📋 Checklist de Validación

Antes de considerar el MVP listo, validar:

- [ ] ✅ Formato de `insertRecord` funciona correctamente
- [ ] ✅ Formato de `updateRecord` funciona correctamente
- [ ] ✅ Notificaciones se muestran correctamente
- [ ] ✅ Valores de picklists coinciden con la normalización
- [ ] ✅ Valores de Estado se manejan correctamente
- [ ] ✅ Performance es aceptable con volumen real de datos
- [ ] ✅ Errores se manejan y muestran correctamente

---

## 🎯 Prioridad de Resolución

1. **CRÍTICOS**: Resolver antes de cualquier prueba en producción
2. **IMPORTANTES**: Resolver durante Fase 1 del roadmap
3. **MENORES**: Resolver durante Fase 2 o post-MVP

---

**Última actualización**: [Fecha]
**Revisado por**: [Nombre]



