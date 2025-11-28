import React, { useState, useEffect } from 'react';
import './SolicitudForm.css';

/**
 * Componente para crear una solicitud usando campos reales del CRM
 * Campos: Tipo_de_solicitud, Prioridad, Comentarios, Area, Linea
 */
function SolicitudForm({
  selectedProject,
  projectStats,
  availabilityStatus,
  lineasDisponibles = [],
  tipoSolicitudOptions = [],
  prioridadOptions = [],
  areaOptions = [],
  onSubmit,
  onCancel,
  loading
}) {
  const [formData, setFormData] = useState({
    Tipo_de_solicitud: '',
    Prioridad: '',
    Comentarios: '',
    Area: '',
    Linea: ''
  });

  useEffect(() => {
    // Pre-seleccionar tipo según disponibilidad
    if (availabilityStatus === 'available' && tipoSolicitudOptions.length > 0) {
      // Buscar opción que contenga "asignación" o similar
      const asignacionOption = tipoSolicitudOptions.find(opt => 
        opt.label.toLowerCase().includes('asign') || opt.value.toLowerCase().includes('asign')
      );
      if (asignacionOption) {
        setFormData(prev => ({ ...prev, Tipo_de_solicitud: asignacionOption.value }));
      }
    } else if (availabilityStatus === 'unavailable' && tipoSolicitudOptions.length > 0) {
      // Buscar opción que contenga "nueva" o similar
      const nuevaOption = tipoSolicitudOptions.find(opt => 
        opt.label.toLowerCase().includes('nueva') || opt.value.toLowerCase().includes('nueva')
      );
      if (nuevaOption) {
        setFormData(prev => ({ ...prev, Tipo_de_solicitud: nuevaOption.value }));
      }
    }
  }, [availabilityStatus, tipoSolicitudOptions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({
        ...formData,
        proyectoOrigen: selectedProject
      });
    }
  };

  const availabilityMessage =
    availabilityStatus === 'available'
      ? `Hay ${projectStats?.disponibles || 0} líneas disponibles para este proyecto.`
      : 'No hay líneas disponibles actualmente, se solicitará una nueva línea.';

  const isFormValid = formData.Tipo_de_solicitud && formData.Comentarios;
  
  // Si hay líneas disponibles, también requiere seleccionar una línea
  const isLineaRequired = availabilityStatus === 'available' && lineasDisponibles.length > 0;
  const isFormComplete = isFormValid && (!isLineaRequired || formData.Linea);

  return (
    <div className="solicitud-form-container">
      <div className="form-header">
        <h2>Nueva Solicitud</h2>
        <p className="form-subtitle">
          Proyecto seleccionado: <strong>{selectedProject || '-'}</strong>
        </p>
        <div className={`availability-chip ${availabilityStatus}`}>
          {availabilityMessage}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="solicitud-form">
        <div className="form-group">
          <label htmlFor="Tipo_de_solicitud" className="form-label">
            Tipo de solicitud <span className="required">*</span>
          </label>
          <select
            id="Tipo_de_solicitud"
            name="Tipo_de_solicitud"
            value={formData.Tipo_de_solicitud}
            onChange={handleChange}
            className="form-select"
            required
          >
            <option value="">Seleccioná una opción</option>
            {tipoSolicitudOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {availabilityStatus === 'available' && lineasDisponibles.length > 0 && (
          <div className="form-group">
            <label htmlFor="Linea" className="form-label">
              Número de línea disponible <span className="required">*</span>
            </label>
            <select
              id="Linea"
              name="Linea"
              value={formData.Linea}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Seleccioná una línea</option>
              {lineasDisponibles.map((linea) => (
                <option key={linea.id} value={linea.Linea}>
                  {linea.Linea || `Línea ID: ${linea.id}`}
                </option>
              ))}
            </select>
            <p className="helper-text">
              {lineasDisponibles.length} línea(s) disponible(s) para asignar
            </p>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="Prioridad" className="form-label">
            Prioridad
          </label>
          <select
            id="Prioridad"
            name="Prioridad"
            value={formData.Prioridad}
            onChange={handleChange}
            className="form-select"
          >
            <option value="">Seleccioná una opción</option>
            {prioridadOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="Area" className="form-label">
            Área solicitante
          </label>
          <select
            id="Area"
            name="Area"
            value={formData.Area}
            onChange={handleChange}
            className="form-select"
          >
            <option value="">Seleccioná una opción</option>
            {areaOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="Comentarios" className="form-label">
            Comentarios adicionales <span className="required">*</span>
          </label>
          <textarea
            id="Comentarios"
            name="Comentarios"
            value={formData.Comentarios}
            onChange={handleChange}
            className="form-textarea"
            rows="4"
            placeholder="Describe la necesidad de la solicitud, contexto y responsables..."
            required
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !isFormComplete}
          >
            {loading ? 'Creando...' : 'Crear Solicitud'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SolicitudForm;
