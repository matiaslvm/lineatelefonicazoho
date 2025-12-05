/**
 * Servicio para interactuar con las APIs de Zoho CRM
 * Basado en la documentación oficial: https://help.zwidgets.com/help/latest/index.html
 */

/**
 * Obtiene un registro específico del módulo
 * @param {string} module - Nombre del módulo (API name)
 * @param {string} recordId - ID del registro
 * @returns {Promise} - Promesa con los datos del registro
 */
export function getRecord(module, recordId) {
  return new Promise((resolve, reject) => {
    if (!window.ZOHO || !window.ZOHO.CRM || !window.ZOHO.CRM.API) {
      reject(new Error('Zoho SDK no está disponible'));
      return;
    }

    window.ZOHO.CRM.API.getRecord({
      Entity: module,
      RecordID: recordId
    })
      .then((response) => {
        if (response.data && response.data.length > 0) {
          resolve(response.data[0]);
        } else {
          reject(new Error('No se encontró el registro'));
        }
      })
      .catch((error) => {
        console.error('Error al obtener registro:', error);
        reject(error);
      });
  });
}

/**
 * Obtiene los valores únicos de un campo (ej. picklist) usando getAllRecords
 * Primero intenta desde registros existentes, si no encuentra, intenta obtener desde la estructura del módulo
 * @param {string} module - Nombre del módulo (API name)
 * @param {string} fieldApiName - Nombre del campo (API name)
 * @returns {Promise<Array<{value:string,label:string}>>}
 */
export async function getPicklistValues(module, fieldApiName) {
  // 1) Intentar SIEMPRE primero desde la estructura del módulo (getFields / META.getFields)
  if (window.ZOHO && window.ZOHO.CRM) {
    // API.getFields
    if (window.ZOHO.CRM.API && window.ZOHO.CRM.API.getFields) {
      try {
        const fieldsResponse = await window.ZOHO.CRM.API.getFields({ Entity: module });
        if (fieldsResponse && fieldsResponse.fields) {
          const field = fieldsResponse.fields.find(
            (f) =>
              f.api_name === fieldApiName ||
              f.api_name === fieldApiName.toLowerCase() ||
              f.api_name === fieldApiName.toUpperCase() ||
              f.api_name === fieldApiName.replace(/_/g, '') ||
              f.api_name === fieldApiName.replace(/_/g, '_')
          );
          
          // Log para debug si no se encuentra el campo
          if (!field && (fieldApiName === 'Tipo_de_Chip' || fieldApiName === 'Tipo_de_chip')) {
            console.log('Buscando campo Tipo_de_Chip. Campos disponibles:', 
              fieldsResponse.fields
                .filter(f => f.api_name && f.api_name.toLowerCase().includes('chip'))
                .map(f => f.api_name)
            );
          }
          if (field && field.pick_list_values && field.pick_list_values.length > 0) {
            const values = field.pick_list_values.filter(
              (item) =>
                item.actual_value !== '-None-' &&
                item.display_value !== '-None-'
            );
            return values.map((item) => ({
              value: item.actual_value || item.display_value,
              label: item.display_value || item.actual_value
            }));
          }
        }
      } catch (err) {
        console.log('API.getFields no disponible o falló:', err);
      }
    }

    // META.getFields
    if (window.ZOHO.CRM.META && window.ZOHO.CRM.META.getFields) {
      try {
        const metaResponse = await window.ZOHO.CRM.META.getFields({ Entity: module });
        if (metaResponse && metaResponse.fields) {
          const field = metaResponse.fields.find(
            (f) =>
              f.api_name === fieldApiName ||
              f.api_name === fieldApiName.toLowerCase() ||
              f.api_name === fieldApiName.toUpperCase()
          );
          if (field && field.pick_list_values && field.pick_list_values.length > 0) {
            const values = field.pick_list_values.filter(
              (item) =>
                item.actual_value !== '-None-' &&
                item.display_value !== '-None-'
            );
            return values.map((item) => ({
              value: item.actual_value || item.display_value,
              label: item.display_value || item.actual_value
            }));
          }
        }
      } catch (err) {
        console.log('META.getFields no disponible o falló:', err);
      }
    }
  }

  // 2) Fallback: deducir valores desde registros existentes
  const records = await getAllRecords(module, { per_page: 200 });
  const unique = new Map();

  records.forEach((rec) => {
    const val = rec[fieldApiName];
    if (val && val !== '' && val !== null && val !== undefined) {
      const stringVal = String(val).trim();
      if (stringVal && !unique.has(stringVal)) {
        unique.set(stringVal, { value: stringVal, label: stringVal });
      }
    }
  });

  return Array.from(unique.values());
}

/**
 * Obtiene todos los registros de un módulo con filtros opcionales
 * @param {string} module - Nombre del módulo (API name)
 * @param {object} params - Parámetros opcionales (page, per_page, criteria, etc.)
 * @returns {Promise} - Promesa con los datos de los registros
 */
export function getAllRecords(module, params = {}) {
  return new Promise((resolve, reject) => {
    if (!window.ZOHO || !window.ZOHO.CRM || !window.ZOHO.CRM.API) {
      reject(new Error('Zoho SDK no está disponible'));
      return;
    }

    const options = {
      Entity: module,
      ...params
    };

    window.ZOHO.CRM.API.getAllRecords(options)
      .then((response) => {
        resolve(response.data || []);
      })
      .catch((error) => {
        console.error('Error al obtener registros:', error);
        reject(error);
      });
  });
}

// Nota: dejamos getRecordsByCriteria por si se necesita a futuro, pero
// para disponibilidad usamos filtrado en frontend para evitar errores de sintaxis.
export function getRecordsByCriteria(module, criteria, params = {}) {
  return getAllRecords(module, params);
}
/**
 * Calcula indicadores de disponibilidad de líneas para un proyecto dado
 * @param {string} module - Nombre del módulo
 * @param {string} projectValue - Valor seleccionado del picklist Proyecto_Origen
 * @returns {Promise<{total:number, disponibles:number, registros:Array}>}
 */
export async function getProjectAvailability(module, projectValue) {
  // Traemos registros y filtramos en frontend para no depender de sintaxis de criteria
  const records = await getAllRecords(module, { per_page: 200 });

  const filtered = records.filter(
    (record) => record.Proyecto_Origen === projectValue
  );

  const total = filtered.length;

  // Líneas disponibles (Estado = Disponible)
  const lineasDisponibles = filtered.filter((record) => {
    const estado = (record.Estado || record.estado || '').toLowerCase();
    return estado === 'disponible';
  });

  // Líneas suspendidas / con incidencia (buscamos palabras clave en el estado)
  const lineasIncidencia = filtered.filter((record) => {
    const estado = (record.Estado || record.estado || '').toLowerCase();
    return estado.includes('suspend') || estado.includes('inciden');
  });

  return {
    total,
    disponibles: lineasDisponibles.length,
    suspendidas: lineasIncidencia.length,
    registros: filtered,
    lineasDisponibles: lineasDisponibles.map((record) => ({
      id: record.id,
      Linea: record.Linea || record.linea || '',
      Estado: record.Estado || record.estado || ''
    }))
  };
}

/**
 * Crea un nuevo registro en el módulo especificado
 * @param {string} module - Nombre del módulo (API name)
 * @param {object} recordData - Datos del registro a crear
 * @returns {Promise} - Promesa con el resultado de la creación
 */
export function insertRecord(module, recordData) {
  return new Promise((resolve, reject) => {
    if (!window.ZOHO || !window.ZOHO.CRM || !window.ZOHO.CRM.API) {
      reject(new Error('Zoho SDK no está disponible'));
      return;
    }

    // La JS SDK de widgets espera el body plano (no envuelto en data[])
    window.ZOHO.CRM.API.insertRecord({
      Entity: module,
      APIData: recordData
    })
      .then((response) => {
        console.log('Respuesta insertRecord:', response);
        if (response.data && response.data.length > 0) {
          resolve(response.data[0]);
        } else {
          reject(new Error('No se pudo crear el registro'));
        }
      })
      .catch((error) => {
        console.error('Error al crear registro:', error);
        reject(error);
      });
  });
}

/**
 * Actualiza un registro existente
 * @param {string} module - Nombre del módulo (API name)
 * @param {string} recordId - ID del registro a actualizar
 * @param {object} recordData - Datos a actualizar
 * @returns {Promise} - Promesa con el resultado de la actualización
 */
export function updateRecord(module, recordId, recordData) {
  return new Promise((resolve, reject) => {
    if (!window.ZOHO || !window.ZOHO.CRM || !window.ZOHO.CRM.API) {
      reject(new Error('Zoho SDK no está disponible'));
      return;
    }

    // La JS SDK de widgets usa el id dentro del body y no requiere RecordID
    const apiData = {
      id: recordId,
      ...recordData
    };

    window.ZOHO.CRM.API.updateRecord({
      Entity: module,
      APIData: apiData
    })
      .then((response) => {
        console.log('Respuesta updateRecord:', response);
        if (response.data && response.data.length > 0) {
          resolve(response.data[0]);
        } else {
          console.error('Respuesta inesperada al actualizar registro:', response);
          reject(new Error('No se pudo actualizar el registro'));
        }
      })
      .catch((error) => {
        console.error('Error al actualizar registro:', error);
        reject(error);
      });
  });
}

/**
 * Muestra una notificación nativa de Zoho CRM
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de notificación (success, error, info)
 */
export function showNotification(message, type = 'info') {
  if (window.ZOHO && window.ZOHO.CRM && window.ZOHO.CRM.UI && window.ZOHO.CRM.UI.Popup) {
    // Según la doc de la SDK usamos Popup.show con tipo
    if (typeof window.ZOHO.CRM.UI.Popup.show === 'function') {
      window.ZOHO.CRM.UI.Popup.show({
        type: type === 'error' ? 'error' : 'success',
        message
      });
    } else {
      // Fallback simple dentro del widget
      alert(message);
    }
  } else {
    // Fallback si el SDK no está disponible
    alert(message);
  }
}

