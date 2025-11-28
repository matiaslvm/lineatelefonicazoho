import React, { useState, useEffect } from 'react';
import './SolicitudForm.css';

/**
 * Componente para crear una solicitud a partir de la disponibilidad detectada
 */
function SolicitudForm({
  selectedProject,
  projectStats,
  availabilityStatus,
  onSubmit,
  onCancel,
  loading
}) {
  const [formData, setFormData] = useState({
    tipo: '',
    descripcion: '',
    prioridad: 'media'
  });

  useEffect(() => {
    if (availabilityStatus === 'available') {
      setFormData((prev) => ({ ...prev, tipo: 'asignacion' }));
    } else if (availabilityStatus === 'unavailable') {
      setFormData((prev) => ({ ...prev, tipo: 'nueva_linea' }));
    }
  }, [availabilityStatus]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({
        ...formData,
        proyectoOrigen: selectedProject,
        disponibilidad: availabilityStatus,
        resumen: {
          total: projectStats?.total || 0,
          disponibles: projectStats?.disponibles || 0
        }
      });
    }
  };

  const availabilityMessage =
    availabilityStatus === 'available'
      ? `Hay ${projectStats?.disponibles || 0} líneas disponibles para este proyecto.`
      : 'No hay líneas disponibles actualmente, se solicitará una nueva línea.';

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
          <label htmlFor="tipo" className="form-label">
            Tipo de solicitud <span className="required">*</span>
          </label>
          <select
            id="tipo"
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            className="form-select"
            required
          >
            <option value="">Seleccioná una opción</option>
            <option value="asignacion">Asignar línea disponible</option>
            <option value="nueva_linea">Solicitar nueva línea</option>
            <option value="incidencia">Reportar incidencia</option>
            <option value="mantenimiento">Mantenimiento</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="prioridad" className="form-label">
            Prioridad
          </label>
          <select
            id="prioridad"
            name="prioridad"
            value={formData.prioridad}
            onChange={handleChange}
            className="form-select"
          >
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="descripcion" className="form-label">
            Descripción <span className="required">*</span>
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
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
            disabled={loading || !formData.tipo || !formData.descripcion}
          >
            {loading ? 'Creando...' : 'Crear Solicitud'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SolicitudForm;

