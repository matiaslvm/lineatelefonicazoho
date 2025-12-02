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
      const [tipoSolicitud, prioridad, area, plan] = await Promise.all([
        getPicklistValues(MODULE_NAME, 'Tipo_de_solicitud'),
        getPicklistValues(MODULE_NAME, 'Prioridad'),
        getPicklistValues(MODULE_NAME, 'Area'),
        getPicklistValues(MODULE_NAME, 'Plan')
      ]);
      
      console.log('Picklists cargados:', {
        tipoSolicitud: tipoSolicitud.length,
        prioridad: prioridad.length,
        area: area.length,
        plan: plan.length
      });
      
      setTipoSolicitudOptions(tipoSolicitud);
      setPrioridadOptions(prioridad);
      setAreaOptions(area);
      setPlanOptions(plan);
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
   * Maneja la creación de una solicitud o asignación de línea
   */
  const handleCreateSolicitud = async (formData) => {
    if (!selectedProject) {
      showNotification('Seleccioná un proyecto antes de crear la solicitud.', 'error');
      return;
    }

    try {
      setSubmitting(true);

      // Debug: Verificar valores recibidos
      console.log('handleCreateSolicitud - formData:', formData);
      console.log('handleCreateSolicitud - availabilityStatus:', availabilityStatus);
      console.log('handleCreateSolicitud - projectStats:', projectStats);

      // Determinar si debemos actualizar o crear
      const hayLineasDisponibles = availabilityStatus === 'available' && 
                                    projectStats && 
                                    projectStats.disponibles > 0;
      const lineaSeleccionada = formData.Linea && formData.Linea.trim() !== '';

      console.log('hayLineasDisponibles:', hayLineasDisponibles);
      console.log('lineaSeleccionada:', lineaSeleccionada);

      // Si hay líneas disponibles Y se seleccionó una línea, ACTUALIZAMOS el registro existente
      if (hayLineasDisponibles && lineaSeleccionada) {
        console.log('Modo: ACTUALIZAR registro existente');
        
        // Buscar el registro de la línea seleccionada
        const lineaEncontrada = projectStats.lineasDisponibles.find(
          linea => linea.id === formData.Linea || linea.id.toString() === formData.Linea.toString()
        );

        console.log('Línea encontrada para actualizar:', lineaEncontrada);

        if (!lineaEncontrada) {
          throw new Error('No se encontró la línea seleccionada en las líneas disponibles');
        }

        // Actualizar el registro existente con los datos de la solicitud
        const updateData = {
          Tipo_de_solicitud: formData.Tipo_de_solicitud,
          Prioridad: formData.Prioridad || '',
          Comentarios: formData.Comentarios,
          Area: formData.Area || '',
          Plan: formData.Plan || '',
          Name: formData.Name // Propietario de línea (obligatorio)
          // El estado lo cambia la automatización, no lo tocamos
        };

        console.log('Actualizando registro ID:', lineaEncontrada.id, 'con datos:', updateData);
        await updateRecord(MODULE_NAME, lineaEncontrada.id, updateData);
        setLastRecordId(lineaEncontrada.id);
        showNotification('Línea asignada exitosamente', 'success');
      } else {
        // Crear nuevo registro para solicitud de nueva línea
        console.log('Modo: CREAR nuevo registro');
        
        const solicitudData = {
          Proyecto_Origen: selectedProject,
          Tipo_de_solicitud: formData.Tipo_de_solicitud,
          Prioridad: formData.Prioridad || '',
          Comentarios: formData.Comentarios,
          Area: formData.Area || '',
          Plan: formData.Plan || '',
          Name: formData.Name, // Propietario de línea (obligatorio)
          Linea: formData.Linea || '' // Puede estar vacío si es nueva línea
        };

        console.log('Creando nuevo registro con datos:', solicitudData);
        const created = await insertRecord(MODULE_NAME, solicitudData);
        const createdId = created?.details?.id || created?.id;
        if (createdId) {
          setLastRecordId(createdId);
        }
        showNotification('Solicitud creada exitosamente', 'success');
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
                  lineasDisponibles={projectStats?.lineasDisponibles || []}
                  tipoSolicitudOptions={tipoSolicitudOptions}
                  prioridadOptions={prioridadOptions}
                  areaOptions={areaOptions}
                  planOptions={planOptions}
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
