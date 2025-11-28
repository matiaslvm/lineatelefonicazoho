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
  // Primero intentamos obtener valores desde registros existentes
  const records = await getAllRecords(module, { per_page: 200 });

  console.log(`Buscando valores para campo: ${fieldApiName}`);
  console.log(`Total de registros obtenidos: ${records.length}`);
  
  // Buscar el campo con diferentes variaciones de nombre (mayúsculas/minúsculas)
  const fieldVariations = [
    fieldApiName,
    fieldApiName.toLowerCase(),
    fieldApiName.toUpperCase(),
    fieldApiName.charAt(0).toUpperCase() + fieldApiName.slice(1).toLowerCase()
  ];

  const unique = new Map();
  let foundField = null;
  
  // Primero, encontrar qué variación del nombre de campo existe en los registros
  if (records.length > 0) {
    const firstRecord = records[0];
    foundField = fieldVariations.find(field => firstRecord.hasOwnProperty(field));
    
    if (foundField) {
      console.log(`Campo encontrado como: ${foundField}`);
    } else {
      console.log('Campo no encontrado. Campos disponibles en el primer registro:', Object.keys(firstRecord));
    }
  }

  records.forEach((rec) => {
    // Intentar con la variación encontrada o con todas las variaciones
    const val = foundField ? rec[foundField] : 
                fieldVariations.reduce((value, field) => value || rec[field], null);
    
    if (val && val !== '' && val !== null && val !== undefined) {
      const stringVal = String(val).trim();
      if (stringVal && !unique.has(stringVal)) {
        unique.set(stringVal, { value: stringVal, label: stringVal });
      }
    }
  });

  let result = Array.from(unique.values());
  console.log(`Valores únicos encontrados desde registros para ${fieldApiName}:`, result);
  
  // Si no encontramos valores desde registros, intentamos obtener desde la estructura del módulo
  if (result.length === 0) {
    console.log(`No se encontraron valores desde registros. Intentando obtener desde estructura del módulo...`);
    
    // Método 1: Intentar ZOHO.CRM.API.getFields
    if (window.ZOHO && window.ZOHO.CRM && window.ZOHO.CRM.API && window.ZOHO.CRM.API.getFields) {
      try {
        const fieldsResponse = await new Promise((resolve, reject) => {
          window.ZOHO.CRM.API.getFields({
            Entity: module
          })
            .then(resolve)
            .catch(reject);
        });
        
        if (fieldsResponse && fieldsResponse.fields) {
          const field = fieldsResponse.fields.find(f => 
            f.api_name === fieldApiName || 
            f.api_name === fieldApiName.toLowerCase() ||
            f.api_name === fieldApiName.toUpperCase()
          );
          
          if (field && field.pick_list_values && field.pick_list_values.length > 0) {
            result = field.pick_list_values.map(item => ({
              value: item.actual_value || item.display_value,
              label: item.display_value || item.actual_value
            }));
            console.log(`Valores obtenidos desde API.getFields para ${fieldApiName}:`, result);
            return result;
          }
        }
      } catch (err) {
        console.log('API.getFields no disponible o falló:', err);
      }
    }
    
    // Método 2: Intentar ZOHO.CRM.META.getFields (si API.getFields no funcionó)
    if (result.length === 0 && window.ZOHO && window.ZOHO.CRM && window.ZOHO.CRM.META && window.ZOHO.CRM.META.getFields) {
      try {
        const metaResponse = await new Promise((resolve, reject) => {
          window.ZOHO.CRM.META.getFields({
            Entity: module
          })
            .then(resolve)
            .catch(reject);
        });
        
        if (metaResponse && metaResponse.fields) {
          const field = metaResponse.fields.find(f => 
            f.api_name === fieldApiName || 
            f.api_name === fieldApiName.toLowerCase() ||
            f.api_name === fieldApiName.toUpperCase()
          );
          
          if (field && field.pick_list_values && field.pick_list_values.length > 0) {
            result = field.pick_list_values.map(item => ({
              value: item.actual_value || item.display_value,
              label: item.display_value || item.actual_value
            }));
            console.log(`Valores obtenidos desde META.getFields para ${fieldApiName}:`, result);
            return result;
          }
        }
      } catch (err) {
        console.log('META.getFields no disponible o falló:', err);
      }
    }
  }
  
  return result;
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
  const lineasDisponibles = filtered.filter(
    (record) =>
      (record.Estado || '').toLowerCase() === 'disponible' ||
      (record.estado || '').toLowerCase() === 'disponible'
  );

  return {
    total,
    disponibles: lineasDisponibles.length,
    registros: filtered,
    lineasDisponibles: lineasDisponibles.map(record => ({
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

    const apiData = {
      data: [recordData]
    };

    window.ZOHO.CRM.API.insertRecord({
      Entity: module,
      APIData: apiData
    })
      .then((response) => {
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

    const apiData = {
      data: [recordData]
    };

    window.ZOHO.CRM.API.updateRecord({
      Entity: module,
      RecordID: recordId,
      APIData: apiData
    })
      .then((response) => {
        if (response.data && response.data.length > 0) {
          resolve(response.data[0]);
        } else {
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
  if (window.ZOHO && window.ZOHO.CRM && window.ZOHO.CRM.UI) {
    window.ZOHO.CRM.UI.Popup.showSuccessToast({
      message: message
    });
  } else {
    // Fallback si el SDK no está disponible
    alert(message);
  }
}

