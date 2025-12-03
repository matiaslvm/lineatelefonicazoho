import React from 'react';
import './LineaInfo.css';

/**
 * Componente para seleccionar proyecto y visualizar disponibilidad
 */
function LineaInfo({
  projectOptions,
  selectedProject,
  onProjectChange,
  tipoSolicitudOptions,
  selectedTipoSolicitud,
  onTipoSolicitudChange,
  projectStats,
  loadingProjects,
  loadingStats,
  availabilityStatus,
  error
}) {
  const handleSelect = (event) => {
    onProjectChange(event.target.value);
  };

  const renderStats = () => {
    if (loadingStats) {
      return <div className="loading-spinner">Calculando disponibilidad...</div>;
    }

    if (!projectStats) {
      return <p className="helper-text">Seleccioná un proyecto para ver el estado de las líneas.</p>;
    }

    return (
      <>
        <div className="stats-grid">
          <div className="stat-card">
            <p className="stat-label">Líneas registradas</p>
            <p className="stat-value">{projectStats.total}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Líneas disponibles</p>
            <p className="stat-value">{projectStats.disponibles}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Líneas ocupadas</p>
            <p className="stat-value">
              {projectStats.total - projectStats.disponibles - (projectStats.suspendidas || 0)}
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Líneas con incidencia</p>
            <p className="stat-value">{projectStats.suspendidas || 0}</p>
          </div>
        </div>

        <div className={`availability-banner ${availabilityStatus}`}>
          {availabilityStatus === 'available' ? (
            <p style={{ margin: 0 }}>
              ✓ Hay <strong>{projectStats.disponibles}</strong> línea(s) disponibles. Podés{' '}
              <strong>asignar una línea existente</strong>.
            </p>
          ) : (
            <p style={{ margin: 0 }}>
              ⚠ No hay líneas disponibles para este proyecto. Creá una{' '}
              <strong>solicitud para pedir una nueva línea</strong>.
            </p>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="linea-info-container">
      <div className="linea-info-header">
        <h2>Disponibilidad por proyecto</h2>
        <p className="linea-info-subtitle">
          Usá este filtro para saber si tenés líneas libres antes de crear la solicitud.
        </p>
      </div>

      <div className="selector-row">
        <label htmlFor="proyectoOrigen" className="selector-label">
          Proyecto origen
        </label>
        <select
          id="proyectoOrigen"
          className="selector-control"
          value={selectedProject || ''}
          onChange={handleSelect}
          disabled={loadingProjects}
        >
          <option value="">Seleccioná un proyecto</option>
          {projectOptions.map((option) => (
            <option
              key={option.value || option.id || option.actual_value || option.display_value}
              value={option.value || option.actual_value || option.display_value}
            >
              {option.label || option.display_value}
            </option>
          ))}
        </select>
        {loadingProjects && (
          <p className="helper-text">Cargando proyectos...</p>
        )}
      </div>

      {selectedProject && (
        <div className="selector-row" style={{ marginTop: '16px' }}>
          <label htmlFor="tipoSolicitud" className="selector-label">
            Tipo de solicitud
          </label>
          <select
            id="tipoSolicitud"
            className="selector-control"
            value={selectedTipoSolicitud || ''}
            onChange={(e) => onTipoSolicitudChange(e.target.value)}
          >
            <option value="">Seleccioná un tipo de solicitud</option>
            {tipoSolicitudOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {renderStats()}
    </div>
  );
}

export default LineaInfo;
