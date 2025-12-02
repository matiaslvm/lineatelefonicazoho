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
            <div>
              <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>
                ✓ Líneas disponibles encontradas
              </p>
              <p style={{ margin: 0 }}>
                Hay <strong>{projectStats.disponibles}</strong> línea(s) disponible(s) para el proyecto seleccionado.
                Podés <strong>asignar una línea existente</strong> a un nuevo propietario.
              </p>
            </div>
          ) : (
            <div>
              <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>
                ⚠ No hay líneas disponibles
              </p>
              <p style={{ margin: 0 }}>
                No hay líneas disponibles para este proyecto. Generá una <strong>solicitud para pedir una nueva línea</strong> telefónica.
              </p>
            </div>
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
