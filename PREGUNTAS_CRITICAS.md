# ❓ Preguntas Críticas para el MVP

Este documento lista las preguntas que **deben resolverse antes de avanzar** con el desarrollo del MVP.

---

## 🔴 CRÍTICAS (Bloquean el desarrollo)

### 1. Módulo y Campos
- [ ] **¿El módulo `L_neas_telef_nicas` es el correcto para crear solicitudes?**
  - ¿O existe un módulo separado como `Solicitudes`, `Incidencias`, o `Tickets`?
  - Si es otro módulo, ¿cuál es su API name exacto?

- [ ] **¿Los API names de los campos son correctos?**
  - Necesitamos acceso a Zoho CRM para verificar en: 
    `Configuración > Personalización > Módulos y Campos > L_neas_telef_nicas`
  - Campos a verificar:
    - `Proyecto_Origen` ✅ (usado en código)
    - `Tipo_de_solicitud` ✅ (usado en código)
    - `Prioridad` ✅ (usado en código)
    - `Area` ✅ (usado en código)
    - `Plan` ✅ (usado en código)
    - `Empresa_Proveedor` ✅ (usado en código)
    - `Estado` ✅ (usado en código)
    - `Linea` ✅ (usado en código)
    - `Comentarios` ✅ (usado en código)
    - `Name` ✅ (usado en código)
    - `Motivo_de_reasignaci_n` ✅ (usado en código)
    - `Notificar_el_pedido` ✅ (usado en código)

### 2. Valores de Picklists
- [ ] **¿Qué valores exactos tiene el picklist `Tipo_de_solicitud`?**
  - El código normaliza valores (quita acentos, convierte a minúsculas)
  - Necesitamos los valores exactos para validar la lógica:
    - "Asignar línea disponible"
    - "Solicitar nueva línea"
    - "Reasignar línea"
    - "Reportar incidencia"
    - "Mantenimiento"
    - "Solicitar baja"
  - ¿Hay otros valores que no estamos considerando?

- [ ] **¿Los valores de `Estado` son exactamente estos?**
  - "Disponible"
  - "Baja"
  - ¿Hay otros estados como "Suspendida", "En uso", "Ocupada", etc.?

### 3. Permisos y Scopes
- [ ] **¿El scope `ZohoCRM.modules.ALL` es suficiente?**
  - ¿O necesitamos permisos específicos adicionales?
  - ¿El usuario que usa el widget tiene permisos para crear/actualizar registros?

---

## 🟡 IMPORTANTES (Afectan la funcionalidad)

### 4. Flujo de Negocio
- [ ] **¿Cómo se relacionan las solicitudes con los blueprints?**
  - ¿Hay blueprints configurados que se deben disparar automáticamente?
  - ¿Qué campos del blueprint necesitan ser poblados?

- [ ] **¿Qué pasa después de crear una solicitud?**
  - ¿Se debe cambiar el estado de la línea automáticamente?
  - ¿Se debe notificar a alguien?
  - ¿Se debe crear un registro relacionado en otro módulo?

### 5. Validaciones de Negocio
- [ ] **¿Hay reglas de negocio que debemos validar?**
  - Ejemplo: ¿Se puede asignar una línea disponible si ya tiene un propietario?
  - ¿Se puede solicitar baja de una línea que está en uso?
  - ¿Hay límites de líneas por proyecto?

### 6. Datos de Prueba
- [ ] **¿Tenemos acceso a un ambiente sandbox con datos de prueba?**
  - ¿Hay proyectos de prueba configurados?
  - ¿Hay líneas de prueba con diferentes estados?

---

## 🟢 NICE TO HAVE (Mejoras futuras)

### 7. Integraciones
- [ ] **¿Hay integraciones externas que debemos considerar?**
  - ¿Se debe notificar a sistemas externos?
  - ¿Hay APIs externas que debemos consumir?

### 8. Reportes y Analytics
- [ ] **¿Necesitamos tracking de acciones?**
  - ¿Qué métricas son importantes?
  - ¿Hay dashboards que deben actualizarse?

---

## 📋 Checklist de Validación

Antes de marcar como resuelto, asegurarse de:

- [ ] Valor confirmado en el CRM real (no asumido)
- [ ] Documentado en el código o en un archivo de configuración
- [ ] Probado en sandbox
- [ ] Comunicado al equipo

---

## 🎯 Cómo Resolver Estas Preguntas

### Opción 1: Acceso Directo al CRM
1. Ir a `Configuración > Personalización > Módulos y Campos`
2. Seleccionar el módulo `L_neas_telef_nicas`
3. Revisar cada campo y copiar el API name exacto
4. Revisar los valores de cada picklist

### Opción 2: Consultar con el Equipo
1. Contactar al administrador de Zoho CRM
2. Solicitar documentación de campos y módulos
3. Pedir acceso a sandbox para pruebas

### Opción 3: Usar el SDK para Inspeccionar
1. Crear un widget temporal de diagnóstico
2. Usar `ZOHO.CRM.API.getFields()` para obtener estructura
3. Usar `ZOHO.CRM.API.getAllRecords()` para ver valores reales

---

## 📝 Notas

- **Fecha de creación**: [Fecha]
- **Última actualización**: [Fecha]
- **Responsable**: [Nombre]

---

**⚠️ IMPORTANTE**: No avanzar con desarrollo significativo hasta resolver al menos las preguntas marcadas como 🔴 CRÍTICAS.


