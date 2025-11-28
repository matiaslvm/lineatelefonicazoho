import React, { useState, useEffect } from 'react';
import './App.css';
import LineaInfo from './components/LineaInfo';
import SolicitudForm from './components/SolicitudForm';
import {
  getPicklistValues,
  getProjectAvailability,
  insertRecord,
  showNotification
} from './services/zohoAPI';

const MODULE_NAME = 'L_neas_telef_nicas';
const PROJECT_FIELD = 'Proyecto_Origen';

/**
 * Componente principal del widget para gestión de líneas telefónicas
 * Flujo:
 * 1. Seleccionar proyecto origen (picklist del módulo)
 * 2. Consultar disponibilidad (Estado = Disponible)
 * 3. Crear solicitud (nuevo registro en el mismo módulo)
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

  useEffect(() => {
    fetchProjectOptions();
  }, []);

  /**
   * Carga los valores del picklist Proyecto_Origen
   */
  const fetchProjectOptions = async () => {
    try {
      setLoadingProjects(true);
      const values = await getPicklistValues(MODULE_NAME, PROJECT_FIELD);
      setProjectOptions(values);
      if (values.length > 0) {
        setSelectedProject(values[0].value);
      }
    } catch (err) {
      console.error('Error al cargar proyectos:', err);
      setError('No se pudieron cargar los proyectos. Reintentá nuevamente.');
    } finally {
      setLoadingProjects(false);
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
   * Maneja la creación de una nueva solicitud dentro del mismo módulo
   */
  const handleCreateSolicitud = async (formData) => {
    if (!selectedProject) {
      showNotification('Seleccioná un proyecto antes de crear la solicitud.', 'error');
      return;
    }

    try {
      setSubmitting(true);

      const descripcionCompuesta = `[${(formData.tipo || 'solicitud').toUpperCase()}]` +
        ` [${(formData.prioridad || 'media').toUpperCase()}] ${formData.descripcion}`;

      const solicitudData = {
        Proyecto_Origen: selectedProject,
        Linea: `Solicitud-${Date.now()}`,
        Descripcion: descripcionCompuesta
      };

      await insertRecord(MODULE_NAME, solicitudData);

      showNotification('Solicitud creada exitosamente', 'success');
      setShowForm(false);
      setProjectStats(null);
      loadProjectStats(selectedProject);
    } catch (err) {
      console.error('Error al crear solicitud:', err);
      showNotification('Error al crear la solicitud. Revisá los campos e intentá nuevamente.', 'error');
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
