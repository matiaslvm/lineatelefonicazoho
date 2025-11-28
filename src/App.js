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
  
  // Opciones de picklists para el formulario
  const [tipoSolicitudOptions, setTipoSolicitudOptions] = useState([]);
  const [prioridadOptions, setPrioridadOptions] = useState([]);
  const [areaOptions, setAreaOptions] = useState([]);

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
      const [tipoSolicitud, prioridad, area] = await Promise.all([
        getPicklistValues(MODULE_NAME, 'Tipo_de_solicitud'),
        getPicklistValues(MODULE_NAME, 'Prioridad'),
        getPicklistValues(MODULE_NAME, 'Area')
      ]);
      
      console.log('Picklists cargados:', {
        tipoSolicitud: tipoSolicitud.length,
        prioridad: prioridad.length,
        area: area.length
      });
      console.log('Valores de Tipo_de_solicitud:', tipoSolicitud);
      console.log('Valores de Prioridad:', prioridad);
      console.log('Valores de Area:', area);
      
      setTipoSolicitudOptions(tipoSolicitud);
      setPrioridadOptions(prioridad);
      setAreaOptions(area);
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

      // Si hay líneas disponibles y se seleccionó una línea, actualizamos ese registro
      if (availabilityStatus === 'available' && formData.Linea) {
        // Buscar el registro de la línea seleccionada
        const lineaSeleccionada = projectStats.lineasDisponibles.find(
          linea => linea.Linea === formData.Linea
        );

        if (lineaSeleccionada) {
          // Actualizar el registro existente con los datos de la solicitud
          const updateData = {
            Tipo_de_solicitud: formData.Tipo_de_solicitud,
            Prioridad: formData.Prioridad || '',
            Comentarios: formData.Comentarios,
            Area: formData.Area || ''
            // El estado lo cambia la automatización, no lo tocamos
          };

          await updateRecord(MODULE_NAME, lineaSeleccionada.id, updateData);
          showNotification('Línea asignada exitosamente', 'success');
        } else {
          throw new Error('No se encontró la línea seleccionada');
        }
      } else {
        // Crear nuevo registro para solicitud de nueva línea
        const solicitudData = {
          Proyecto_Origen: selectedProject,
          Tipo_de_solicitud: formData.Tipo_de_solicitud,
          Prioridad: formData.Prioridad || '',
          Comentarios: formData.Comentarios,
          Area: formData.Area || '',
          Linea: formData.Linea || '' // Puede estar vacío si es nueva línea
        };

        await insertRecord(MODULE_NAME, solicitudData);
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

  return (
    <div className="App">
      <div className="widget-container">
        <div className="widget-header">
          <h1>Gestión de Líneas Telefónicas</h1>
          <p className="widget-subtitle">Primer filtro para disponibilidad y solicitudes</p>
        </div>

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

        {showForm && (
          <SolicitudForm
            selectedProject={selectedProject}
            projectStats={projectStats}
            availabilityStatus={availabilityStatus}
            lineasDisponibles={projectStats?.lineasDisponibles || []}
            tipoSolicitudOptions={tipoSolicitudOptions}
            prioridadOptions={prioridadOptions}
            areaOptions={areaOptions}
            onSubmit={handleCreateSolicitud}
            onCancel={handleCancelForm}
            loading={submitting}
          />
        )}
      </div>
    </div>
  );
}

export default App;
