import React, { useState, useEffect } from 'react';
import './App.css';
import LineaInfo from './components/LineaInfo';
import SolicitudForm from './components/SolicitudForm';
import {
  getPicklistValues,
  getProjectAvailability,
  insertRecord,
  updateRecord,
  showNotification
} from './services/zohoAPI';

const MODULE_NAME = 'L_neas_telef_nicas';
const PROJECT_FIELD = 'Proyecto_Origen';

/**
 * Componente principal del widget para gestión de líneas telefónicas
 * Flujo:
 * 1. Seleccionar proyecto origen (picklist del módulo)
 * 2. Consultar disponibilidad (Estado = Disponible)
 * 3. Crear solicitud o asignar línea existente (según disponibilidad)
 */
function App() {
  const [projectOptions, setProjectOptions] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedTipoSolicitud, setSelectedTipoSolicitud] = useState('');
  const [projectStats, setProjectStats] = useState(null);
  const [availabilityStatus, setAvailabilityStatus] = useState(null);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastRecordId, setLastRecordId] = useState(null);
  
  // Opciones de picklists para el formulario
  const [tipoSolicitudOptions, setTipoSolicitudOptions] = useState([]);
  const [prioridadOptions, setPrioridadOptions] = useState([]);
  const [areaOptions, setAreaOptions] = useState([]);
  const [planOptions, setPlanOptions] = useState([]);
  const [proveedorOptions, setProveedorOptions] = useState([]);

  /**
   * Ajusta el tamaño del widget usando la SDK oficial de Zoho
   * justo después de que el componente principal se monta.
   */
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.ZOHO &&
      window.ZOHO.CRM &&
      window.ZOHO.CRM.UI &&
      window.ZOHO.CRM.UI.Resize
    ) {
      window.ZOHO.CRM.UI.Resize({
        width: '100%',
        height: '95%'
      }).then(() => {
        // Podríamos loguear algo si es necesario, pero lo dejamos silencioso.
      }).catch(() => {
        // Si falla, no rompemos la UI.
      });
    }
  }, []);

  useEffect(() => {
    fetchProjectOptions();
    fetchPicklistOptions();
  }, []);

  /**
   * Carga los valores del picklist Proyecto_Origen
   */
  const fetchProjectOptions = async () => {
    try {
      setLoadingProjects(true);
      const values = await getPicklistValues(MODULE_NAME, PROJECT_FIELD);
      setProjectOptions(values);
    } catch (err) {
      console.error('Error al cargar proyectos:', err);
      setError('No se pudieron cargar los proyectos. Reintentá nuevamente.');
    } finally {
      setLoadingProjects(false);
    }
  };

  /**
   * Carga los valores de los picklists necesarios para el formulario
   */
  const fetchPicklistOptions = async () => {
    try {
      console.log('Iniciando carga de picklists...');
      const [tipoSolicitud, prioridad, area, plan, proveedor] = await Promise.all([
        getPicklistValues(MODULE_NAME, 'Tipo_de_solicitud'),
        getPicklistValues(MODULE_NAME, 'Prioridad'),
        getPicklistValues(MODULE_NAME, 'Area'),
        getPicklistValues(MODULE_NAME, 'Plan'),
        getPicklistValues(MODULE_NAME, 'Empresa_Proveedor')
      ]);
      
      console.log('Picklists cargados:', {
        tipoSolicitud: tipoSolicitud.length,
        prioridad: prioridad.length,
        area: area.length,
        plan: plan.length,
        proveedor: proveedor.length
      });
      
      setTipoSolicitudOptions(tipoSolicitud);
      setPrioridadOptions(prioridad);
      setAreaOptions(area);
      setPlanOptions(plan);
      setProveedorOptions(proveedor);
    } catch (err) {
      console.error('Error al cargar opciones de picklists:', err);
      // No bloqueamos el flujo si falla, solo mostramos en consola
    }
  };

  useEffect(() => {
    if (selectedProject) {
      loadProjectStats(selectedProject);
    } else {
      setProjectStats(null);
      setAvailabilityStatus(null);
      setShowForm(false);
      setSelectedTipoSolicitud('');
    }
  }, [selectedProject]);

  /**
   * Obtiene disponibilidad de líneas para el proyecto seleccionado
   */
  const loadProjectStats = async (projectValue) => {
    try {
      setLoadingStats(true);
      setError(null);
      const stats = await getProjectAvailability(MODULE_NAME, projectValue);
      setProjectStats(stats);
      setAvailabilityStatus(stats.disponibles > 0 ? 'available' : 'unavailable');
      setShowForm(true);
    } catch (err) {
      console.error('Error al obtener disponibilidad:', err);
      setError('No se pudo obtener la disponibilidad del proyecto seleccionado.');
      setProjectStats(null);
      setShowForm(false);
    } finally {
      setLoadingStats(false);
    }
  };

  /**
   * Calcula qué líneas se pueden seleccionar según el tipo de solicitud
   */
  const getLineasParaSeleccion = () => {
    if (!projectStats || !projectStats.registros) return [];

    const normalizeTipo = (tipo) =>
      (tipo || '')
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();

    const tipo = normalizeTipo(selectedTipoSolicitud);
    if (!tipo) return [];

    const registros = projectStats.registros;

    const normalizarEstado = (record) =>
      (record.Estado || record.estado || '').toLowerCase();

    // Asignar línea disponible
    if (tipo.includes('asignar') && tipo.includes('disponible')) {
      return projectStats.lineasDisponibles || [];
    }

    // Reasignar línea
    if (tipo.includes('reasignar')) {
      return registros.filter((r) => {
        const estado = normalizarEstado(r);
        return estado !== 'disponible' && estado !== 'baja';
      });
    }

    // Reportar incidencia
    if (tipo.includes('incidencia') || tipo.includes('inciden')) {
      return registros.filter((r) => {
        const estado = normalizarEstado(r);
        return estado !== 'baja';
      });
    }

    // Mantenimiento
    if (tipo.includes('mantenimiento')) {
      return registros.filter((r) => {
        const estado = normalizarEstado(r);
        return estado !== 'baja';
      });
    }

    // Solicitar baja
    if (tipo.includes('baja')) {
      return registros.filter((r) => {
        const estado = normalizarEstado(r);
        return estado !== 'baja';
      });
    }

    // Solicitar nueva línea (o cualquier otro valor que implique nueva línea)
    if (tipo.includes('nueva') || tipo.includes('nueva linea') || tipo.includes('nueva línea')) {
      return [];
    }

    // Valor no reconocido: por seguridad no mostramos líneas
    return [];
  };

  /**
   * Maneja la creación de una solicitud o asignación de línea
   */
  const handleCreateSolicitud = async (formData) => {
    if (!selectedProject) {
      showNotification('Seleccioná un proyecto antes de crear la solicitud.', 'error');
      return;
    }

    if (!selectedTipoSolicitud) {
      showNotification('Seleccioná el tipo de solicitud antes de continuar.', 'error');
      return;
    }

    try {
      setSubmitting(true);

      // Normalizador de estado
      const normalizarEstado = (estado) => (estado || '').toLowerCase();

       // Normalizador de tipo de solicitud (para tolerar diferencias de acentos / espacios)
      const normalizeTipo = (tipo) =>
        (tipo || '')
          .toString()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim();

      const tipoNorm = normalizeTipo(selectedTipoSolicitud);

      // Registro de la línea seleccionada (si aplica)
      const lineaSeleccionada =
        formData.Linea && projectStats && projectStats.registros
          ? projectStats.registros.find(
              (r) => r.id === formData.Linea || String(r.id) === String(formData.Linea)
            )
          : null;

      console.log('Tipo de solicitud:', selectedTipoSolicitud);
      console.log('Línea seleccionada (si existe):', lineaSeleccionada);

      // Asignar línea disponible
      if (tipoNorm.includes('asignar') && tipoNorm.includes('disponible')) {
        if (!lineaSeleccionada) {
          throw new Error('Debés seleccionar una línea disponible para asignar.');
        }

        const estado = normalizarEstado(lineaSeleccionada.Estado || lineaSeleccionada.estado);
        if (estado !== 'disponible') {
          throw new Error('La línea seleccionada no está disponible para asignar.');
        }

        const updateData = {
          Tipo_de_solicitud: selectedTipoSolicitud,
          Prioridad: formData.Prioridad || '',
          Comentarios: formData.Comentarios,
          Area: formData.Area || '',
          Plan: formData.Plan || '',
          Name: formData.Name,
          Empresa_Proveedor: formData.Empresa_Proveedor || ''
        };

        await updateRecord(MODULE_NAME, lineaSeleccionada.id, updateData);
        setLastRecordId(lineaSeleccionada.id);
        showNotification('Línea asignada exitosamente', 'success');
      }
      // Solicitar nueva línea
      else if (tipoNorm.includes('nueva') && tipoNorm.includes('linea')) {
        const solicitudData = {
          Proyecto_Origen: selectedProject,
          Tipo_de_solicitud: selectedTipoSolicitud,
          Prioridad: formData.Prioridad || '',
          Comentarios: formData.Comentarios,
          Area: formData.Area || '',
          Plan: formData.Plan || '',
          Name: formData.Name,
          Empresa_Proveedor: formData.Empresa_Proveedor || '',
          Linea: formData.Linea || ''
        };

        const created = await insertRecord(MODULE_NAME, solicitudData);
        const createdId = created?.details?.id || created?.id;
        if (createdId) {
          setLastRecordId(createdId);
        }
        showNotification('Solicitud creada exitosamente', 'success');
      }
      // Reasignar línea
      else if (tipoNorm.includes('reasignar')) {
        if (!lineaSeleccionada) {
          throw new Error('Debés seleccionar una línea para reasignar.');
        }

        const updateData = {
          Tipo_de_solicitud: selectedTipoSolicitud,
          Prioridad: formData.Prioridad || '',
          Comentarios: formData.Comentarios,
          Area: formData.Area || '',
          Name: formData.Name,
          Motivo_de_reasignaci_n: formData.Motivo_de_reasignaci_n || ''
        };

        await updateRecord(MODULE_NAME, lineaSeleccionada.id, updateData);
        setLastRecordId(lineaSeleccionada.id);
        showNotification('Línea reasignada exitosamente', 'success');
      }
      // Reportar incidencia
      else if (tipoNorm.includes('incidencia') || tipoNorm.includes('inciden')) {
        if (!lineaSeleccionada) {
          throw new Error('Debés seleccionar una línea para reportar la incidencia.');
        }

        const updateData = {
          Tipo_de_solicitud: selectedTipoSolicitud,
          Prioridad: formData.Prioridad || '',
          Comentarios: formData.Comentarios,
          Area: formData.Area || '',
          Name: formData.Name
        };

        await updateRecord(MODULE_NAME, lineaSeleccionada.id, updateData);
        setLastRecordId(lineaSeleccionada.id);
        showNotification('Incidencia registrada exitosamente', 'success');
      }
      // Mantenimiento
      else if (tipoNorm.includes('mantenimiento')) {
        if (!lineaSeleccionada) {
          throw new Error('Debés seleccionar una línea para registrar mantenimiento.');
        }

        const updateData = {
          Tipo_de_solicitud: selectedTipoSolicitud,
          Prioridad: formData.Prioridad || '',
          Comentarios: formData.Comentarios,
          Area: formData.Area || '',
          Name: formData.Name
        };

        await updateRecord(MODULE_NAME, lineaSeleccionada.id, updateData);
        setLastRecordId(lineaSeleccionada.id);
        showNotification('Mantenimiento registrado exitosamente', 'success');
      }
      // Solicitar baja
      else if (tipoNorm.includes('baja')) {
        if (!lineaSeleccionada) {
          throw new Error('Debés seleccionar una línea para solicitar la baja.');
        }

        const estado = normalizarEstado(lineaSeleccionada.Estado || lineaSeleccionada.estado);
        if (estado === 'baja') {
          throw new Error('La línea seleccionada ya se encuentra dada de baja.');
        }

        const updateData = {
          Tipo_de_solicitud: selectedTipoSolicitud,
          Prioridad: formData.Prioridad || '',
          Comentarios: formData.Comentarios,
          Area: formData.Area || '',
          Name: formData.Name
        };

        await updateRecord(MODULE_NAME, lineaSeleccionada.id, updateData);
        setLastRecordId(lineaSeleccionada.id);
        showNotification('Solicitud de baja registrada exitosamente', 'success');
      } else {
        throw new Error('Tipo de solicitud no manejado.');
      }

      // Recargar estadísticas después de crear/actualizar
      setShowForm(false);
      setProjectStats(null);
      await loadProjectStats(selectedProject);
    } catch (err) {
      console.error('Error al crear/actualizar solicitud:', err);
      showNotification('Error al procesar la solicitud. Revisá los campos e intentá nuevamente.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Maneja la cancelación del formulario
   */
  const handleCancelForm = () => {
    setShowForm(false);
  };

  const handleProjectChange = (value) => {
    setSelectedProject(value);
  };

  const handleTipoSolicitudChange = (value) => {
    setSelectedTipoSolicitud(value);
  };

  const handleOpenLastRecord = () => {
    if (!lastRecordId) return;

    if (window.ZOHO && window.ZOHO.CRM && window.ZOHO.CRM.UI && window.ZOHO.CRM.UI.Record && window.ZOHO.CRM.UI.Record.open) {
      window.ZOHO.CRM.UI.Record.open({
        Entity: MODULE_NAME,
        RecordID: lastRecordId
      });
    } else {
      // Fallback básico: abrir en nueva pestaña usando la URL actual como base
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/crm/org/${MODULE_NAME}/${lastRecordId}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="App">
      <div className="widget-container">
        <div className="widget-header">
          <h1>Gestión de Líneas Telefónicas</h1>
          <p className="widget-subtitle">Primer filtro para disponibilidad y solicitudes</p>
        </div>

        <div className="widget-main-layout">
          {/* Columna izquierda: Información y estadísticas */}
          <div className="widget-sidebar">
            <LineaInfo
              projectOptions={projectOptions}
              selectedProject={selectedProject}
              onProjectChange={handleProjectChange}
              tipoSolicitudOptions={tipoSolicitudOptions}
              selectedTipoSolicitud={selectedTipoSolicitud}
              onTipoSolicitudChange={handleTipoSolicitudChange}
              projectStats={projectStats}
              loadingProjects={loadingProjects}
              loadingStats={loadingStats}
              availabilityStatus={availabilityStatus}
              error={error}
            />
          </div>

          {/* Columna derecha: Formulario */}
          <div className="widget-content">
            {showForm ? (
              <>
                <SolicitudForm
                  selectedProject={selectedProject}
                  projectStats={projectStats}
                  availabilityStatus={availabilityStatus}
                  selectedTipoSolicitud={selectedTipoSolicitud}
                  lineasDisponibles={getLineasParaSeleccion()}
                  tipoSolicitudOptions={tipoSolicitudOptions}
                  prioridadOptions={prioridadOptions}
                  areaOptions={areaOptions}
                  planOptions={planOptions}
                  proveedorOptions={proveedorOptions}
                  onSubmit={handleCreateSolicitud}
                  onCancel={handleCancelForm}
                  loading={submitting}
                />
                {lastRecordId && (
                  <div className="actions-section">
                    <button
                      type="button"
                      onClick={handleOpenLastRecord}
                      className="btn-action-secondary"
                    >
                      Ver registro actualizado
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <p>Seleccioná un proyecto para comenzar a crear una solicitud.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
