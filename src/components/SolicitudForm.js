import React, { useState, useEffect } from 'react';
import './SolicitudForm.css';

/**
 * Componente para crear una solicitud usando campos reales del CRM
 * Campos: Tipo_de_solicitud, Prioridad, Comentarios, Area, Linea
 */

// Estado inicial del formulario (fuera del componente para evitar recreación)
const getInitialFormState = () => ({
  Prioridad: '',
  Comentarios: '',
  Area: '',
  Plan: '',
  Name: '',
  Linea: '',
  Empresa_Proveedor: '',
  Tipo_de_chip: '',
  Motivo_de_reasignaci_n: '',
  Propietario_nuevo: '',
  Notificar_el_pedido: true,
  // Campos adicionales para incidencias, mantenimiento y baja
  Tipo_de_incidencia: '',
  Fecha_de_incidencia: ''
});

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
  proveedorOptions = [],
  tipoChipOptions = [],
  tipoIncidenciaOptions = [],
  onSubmit,
  onCancel,
  loading,
  lastRecordId,
  onOpenLastRecord
}) {
  const [formData, setFormData] = useState(getInitialFormState());

  // Cada vez que cambia el proyecto o la disponibilidad, reseteamos el formulario
  useEffect(() => {
    setFormData(getInitialFormState());
  }, [selectedProject, availabilityStatus, selectedTipoSolicitud]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Si cambiamos la línea seleccionada y estamos en "Asignar línea disponible",
    // autocompletamos Plan y Name desde los registros del proyecto.
    if (name === 'Linea' && selectedTipoSolicitud === 'Asignar línea disponible' && projectStats?.registros) {
      const linea = projectStats.registros.find(
        (r) => r.id === value || String(r.id) === String(value)
      );

      if (linea) {
        // Buscar el valor correcto del Plan en las opciones disponibles
        let planValue = linea.Plan || '';
        if (planValue && planOptions.length > 0) {
          // Primero intentar coincidencia exacta con el value
          const exactMatch = planOptions.find(
            (opt) => opt.value === planValue || String(opt.value) === String(planValue)
          );
          
          // Si no hay coincidencia exacta, buscar por label
          if (!exactMatch) {
            const labelMatch = planOptions.find(
              (opt) => opt.label === planValue || String(opt.label) === String(planValue)
            );
            if (labelMatch) {
              planValue = labelMatch.value;
            }
          } else {
            planValue = exactMatch.value;
          }
        }

        // Buscar el valor correcto del Tipo_de_Chip en las opciones disponibles
        let tipoChipValue = linea.Tipo_de_Chip || linea.Tipo_de_chip || '';
        if (tipoChipValue && tipoChipOptions.length > 0) {
          // Primero intentar coincidencia exacta con el value
          const exactMatch = tipoChipOptions.find(
            (opt) => opt.value === tipoChipValue || String(opt.value) === String(tipoChipValue)
          );
          
          // Si no hay coincidencia exacta, buscar por label
          if (!exactMatch) {
            const labelMatch = tipoChipOptions.find(
              (opt) => opt.label === tipoChipValue || String(opt.label) === String(tipoChipValue)
            );
            if (labelMatch) {
              tipoChipValue = labelMatch.value;
            }
          } else {
            tipoChipValue = exactMatch.value;
          }
        }

        setFormData((prev) => ({
          ...prev,
          Linea: value,
          Plan: planValue,
          Tipo_de_chip: tipoChipValue,
          Name: linea.Name || prev.Name // Autocompletar Name si existe, sino mantener el valor anterior
        }));
        return;
      }
    }

    // Si cambiamos la línea seleccionada y estamos en "Reasignar línea",
    // autocompletamos Plan y Name (propietario actual) desde los registros del proyecto.
    if (name === 'Linea' && selectedTipoSolicitud === 'Reasignar línea' && projectStats?.registros) {
      const linea = projectStats.registros.find(
        (r) => r.id === value || String(r.id) === String(value)
      );

      if (linea) {
        // Buscar el valor correcto del Plan en las opciones disponibles
        let planValue = linea.Plan || '';
        if (planValue && planOptions.length > 0) {
          // Primero intentar coincidencia exacta con el value
          const exactMatch = planOptions.find(
            (opt) => opt.value === planValue || String(opt.value) === String(planValue)
          );
          
          // Si no hay coincidencia exacta, buscar por label
          if (!exactMatch) {
            const labelMatch = planOptions.find(
              (opt) => opt.label === planValue || String(opt.label) === String(planValue)
            );
            if (labelMatch) {
              planValue = labelMatch.value;
            }
          } else {
            planValue = exactMatch.value;
          }
        }

        // Buscar el valor correcto del Tipo_de_Chip en las opciones disponibles
        let tipoChipValue = linea.Tipo_de_Chip || linea.Tipo_de_chip || '';
        if (tipoChipValue && tipoChipOptions.length > 0) {
          // Primero intentar coincidencia exacta con el value
          const exactMatch = tipoChipOptions.find(
            (opt) => opt.value === tipoChipValue || String(opt.value) === String(tipoChipValue)
          );
          
          // Si no hay coincidencia exacta, buscar por label
          if (!exactMatch) {
            const labelMatch = tipoChipOptions.find(
              (opt) => opt.label === tipoChipValue || String(opt.label) === String(tipoChipValue)
            );
            if (labelMatch) {
              tipoChipValue = labelMatch.value;
            }
          } else {
            tipoChipValue = exactMatch.value;
          }
        }

        setFormData((prev) => ({
          ...prev,
          Linea: value,
          Plan: planValue,
          Tipo_de_chip: tipoChipValue,
          Name: linea.Name || ''
        }));
        return;
      }
    }

    // Si cambiamos la línea seleccionada y estamos en "Reportar incidencia",
    // autocompletamos Plan y Name (propietario actual) desde los registros del proyecto.
    if (name === 'Linea' && selectedTipoSolicitud === 'Reportar incidencia' && projectStats?.registros) {
      const linea = projectStats.registros.find(
        (r) => r.id === value || String(r.id) === String(value)
      );

      if (linea) {
        // Buscar el valor correcto del Plan en las opciones disponibles
        let planValue = linea.Plan || '';
        if (planValue && planOptions.length > 0) {
          // Primero intentar coincidencia exacta con el value
          const exactMatch = planOptions.find(
            (opt) => opt.value === planValue || String(opt.value) === String(planValue)
          );
          
          // Si no hay coincidencia exacta, buscar por label
          if (!exactMatch) {
            const labelMatch = planOptions.find(
              (opt) => opt.label === planValue || String(opt.label) === String(planValue)
            );
            if (labelMatch) {
              planValue = labelMatch.value;
            }
          } else {
            planValue = exactMatch.value;
          }
        }

        // Buscar el valor correcto del Tipo_de_Chip en las opciones disponibles
        let tipoChipValue = linea.Tipo_de_Chip || linea.Tipo_de_chip || '';
        if (tipoChipValue && tipoChipOptions.length > 0) {
          // Primero intentar coincidencia exacta con el value
          const exactMatch = tipoChipOptions.find(
            (opt) => opt.value === tipoChipValue || String(opt.value) === String(tipoChipValue)
          );
          
          // Si no hay coincidencia exacta, buscar por label
          if (!exactMatch) {
            const labelMatch = tipoChipOptions.find(
              (opt) => opt.label === tipoChipValue || String(opt.label) === String(tipoChipValue)
            );
            if (labelMatch) {
              tipoChipValue = labelMatch.value;
            }
          } else {
            tipoChipValue = exactMatch.value;
          }
        }

        setFormData((prev) => ({
          ...prev,
          Linea: value,
          Plan: planValue,
          Tipo_de_chip: tipoChipValue,
          Name: linea.Name || ''
        }));
        return;
      }
    }

    // Si cambiamos la línea seleccionada y estamos en "Mantenimiento",
    // autocompletamos Plan y Name (propietario actual) desde los registros del proyecto.
    if (name === 'Linea' && selectedTipoSolicitud === 'Mantenimiento' && projectStats?.registros) {
      const linea = projectStats.registros.find(
        (r) => r.id === value || String(r.id) === String(value)
      );

      if (linea) {
        // Buscar el valor correcto del Plan en las opciones disponibles
        let planValue = linea.Plan || '';
        if (planValue && planOptions.length > 0) {
          // Primero intentar coincidencia exacta con el value
          const exactMatch = planOptions.find(
            (opt) => opt.value === planValue || String(opt.value) === String(planValue)
          );
          
          // Si no hay coincidencia exacta, buscar por label
          if (!exactMatch) {
            const labelMatch = planOptions.find(
              (opt) => opt.label === planValue || String(opt.label) === String(planValue)
            );
            if (labelMatch) {
              planValue = labelMatch.value;
            }
          } else {
            planValue = exactMatch.value;
          }
        }

        // Buscar el valor correcto del Tipo_de_Chip en las opciones disponibles
        let tipoChipValue = linea.Tipo_de_Chip || linea.Tipo_de_chip || '';
        if (tipoChipValue && tipoChipOptions.length > 0) {
          // Primero intentar coincidencia exacta con el value
          const exactMatch = tipoChipOptions.find(
            (opt) => opt.value === tipoChipValue || String(opt.value) === String(tipoChipValue)
          );
          
          // Si no hay coincidencia exacta, buscar por label
          if (!exactMatch) {
            const labelMatch = tipoChipOptions.find(
              (opt) => opt.label === tipoChipValue || String(opt.label) === String(tipoChipValue)
            );
            if (labelMatch) {
              tipoChipValue = labelMatch.value;
            }
          } else {
            tipoChipValue = exactMatch.value;
          }
        }

        setFormData((prev) => ({
          ...prev,
          Linea: value,
          Plan: planValue,
          Tipo_de_chip: tipoChipValue,
          Name: linea.Name || ''
        }));
        return;
      }
    }

    // Si cambiamos la línea seleccionada y estamos en "Solicitar baja",
    // autocompletamos Plan y Name (propietario actual) desde los registros del proyecto.
    if (name === 'Linea' && selectedTipoSolicitud === 'Solicitar baja' && projectStats?.registros) {
      const linea = projectStats.registros.find(
        (r) => r.id === value || String(r.id) === String(value)
      );

      if (linea) {
        // Buscar el valor correcto del Plan en las opciones disponibles
        let planValue = linea.Plan || '';
        if (planValue && planOptions.length > 0) {
          // Primero intentar coincidencia exacta con el value
          const exactMatch = planOptions.find(
            (opt) => opt.value === planValue || String(opt.value) === String(planValue)
          );
          
          // Si no hay coincidencia exacta, buscar por label
          if (!exactMatch) {
            const labelMatch = planOptions.find(
              (opt) => opt.label === planValue || String(opt.label) === String(planValue)
            );
            if (labelMatch) {
              planValue = labelMatch.value;
            }
          } else {
            planValue = exactMatch.value;
          }
        }

        // Buscar el valor correcto del Tipo_de_Chip en las opciones disponibles
        let tipoChipValue = linea.Tipo_de_Chip || linea.Tipo_de_chip || '';
        if (tipoChipValue && tipoChipOptions.length > 0) {
          // Primero intentar coincidencia exacta con el value
          const exactMatch = tipoChipOptions.find(
            (opt) => opt.value === tipoChipValue || String(opt.value) === String(tipoChipValue)
          );
          
          // Si no hay coincidencia exacta, buscar por label
          if (!exactMatch) {
            const labelMatch = tipoChipOptions.find(
              (opt) => opt.label === tipoChipValue || String(opt.label) === String(tipoChipValue)
            );
            if (labelMatch) {
              tipoChipValue = labelMatch.value;
            }
          } else {
            tipoChipValue = exactMatch.value;
          }
        }

        setFormData((prev) => ({
          ...prev,
          Linea: value,
          Plan: planValue,
          Tipo_de_chip: tipoChipValue,
          Name: linea.Name || ''
        }));
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
  
  // Bloquear formulario si es "Asignar línea disponible" y no hay líneas disponibles
  const isFormDisabled = tipoNorm.includes('asignar') && 
                         tipoNorm.includes('disponible') && 
                         lineasDisponibles.length === 0;

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

  const isFormBaseValid = selectedTipoSolicitud && formData.Name && formData.Prioridad && formData.Area;

  // La línea solo es requerida si se requiere línea Y hay líneas disponibles
  const requiereLineaYDisponible = requiereLinea && lineasDisponibles.length > 0;
  
  const requierePropietarioNuevo = tipoNorm.includes('reasignar');
  
  // Campos adicionales requeridos para incidencias, mantenimiento y baja
  const requiereCamposAdicionales = 
    tipoNorm.includes('incidencia') || 
    tipoNorm.includes('mantenimiento') || 
    tipoNorm.includes('baja');
  
  const camposAdicionalesValidos = !requiereCamposAdicionales || 
    (formData.Tipo_de_incidencia && formData.Fecha_de_incidencia && formData.Comentarios);
  
  const isFormValid =
    isFormBaseValid &&
    (!requiereLineaYDisponible || formData.Linea) &&
    (!requierePlan || formData.Plan) &&
    (!requiereProveedor || formData.Empresa_Proveedor) &&
    (!requiereMotivoReasignacion || formData.Motivo_de_reasignaci_n) &&
    (!requierePropietarioNuevo || formData.Propietario_nuevo) &&
    camposAdicionalesValidos;

  // Si no hay tipo de solicitud seleccionado, mostrar estado inicial
  if (!selectedTipoSolicitud) {
    return (
      <div className="solicitud-form-container">
        <div className="empty-form-state">
          <div className="empty-form-icon">👈</div>
          <h3 className="empty-form-title">Seleccioná el tipo de solicitud</h3>
          <p className="empty-form-description">
            {selectedProject 
              ? <>Usá el selector <strong>"Tipo de solicitud"</strong> en el panel izquierdo para elegir qué tipo de solicitud querés realizar para el proyecto "{selectedProject}".</>
              : 'Primero seleccioná un proyecto origen en el panel izquierdo y luego elegí el tipo de solicitud.'}
          </p>
          <div className="empty-form-hint">
            <div className="hint-arrow">←</div>
            <div className="hint-text">Usá el selector en el panel izquierdo</div>
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
              Prioridad <span className="required">*</span>
            </label>
            <select
              id="Prioridad"
              name="Prioridad"
              value={formData.Prioridad}
              onChange={handleChange}
              className="form-select"
              required
              disabled={isFormDisabled}
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
              Área solicitante <span className="required">*</span>
            </label>
            <select
              id="Area"
              name="Area"
              value={formData.Area}
              onChange={handleChange}
              className="form-select"
              required
              disabled={isFormDisabled}
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
              {(selectedTipoSolicitud === 'Reasignar línea' || 
                selectedTipoSolicitud === 'Reportar incidencia' ||
                selectedTipoSolicitud === 'Mantenimiento' ||
                selectedTipoSolicitud === 'Solicitar baja') ? 'Propietario actual' : 'Propietario de línea'} <span className="required">*</span>
            </label>
            <input
              id="Name"
              name="Name"
              type="text"
              value={formData.Name}
              onChange={handleChange}
              className={`form-select ${(selectedTipoSolicitud === 'Reasignar línea' || 
                selectedTipoSolicitud === 'Reportar incidencia' ||
                selectedTipoSolicitud === 'Mantenimiento' ||
                selectedTipoSolicitud === 'Solicitar baja') ? 'form-select-readonly' : ''}`}
              placeholder="Ingresá el nombre del propietario de la línea"
              required
              readOnly={selectedTipoSolicitud === 'Reasignar línea' || 
                selectedTipoSolicitud === 'Reportar incidencia' ||
                selectedTipoSolicitud === 'Mantenimiento' ||
                selectedTipoSolicitud === 'Solicitar baja'}
              disabled={isFormDisabled}
            />
          </div>

          {(selectedTipoSolicitud === 'Solicitar nueva línea' ||
            selectedTipoSolicitud === 'Asignar línea disponible' ||
            selectedTipoSolicitud === 'Reasignar línea' ||
            selectedTipoSolicitud === 'Reportar incidencia' ||
            selectedTipoSolicitud === 'Mantenimiento' ||
            selectedTipoSolicitud === 'Solicitar baja') && (
          <div className="form-group">
            <label htmlFor="Plan" className="form-label">
              Plan
            </label>
              <select
                id="Plan"
                name="Plan"
                value={formData.Plan}
                onChange={handleChange}
                className={`form-select ${(selectedTipoSolicitud === 'Asignar línea disponible' ||
                  selectedTipoSolicitud === 'Reasignar línea' || 
                  selectedTipoSolicitud === 'Reportar incidencia' ||
                  selectedTipoSolicitud === 'Mantenimiento' ||
                  selectedTipoSolicitud === 'Solicitar baja') ? 'form-select-readonly' : ''}`}
                disabled={isFormDisabled || selectedTipoSolicitud === 'Asignar línea disponible' ||
                  selectedTipoSolicitud === 'Reasignar línea' || 
                  selectedTipoSolicitud === 'Reportar incidencia' ||
                  selectedTipoSolicitud === 'Mantenimiento' ||
                  selectedTipoSolicitud === 'Solicitar baja'}
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

        {/* Fila con Propietario nuevo y Tipo de chip (solo para Reasignar línea) */}
        {selectedTipoSolicitud === 'Reasignar línea' && (
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="Propietario_nuevo" className="form-label">
                Propietario nuevo <span className="required">*</span>
              </label>
              <input
                id="Propietario_nuevo"
                name="Propietario_nuevo"
                type="text"
                value={formData.Propietario_nuevo}
                onChange={handleChange}
                className="form-select"
                placeholder="Ingresá el nombre del nuevo propietario de la línea"
                required
                disabled={isFormDisabled}
              />
            </div>
            <div className="form-group">
              <label htmlFor="Tipo_de_chip" className="form-label">
                Tipo de chip
              </label>
              <select
                id="Tipo_de_chip"
                name="Tipo_de_chip"
                value={formData.Tipo_de_chip}
                onChange={handleChange}
                className="form-select form-select-readonly"
                disabled={isFormDisabled || true}
              >
                <option value="">Seleccioná un tipo de chip</option>
                {tipoChipOptions && tipoChipOptions.length > 0 ? (
                  tipoChipOptions.map((option) => (
                    <option key={option.value || option.label} value={option.value || option.label}>
                      {option.label || option.value}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Cargando opciones...</option>
                )}
              </select>
            </div>
          </div>
        )}

        {/* Proveedor de línea y Tipo de chip (solo para Solicitar nueva línea) */}
        {selectedTipoSolicitud === 'Solicitar nueva línea' && (
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="Empresa_Proveedor" className="form-label">
                Proveedor de línea <span className="required">*</span>
              </label>
              <select
                id="Empresa_Proveedor"
                name="Empresa_Proveedor"
                value={formData.Empresa_Proveedor}
                onChange={handleChange}
                className="form-select"
                required
                disabled={isFormDisabled}
              >
                <option value="">Seleccioná un proveedor</option>
                {proveedorOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="Tipo_de_chip" className="form-label">
                Tipo de chip
              </label>
              <select
                id="Tipo_de_chip"
                name="Tipo_de_chip"
                value={formData.Tipo_de_chip}
                onChange={handleChange}
                className="form-select"
                disabled={isFormDisabled}
              >
                <option value="">Seleccioná un tipo de chip</option>
                {tipoChipOptions && tipoChipOptions.length > 0 ? (
                  tipoChipOptions.map((option) => (
                    <option key={option.value || option.label} value={option.value || option.label}>
                      {option.label || option.value}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Cargando opciones...</option>
                )}
              </select>
            </div>
          </div>
        )}

        {/* Tipo de chip solo (para otros casos que no sean Solicitar nueva línea ni Reasignar línea) */}
        {(selectedTipoSolicitud === 'Asignar línea disponible' ||
          selectedTipoSolicitud === 'Reportar incidencia' ||
          selectedTipoSolicitud === 'Mantenimiento' ||
          selectedTipoSolicitud === 'Solicitar baja') && (
            <div className="form-group">
              <label htmlFor="Tipo_de_chip" className="form-label">
                Tipo de chip
              </label>
              <select
                id="Tipo_de_chip"
                name="Tipo_de_chip"
                value={formData.Tipo_de_chip}
                onChange={handleChange}
                className="form-select form-select-readonly"
                disabled={isFormDisabled || true}
              >
                <option value="">Seleccioná un tipo de chip</option>
                {tipoChipOptions && tipoChipOptions.length > 0 ? (
                  tipoChipOptions.map((option) => (
                    <option key={option.value || option.label} value={option.value || option.label}>
                      {option.label || option.value}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Cargando opciones...</option>
                )}
              </select>
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
              disabled={isFormDisabled}
            />
          </div>
        )}

        {/* Sección de campos adicionales para incidencias, mantenimiento y baja */}
        {(selectedTipoSolicitud === 'Reportar incidencia' ||
          selectedTipoSolicitud === 'Mantenimiento' ||
          selectedTipoSolicitud === 'Solicitar baja') && (
          <div className="incidencia-details-section">
            <div className="incidencia-section-header">
              <h4 className="incidencia-section-title">
                {selectedTipoSolicitud === 'Reportar incidencia' && '📋 Detalles de la incidencia'}
                {selectedTipoSolicitud === 'Mantenimiento' && '🔧 Detalles del mantenimiento'}
                {selectedTipoSolicitud === 'Solicitar baja' && '📝 Detalles de la solicitud de baja'}
              </h4>
              <p className="incidencia-section-subtitle">
                Completá la información detallada para tener un registro completo
              </p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="Tipo_de_incidencia" className="form-label">
                  {selectedTipoSolicitud === 'Reportar incidencia' && 'Tipo de incidencia'}
                  {selectedTipoSolicitud === 'Mantenimiento' && 'Tipo de mantenimiento'}
                  {selectedTipoSolicitud === 'Solicitar baja' && 'Tipo de solicitud'}
                  {' '}
                  <span className="required">*</span>
                </label>
                <select
                  id="Tipo_de_incidencia"
                  name="Tipo_de_incidencia"
                  value={formData.Tipo_de_incidencia}
                  onChange={handleChange}
                  className="form-select"
                  required
                  disabled={isFormDisabled}
                >
                  <option value="">Seleccioná una opción</option>
                  {tipoIncidenciaOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="Fecha_de_incidencia" className="form-label">
                  Fecha de incidencia <span className="required">*</span>
                </label>
                <input
                  id="Fecha_de_incidencia"
                  name="Fecha_de_incidencia"
                  type="date"
                  value={formData.Fecha_de_incidencia}
                  onChange={handleChange}
                  className="form-select"
                  required
                  disabled={isFormDisabled}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
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
                rows={5}
                placeholder={
                  selectedTipoSolicitud === 'Reportar incidencia'
                    ? 'Describí la incidencia en detalle: síntomas, causa, pasos realizados, impacto, etc.'
                    : selectedTipoSolicitud === 'Mantenimiento'
                    ? 'Detallá el mantenimiento requerido: qué se necesita hacer, materiales, duración, técnico asignado, etc.'
                    : 'Explicá los detalles de la solicitud de baja: motivo específico, fecha deseada, proceso de migración, etc.'
                }
                required
                disabled={isFormDisabled}
              />
            </div>
          </div>
        )}

        {/* Campo de comentarios para otros tipos de solicitud */}
        {!['Reportar incidencia', 'Mantenimiento', 'Solicitar baja'].includes(selectedTipoSolicitud) && (
          <div className="form-group">
            <label htmlFor="Comentarios" className="form-label">
              Comentarios adicionales
            </label>
            <textarea
              id="Comentarios"
              name="Comentarios"
              value={formData.Comentarios}
              onChange={handleChange}
              className="form-textarea"
              rows={4}
              placeholder="Describe la necesidad de la solicitud, contexto y responsables..."
              disabled={isFormDisabled}
            />
          </div>
        )}

        <div className="form-actions">
          <div className="form-actions-left">
            <label className="form-label checkbox-inline" htmlFor="Notificar_el_pedido">
              <input
                id="Notificar_el_pedido"
                name="Notificar_el_pedido"
                type="checkbox"
                checked={!!formData.Notificar_el_pedido}
                onChange={handleChange}
                className="form-checkbox"
                disabled={isFormDisabled}
              />
              <span>Notificar el pedido</span>
            </label>
            {!formData.Notificar_el_pedido && (
              <span className="notify-warning-text">
                ⚠️ No se notificará a nadie y quedará en stand-by
              </span>
            )}
          </div>

          <div className="form-actions-right">
            {lastRecordId && onOpenLastRecord && (
              <button
                type="button"
                onClick={onOpenLastRecord}
                className="btn btn-secondary"
                disabled={loading}
              >
                Ver registro actualizado
              </button>
            )}
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
              disabled={loading || !isFormValid || isFormDisabled}
            >
              {loading
                ? 'Procesando...'
                : 'Confirmar solicitud'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default SolicitudForm;
