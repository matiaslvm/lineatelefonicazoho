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
  planOptions = [],
  onSubmit,
  onCancel,
  loading
}) {
  const initialFormState = {
    Tipo_de_solicitud: '',
    Prioridad: '',
    Comentarios: '',
    Area: '',
    Plan: '',
    Name: '',
    Linea: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // Cada vez que cambia el proyecto o la disponibilidad, reseteamos el formulario
  useEffect(() => {
    setFormData({
      Tipo_de_solicitud: '',
      Prioridad: '',
      Comentarios: '',
      Area: '',
      Plan: '',
      Name: '',
      Linea: ''
    });
  }, [selectedProject, availabilityStatus]);

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

  const isLineaExistente = availabilityStatus === 'available' && lineasDisponibles.length > 0;
  const solicitudType = isLineaExistente ? 'existente' : 'nueva';

  const availabilityMessage =
    availabilityStatus === 'available'
      ? `Hay ${projectStats?.disponibles || 0} líneas disponibles para este proyecto.`
      : 'No hay líneas disponibles, se solicitará una nueva línea.';

  const isFormValid = formData.Tipo_de_solicitud && formData.Comentarios && formData.Name;
  
  // Si hay líneas disponibles, también requiere seleccionar una línea
  const isLineaRequired = availabilityStatus === 'available' && lineasDisponibles.length > 0;
  const isFormComplete = isFormValid && (!isLineaRequired || formData.Linea);

  return (
    <div className="solicitud-form-container">
      {/* Banner de tipo de solicitud */}
      <div className={`solicitud-type-banner ${solicitudType}`}>
        <div className="solicitud-type-main">
          <div className="solicitud-type-icon">
            {isLineaExistente ? '📞' : '➕'}
          </div>
          <div className="solicitud-type-content">
            <h3 className="solicitud-type-title">
              {isLineaExistente ? 'Asignar Línea Existente' : 'Solicitar Nueva Línea'}
            </h3>
            <p className="solicitud-type-description">
              {isLineaExistente 
                ? 'Asigná una línea disponible a un nuevo propietario.'
                : 'Creá una solicitud para obtener una nueva línea telefónica.'}
            </p>
          </div>
        </div>
      </div>

      <div className="form-header">
        <p className="form-subtitle">
          Proyecto seleccionado: <strong>{selectedProject || '-'}</strong>
        </p>
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
          <div className="form-group linea-existente-group">
            <select
              id="Linea"
              name="Linea"
              value={formData.Linea}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">
                Seleccioná una línea disponible ({lineasDisponibles.length} para asignar)
              </option>
              {lineasDisponibles.map((linea) => (
                <option key={linea.id} value={linea.id}>
                  {linea.Linea || `Línea ID: ${linea.id}`}
                </option>
              ))}
            </select>
            <p className="helper-text highlight-text">
              ✓ {lineasDisponibles.length} línea(s) disponible(s) para asignar
            </p>
          </div>
        )}

        <div className="form-row">
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
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="Name" className="form-label">
              Propietario de línea <span className="required">*</span>
            </label>
            <input
              id="Name"
              name="Name"
              type="text"
              value={formData.Name}
              onChange={handleChange}
              className="form-select"
              placeholder="Ingresá el nombre del propietario de la línea"
              required
            />
          </div>

          {availabilityStatus !== 'available' && (
            <div className="form-group">
              <label htmlFor="Plan" className="form-label">
                <span className="label-icon">📋</span>
                Plan para nueva línea
              </label>
              <select
                id="Plan"
                name="Plan"
                value={formData.Plan}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Seleccioná un plan</option>
                {planOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
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
            className={`btn btn-primary ${solicitudType}`}
            disabled={loading || !isFormComplete}
          >
            {loading 
              ? (isLineaExistente ? 'Asignando...' : 'Creando...') 
              : (isLineaExistente ? 'Asignar Línea' : 'Crear Solicitud de Nueva Línea')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SolicitudForm;
