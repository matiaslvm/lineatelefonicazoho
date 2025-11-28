import React from 'react';
import './LineaInfo.css';

/**
 * Componente para seleccionar proyecto y visualizar disponibilidad
 */
function LineaInfo({
  projectOptions,
  selectedProject,
  onProjectChange,
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
            <p className="stat-value">{projectStats.total - projectStats.disponibles}</p>
          </div>
        </div>

        <div className={`availability-banner ${availabilityStatus}`}>
          {availabilityStatus === 'available' ? (
            <p>
              Hay <strong>{projectStats.disponibles}</strong> líneas disponibles para el proyecto seleccionado.
              Podés asignar una existente.
            </p>
          ) : (
            <p>
              No hay líneas disponibles. Generá una solicitud para pedir una nueva línea.
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
          {projectOptions.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>

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

