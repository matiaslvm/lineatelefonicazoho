# 🗺️ Roadmap MVP - Widget de Gestión de Líneas Telefónicas

## 📊 Estado Actual del Proyecto

### ✅ **Completado**
- [x] Configuración inicial del widget (`manifest.json`)
- [x] Inicialización del SDK de Zoho (`index.js`)
- [x] Servicios de API centralizados (`zohoAPI.js`)
- [x] Componentes React base (`LineaInfo`, `SolicitudForm`)
- [x] Lógica de negocio principal (`App.js`)
- [x] Resize del widget implementado
- [x] Manejo de errores y notificaciones
- [x] Soporte para múltiples tipos de solicitudes:
  - Asignar línea disponible
  - Solicitar nueva línea
  - Reasignar línea
  - Reportar incidencia
  - Mantenimiento
  - Solicitar baja

---

## 🎯 Objetivo del MVP

**Entregar un widget funcional que permita:**
1. Visualizar disponibilidad de líneas telefónicas por proyecto
2. Crear solicitudes/actualizar líneas según el tipo seleccionado
3. Validar datos antes de guardar
4. Proporcionar feedback claro al usuario

---

## 📋 Fases del Roadmap

### **FASE 1: Validación y Ajustes Críticos** ⚠️ (Prioridad ALTA)
**Duración estimada: 2-3 días**

#### 1.1 Validación de Campos y Módulos
- [ ] **Verificar API names exactos** de todos los campos usados:
  - `Proyecto_Origen`
  - `Tipo_de_solicitud`
  - `Prioridad`
  - `Area`
  - `Plan`
  - `Empresa_Proveedor`
  - `Estado`
  - `Linea`
  - `Comentarios`
  - `Name`
  - `Motivo_de_reasignaci_n`
  - `Notificar_el_pedido`
- [ ] **Confirmar módulo destino**: Verificar si las solicitudes se crean en `L_neas_telef_nicas` o en otro módulo separado
- [ ] **Validar valores de picklists**: Confirmar que los valores esperados coinciden con los del CRM
- [ ] **Documentar mapeo**: Crear archivo `CAMPOS_MAPEO.md` con la correspondencia campo → API name

#### 1.2 Corrección de Servicios API
- [ ] **Revisar `insertRecord`**: Verificar formato correcto según SDK (actualmente usa `APIData` directamente)
- [ ] **Revisar `updateRecord`**: Confirmar que el formato con `id` en el body es correcto
- [ ] **Validar manejo de respuestas**: Asegurar que se manejan correctamente los diferentes formatos de respuesta del SDK
- [ ] **Mejorar manejo de errores**: Agregar mensajes más descriptivos según tipo de error

#### 1.3 Testing Básico en Sandbox
- [ ] **Configurar widget en sandbox** de Zoho CRM
- [ ] **Probar carga inicial**: Verificar que el widget se carga correctamente
- [ ] **Probar carga de picklists**: Validar que todos los picklists se cargan correctamente
- [ ] **Probar consulta de disponibilidad**: Verificar que los filtros funcionan correctamente
- [ ] **Probar creación de solicitud**: Validar cada tipo de solicitud (al menos 1 de cada tipo)

---

### **FASE 2: Mejoras de UX y Validaciones** 🔧 (Prioridad MEDIA)
**Duración estimada: 3-4 días**

#### 2.1 Mejoras de Interfaz
- [ ] **Estados de carga mejorados**: Agregar skeletons o spinners más informativos
- [ ] **Mensajes de error contextuales**: Mejorar mensajes según el tipo de error
- [ ] **Validación en tiempo real**: Mostrar errores de validación mientras el usuario completa el formulario
- [ ] **Confirmación antes de guardar**: Agregar modal de confirmación para acciones críticas (ej: baja de línea)

#### 2.2 Optimizaciones de Performance
- [ ] **Cache de picklists**: Evitar recargar picklists en cada render si no cambian
- [ ] **Lazy loading**: Cargar estadísticas solo cuando se selecciona un proyecto
- [ ] **Debounce en búsquedas**: Si se agregan búsquedas, implementar debounce
- [ ] **Optimizar consultas**: Revisar si se pueden reducir las llamadas a `getAllRecords`

#### 2.3 Validaciones Adicionales
- [ ] **Validar permisos**: Verificar que el usuario tiene permisos para crear/actualizar registros
- [ ] **Validar campos requeridos**: Asegurar que todos los campos requeridos están marcados correctamente
- [ ] **Validar formato de datos**: Verificar formatos de números, fechas, etc. según el módulo
- [ ] **Prevenir duplicados**: Si aplica, validar que no se crean solicitudes duplicadas

---

### **FASE 3: Funcionalidades Adicionales** 🚀 (Prioridad BAJA - Post-MVP)
**Duración estimada: 5-7 días**

#### 3.1 Visualización de Historial
- [ ] **Mostrar historial de solicitudes**: Listar solicitudes previas del proyecto seleccionado
- [ ] **Filtros de historial**: Permitir filtrar por tipo, estado, fecha
- [ ] **Vista detallada**: Mostrar detalles completos de una solicitud al hacer clic

#### 3.2 Integración con Blueprints
- [ ] **Investigar blueprints existentes**: Entender cómo funcionan los blueprints en el CRM
- [ ] **Conectar con blueprints**: Integrar el widget con los blueprints de aprobación/flujo
- [ ] **Notificaciones automáticas**: Usar blueprints para enviar notificaciones

#### 3.3 Mejoras de Reportes
- [ ] **Dashboard de estadísticas**: Mostrar gráficos de disponibilidad por proyecto
- [ ] **Exportar datos**: Permitir exportar reportes de disponibilidad
- [ ] **Filtros avanzados**: Agregar más filtros para búsqueda de líneas

---

## 🔍 Preguntas Críticas a Resolver

### Antes de continuar, necesitamos confirmar:

1. **¿El módulo `L_neas_telef_nicas` es el correcto para crear solicitudes?**
   - ¿O existe un módulo separado como `Solicitudes` o `Incidencias`?

2. **¿Los campos usados tienen los API names correctos?**
   - Necesitamos acceso a Zoho CRM para verificar en: Configuración > Personalización > Módulos y Campos

3. **¿Qué valores tienen los picklists?**
   - Especialmente `Tipo_de_solicitud` para validar la lógica de normalización

4. **¿Hay blueprints configurados?**
   - ¿Cómo se relacionan con las solicitudes creadas?

5. **¿Qué permisos necesita el widget?**
   - ¿Solo lectura/escritura en `L_neas_telef_nicas` o también en otros módulos?

---

## 📝 Checklist Pre-Deploy

### Antes de considerar el MVP listo:

- [ ] Todos los campos validados contra el CRM real
- [ ] Todos los tipos de solicitud probados exitosamente
- [ ] Manejo de errores probado (red, permisos, datos inválidos)
- [ ] Performance aceptable (< 3s inicialización, < 2s por acción)
- [ ] Compatibilidad con navegadores validada (Chrome, Firefox, Edge, Safari)
- [ ] Tamaño del widget < 10 MB
- [ ] Documentación de uso básica creada
- [ ] Código revisado y comentado
- [ ] Sin errores de consola en producción
- [ ] Pruebas con diferentes perfiles de usuario

---

## 🎯 Criterios de Éxito del MVP

El MVP se considerará **completo** cuando:

1. ✅ Usuario puede seleccionar un proyecto y ver disponibilidad
2. ✅ Usuario puede crear una solicitud de cualquier tipo sin errores
3. ✅ Los datos se guardan correctamente en Zoho CRM
4. ✅ El widget muestra feedback claro en cada acción
5. ✅ Manejo de errores funciona correctamente
6. ✅ El widget se carga en < 3 segundos
7. ✅ Funciona en los navegadores principales

---

## 📅 Timeline Sugerido

```
Semana 1: Fase 1 (Validación y Ajustes Críticos)
  - Día 1-2: Validación de campos y módulos
  - Día 3: Corrección de servicios API
  - Día 4-5: Testing básico en sandbox

Semana 2: Fase 2 (Mejoras de UX)
  - Día 1-2: Mejoras de interfaz
  - Día 3: Optimizaciones de performance
  - Día 4-5: Validaciones adicionales

Post-MVP: Fase 3 (Funcionalidades adicionales)
  - Según necesidades del negocio
```

---

## 🚨 Riesgos Identificados

1. **API names incorrectos**: Podría requerir refactorización significativa
2. **Módulo destino incorrecto**: Necesitaría cambios en la lógica de creación
3. **Permisos insuficientes**: Podría bloquear funcionalidades críticas
4. **Performance con muchos registros**: Si hay > 200 líneas por proyecto, `getAllRecords` podría ser lento
5. **Valores de picklists inconsistentes**: La normalización podría fallar con valores inesperados

---

## 📚 Recursos y Referencias

- Documentación SDK: https://help.zwidgets.com/help/latest/index.html
- Archivo de referencia: `info.md`
- Plan original: `planwidget.md`
- Estructura actual: `ESTRUCTURA_WIDGET.md`

---

## 💬 Próximos Pasos Inmediatos

1. **Revisar este roadmap** y confirmar prioridades
2. **Resolver preguntas críticas** con acceso al CRM
3. **Comenzar Fase 1** con validación de campos
4. **Establecer canal de comunicación** para feedback rápido

---

**Última actualización**: [Fecha]
**Responsable**: [Nombre]
**Estado**: 🟡 En revisión



