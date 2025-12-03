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
  selectedTipoSolicitud,
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
    Prioridad: '',
    Comentarios: '',
    Area: '',
    Plan: '',
    Name: '',
    Linea: '',
    Empresa_Proveedor: '',
    Motivo_de_reasignaci_n: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // Cada vez que cambia el proyecto o la disponibilidad, reseteamos el formulario
  useEffect(() => {
    setFormData({
      Prioridad: '',
      Comentarios: '',
      Area: '',
      Plan: '',
      Name: '',
      Linea: '',
      Empresa_Proveedor: '',
      Motivo_de_reasignaci_n: ''
    });
  }, [selectedProject, availabilityStatus, selectedTipoSolicitud]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Si cambiamos la línea seleccionada y estamos en "Asignar línea disponible",
    // intentamos autocompletar el Plan desde los registros del proyecto.
    if (name === 'Linea' && selectedTipoSolicitud === 'Asignar línea disponible' && projectStats?.registros) {
      const linea = projectStats.registros.find(
        (r) => r.id === value || String(r.id) === String(value)
      );

      if (linea && linea.Plan) {
        setFormData((prev) => ({
          ...prev,
          Linea: value,
          Plan: linea.Plan
        }));
        return;
      }
    }

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
        proyectoOrigen: selectedProject
      });
    }
  };

  const normalizeTipo = (tipo) =>
    (tipo || '')
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

  const tipoNorm = normalizeTipo(selectedTipoSolicitud);

  const isLineaExistente = !tipoNorm.includes('nueva linea') && lineasDisponibles.length > 0;
  const solicitudType = tipoNorm.includes('nueva linea') ? 'nueva' : 'existente';

  // Mensaje contextual según el tipo de solicitud y disponibilidad
  const getAvailabilityMessage = () => {
    if (!selectedTipoSolicitud) {
      return 'Seleccioná el tipo de solicitud para continuar.';
    }

    const tipoNorm = normalizeTipo(selectedTipoSolicitud);
    
    if (tipoNorm.includes('nueva linea')) {
      return 'Creá una solicitud para obtener una nueva línea telefónica.';
    }

    if (lineasDisponibles.length === 0) {
      if (tipoNorm.includes('asignar') && tipoNorm.includes('disponible')) {
        return `⚠️ No hay líneas disponibles para asignar en este proyecto. Considerá crear una solicitud de "Solicitar nueva línea".`;
      }
      if (tipoNorm.includes('reasignar')) {
        return `⚠️ No hay líneas activas para reasignar en este proyecto.`;
      }
      if (tipoNorm.includes('incidencia')) {
        return `⚠️ No hay líneas activas para reportar incidencias en este proyecto.`;
      }
      if (tipoNorm.includes('mantenimiento')) {
        return `⚠️ No hay líneas activas para registrar mantenimiento en este proyecto.`;
      }
      if (tipoNorm.includes('baja')) {
        return `⚠️ Todas las líneas de este proyecto ya están dadas de baja.`;
      }
      return `⚠️ No hay líneas disponibles para este tipo de solicitud en el proyecto seleccionado.`;
    }

    // Hay líneas disponibles
    if (tipoNorm.includes('asignar') && tipoNorm.includes('disponible')) {
      return `✓ Hay ${lineasDisponibles.length} línea${lineasDisponibles.length !== 1 ? 's' : ''} disponible${lineasDisponibles.length !== 1 ? 's' : ''} para asignar.`;
    }
    if (tipoNorm.includes('reasignar')) {
      return `✓ Hay ${lineasDisponibles.length} línea${lineasDisponibles.length !== 1 ? 's' : ''} activa${lineasDisponibles.length !== 1 ? 's' : ''} para reasignar.`;
    }
    if (tipoNorm.includes('incidencia')) {
      return `✓ Hay ${lineasDisponibles.length} línea${lineasDisponibles.length !== 1 ? 's' : ''} activa${lineasDisponibles.length !== 1 ? 's' : ''} para reportar incidencias.`;
    }
    if (tipoNorm.includes('mantenimiento')) {
      return `✓ Hay ${lineasDisponibles.length} línea${lineasDisponibles.length !== 1 ? 's' : ''} activa${lineasDisponibles.length !== 1 ? 's' : ''} para registrar mantenimiento.`;
    }
    if (tipoNorm.includes('baja')) {
      return `✓ Hay ${lineasDisponibles.length} línea${lineasDisponibles.length !== 1 ? 's' : ''} disponible${lineasDisponibles.length !== 1 ? 's' : ''} para solicitar baja.`;
    }

    return `Hay ${lineasDisponibles.length} línea${lineasDisponibles.length !== 1 ? 's' : ''} disponible${lineasDisponibles.length !== 1 ? 's' : ''} para este tipo de solicitud.`;
  };

  const availabilityMessage = getAvailabilityMessage();

  // Requiere línea si el tipo de solicitud lo necesita (independientemente de si hay líneas disponibles)
  const requiereLinea =
    tipoNorm &&
    !tipoNorm.includes('nueva linea');

  const requierePlan = tipoNorm.includes('nueva linea');

  const requiereProveedor = tipoNorm.includes('nueva linea');

  const requiereMotivoReasignacion = tipoNorm.includes('reasignar');

  const isFormBaseValid = selectedTipoSolicitud && formData.Comentarios && formData.Name;

  // La línea solo es requerida si se requiere línea Y hay líneas disponibles
  const requiereLineaYDisponible = requiereLinea && lineasDisponibles.length > 0;
  
  const isFormValid =
    isFormBaseValid &&
    (!requiereLineaYDisponible || formData.Linea) &&
    (!requierePlan || formData.Plan) &&
    (!requiereProveedor || formData.Empresa_Proveedor) &&
    (!requiereMotivoReasignacion || formData.Motivo_de_reasignaci_n);

  // Si no hay tipo de solicitud seleccionado, mostrar estado inicial
  if (!selectedTipoSolicitud) {
    return (
      <div className="solicitud-form-container">
        <div className="empty-form-state">
          <div className="empty-form-icon">📋</div>
          <h3 className="empty-form-title">Seleccioná el tipo de solicitud</h3>
          <p className="empty-form-description">
            {selectedProject 
              ? `Elegí el tipo de solicitud que querés realizar para el proyecto "${selectedProject}" y comenzá a completar el formulario.`
              : 'Primero seleccioná un proyecto origen y luego el tipo de solicitud para continuar.'}
          </p>
          <div className="empty-form-steps">
            <div className="step-item">
              <span className="step-number">1</span>
              <span className="step-text">Seleccioná el proyecto origen</span>
              {selectedProject && <span className="step-check">✓</span>}
            </div>
            <div className="step-item">
              <span className="step-number">2</span>
              <span className="step-text">Elegí el tipo de solicitud</span>
            </div>
            <div className="step-item">
              <span className="step-number">3</span>
              <span className="step-text">Completá el formulario</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              {selectedTipoSolicitud}
            </h3>
            <p className="solicitud-type-description">
              {availabilityMessage}
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
        {requiereLinea && (
          <div className="form-group linea-existente-group">
            <label htmlFor="Linea" className="form-label">
              {tipoNorm.includes('asignar') && tipoNorm.includes('disponible')
                ? 'Línea disponible a asignar'
                : tipoNorm.includes('reasignar')
                ? 'Línea a reasignar'
                : tipoNorm.includes('incidencia')
                ? 'Línea con incidencia'
                : tipoNorm.includes('mantenimiento')
                ? 'Línea para mantenimiento'
                : tipoNorm.includes('baja')
                ? 'Línea para solicitar baja'
                : 'Línea'}
              <span className="required">*</span>
            </label>
            {lineasDisponibles.length > 0 ? (
              <>
                <select
                  id="Linea"
                  name="Linea"
                  value={formData.Linea}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">
                    Seleccioná una línea ({lineasDisponibles.length} disponible{lineasDisponibles.length !== 1 ? 's' : ''})
                  </option>
                  {lineasDisponibles.map((linea) => (
                    <option key={linea.id} value={linea.id}>
                      {linea.Linea || `Línea ID: ${linea.id}`}
                    </option>
                  ))}
                </select>
                <p className="helper-text highlight-text">
                  ✓ {lineasDisponibles.length} línea{lineasDisponibles.length !== 1 ? 's' : ''} disponible{lineasDisponibles.length !== 1 ? 's' : ''} para este tipo de solicitud
                </p>
              </>
            ) : (
              <>
                <select
                  id="Linea"
                  name="Linea"
                  value=""
                  disabled
                  className="form-select form-select-disabled"
                >
                  <option value="">No hay líneas disponibles</option>
                </select>
                <div className="warning-message">
                  {tipoNorm.includes('asignar') && tipoNorm.includes('disponible') ? (
                    <p>
                      ⚠️ <strong>No hay líneas disponibles</strong> para asignar en este proyecto. 
                      Considerá crear una solicitud de <strong>"Solicitar nueva línea"</strong> en su lugar.
                    </p>
                  ) : tipoNorm.includes('reasignar') ? (
                    <p>
                      ⚠️ <strong>No hay líneas activas</strong> para reasignar en este proyecto. 
                      Todas las líneas están disponibles o dadas de baja.
                    </p>
                  ) : tipoNorm.includes('incidencia') ? (
                    <p>
                      ⚠️ <strong>No hay líneas activas</strong> para reportar incidencias en este proyecto. 
                      Todas las líneas están dadas de baja.
                    </p>
                  ) : tipoNorm.includes('mantenimiento') ? (
                    <p>
                      ⚠️ <strong>No hay líneas activas</strong> para registrar mantenimiento en este proyecto. 
                      Todas las líneas están dadas de baja.
                    </p>
                  ) : tipoNorm.includes('baja') ? (
                    <p>
                      ⚠️ <strong>Todas las líneas</strong> de este proyecto ya están dadas de baja. 
                      No hay líneas disponibles para solicitar baja.
                    </p>
                  ) : (
                    <p>
                      ⚠️ <strong>No hay líneas disponibles</strong> para este tipo de solicitud en el proyecto seleccionado.
                    </p>
                  )}
                </div>
              </>
            )}
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

          {(selectedTipoSolicitud === 'Solicitar nueva línea' ||
            selectedTipoSolicitud === 'Asignar línea disponible') && (
            <div className="form-group">
              <label htmlFor="Plan" className="form-label">
                <span className="label-icon">📋</span>
                Plan
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

        {selectedTipoSolicitud === 'Solicitar nueva línea' && (
          <div className="form-group">
            <label htmlFor="Empresa_Proveedor" className="form-label">
              Proveedor de la línea <span className="required">*</span>
            </label>
            <input
              id="Empresa_Proveedor"
              name="Empresa_Proveedor"
              type="text"
              value={formData.Empresa_Proveedor}
              onChange={handleChange}
              className="form-select"
              placeholder="Ingresá el proveedor de la nueva línea"
              required
            />
          </div>
        )}

        {selectedTipoSolicitud === 'Reasignar línea' && (
          <div className="form-group">
            <label htmlFor="Motivo_de_reasignaci_n" className="form-label">
              Motivo de reasignación <span className="required">*</span>
            </label>
            <textarea
              id="Motivo_de_reasignaci_n"
              name="Motivo_de_reasignaci_n"
              value={formData.Motivo_de_reasignaci_n}
              onChange={handleChange}
              className="form-textarea"
              rows="3"
              placeholder="Indicá por qué se reasigna esta línea"
              required
            />
          </div>
        )}

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
            disabled={loading || !isFormValid}
          >
            {loading
              ? 'Procesando...'
              : 'Confirmar solicitud'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SolicitudForm;
