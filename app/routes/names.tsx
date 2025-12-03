// Archivo que muestra un campo para cada jugador y guarda los nombres en sessionStorage
import React, { useEffect, useState } from "react";

export default function Names() {
  // Intentar leer datos pasados por navigation state (history.state) o desde sessionStorage
  const navState = (typeof window !== "undefined" && window.history && (window.history.state ?? {})) || {};
  const totalPlayersFromState = navState.totalPlayers as number | undefined;
  const isBrowser = typeof window !== "undefined" && typeof sessionStorage !== "undefined";
  const totalPlayersFromStorage = isBrowser ? Number(sessionStorage.getItem("uc_players") || "0") : 0;
  const totalPlayers = totalPlayersFromState ?? (totalPlayersFromStorage || 0);

  const [names, setNames] = useState<string[]>(() => Array(totalPlayers || 0).fill(""));
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (totalPlayers && names.length !== totalPlayers) {
      setNames(Array(totalPlayers).fill(""));
    }
  }, [totalPlayers]);

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...names];
    newNames[index] = value;
    setNames(newNames);
  };

  const onStart = () => {
    if (names.length === 0) return alert("No hay jugadores configurados.");
    if (names.some((n) => !n || !n.trim())) return alert("Rellena todos los nombres.");

    // Guardar nombres y configuración en sessionStorage para que /game los lea
    sessionStorage.setItem("uc_names", JSON.stringify(names));
    // también guardar counts si vienen en state
    if (navState.totalPlayers) sessionStorage.setItem("uc_players", String(navState.totalPlayers));
    if (navState.impostors) sessionStorage.setItem("uc_impostors", String(navState.impostors));
    if (navState.undercovers) sessionStorage.setItem("uc_undercovers", String(navState.undercovers));
    if (navState.civilians) sessionStorage.setItem("uc_civilians", String(navState.civilians));

    // Redirigir a /game (recarga completa para SSR/dev server resolver la ruta)
    window.location.href = "/game";
  };

  if (!totalPlayers || totalPlayers <= 0) {
    return (
      <div>
        <h1>Configuración incompleta</h1>
        <p>Vuelve a la pantalla de setup para configurar el número de jugadores.</p>
        <a href="/setup">Ir a Setup</a>
      </div>
    );
  }
  return (
    <main className="app-container setup-page">
      <div style={{ textAlign: 'center' }}>
        <img src="/logotipoimpostorcivillian.png" alt="logo" className="hero-logo" style={{ maxWidth: 120 }} />
      </div>

      <div style={{ textAlign: 'center', marginTop: 18 }}>
        <button className="btn-start-gray" onClick={() => setEditMode(true)}>Introducir Nombres</button>
      </div>

      <div className="inner-box mx-auto mt-6" style={{ maxWidth: 320 }}>
        {!editMode ? (
          <div className="col">
            {names.map((name, index) => (
              <div key={index} className="name-item">{name && name.trim() ? name : `Jugador ${index + 1}`}</div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 12 }}>
              <button className="btn" onClick={() => setEditMode(true)}>Editar</button>
              <a className="btn-ghost" href="/setup">Volver</a>
            </div>
          </div>
        ) : (
          <div className="col">
            {names.map((name, index) => (
              <div key={index}>
                <label className="muted">Jugador {index + 1}</label>
                <input className="input" type="text" value={name} onChange={(e) => handleNameChange(index, e.target.value)} />
              </div>
            ))}

            <div className="row mt-4" style={{ justifyContent: 'center' }}>
              <button className="btn" onClick={() => { setEditMode(false); }}>Guardar</button>
              <button className="btn-ghost" onClick={() => setEditMode(false)}>Cancelar</button>
              <button className="btn" onClick={onStart}>Start Game</button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}