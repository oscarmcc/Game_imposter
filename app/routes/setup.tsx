import React from "react";
import { useState } from "react";

export default function Setup() {
  const [totalPlayers, setTotalPlayers] = useState(3); // mínimo 4 jugadores
  const [impostors, setImpostors] = useState(1);
  const [undercovers, setUndercovers] = useState(0);
  const [civilians, setCivilians] = useState(2);
  const [error, setError] = useState("");

// una vez puesto el numeor total de jugadores, se calcula el numero maximo de impostores y undercovers y civiles, además si quito por ejemplo un impostor se suma un civil siempre que los roles no superen el numero total de jugadores

  const handleTotalPlayersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10) || 0;
    setTotalPlayers(value);
    // Ajustar roles si exceden el nuevo total de jugadores
    if (impostors + undercovers + civilians > value) {
      setImpostors(1);
        setUndercovers(0);
        setCivilians(value - 1);
    }
    setError("");
  };

  const handleImpostorsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10) || 0;
    if (value + undercovers + civilians <= totalPlayers) {
      setImpostors(value);
      setCivilians(totalPlayers - value - undercovers);
      setError("");
    } else {
      setError("El número de roles excede el total de jugadores.");
    }
  };
    const handleUndercoversChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10) || 0;
    if (impostors + value + civilians <= totalPlayers) {
      setUndercovers(value);
        setCivilians(totalPlayers - impostors - value);
        setError("");
    } else {
      setError("El número de roles excede el total de jugadores.");
    }
  };
    const handleCiviliansChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10) || 0;
    if (impostors + undercovers + value <= totalPlayers) {
      setCivilians(value);
        setError("");
    } else {
      setError("El número de roles excede el total de jugadores.");
    }
  };
    const handleStartGame = () => {
    if (impostors + undercovers + civilians === totalPlayers) {
      // Guardar configuración en sessionStorage como fallback para /names
      sessionStorage.setItem("uc_players", String(totalPlayers));
      sessionStorage.setItem("uc_impostors", String(impostors));
      sessionStorage.setItem("uc_undercovers", String(undercovers));
      sessionStorage.setItem("uc_civilians", String(civilians));
      // Navegar a /names con recarga completa para que el servidor/dev resuelva la ruta
      window.location.href = "/names";
    } else {
      setError("La suma de los roles debe ser igual al total de jugadores.");
    }
  };
    return (
    <main className="app-container setup-page">
      <div className="card" style={{ background: 'transparent', boxShadow: 'none', border: 'none' }}>
        <h1 className="title">Configurar partida</h1>
        <p className="muted">Ajusta el número de jugadores y la cantidad de cada rol.</p>

        <div className="inner-box col mt-6">
          <div className="role-row">
            <div className="value-pill">{totalPlayers}</div>
            <div className="role-label">Total Jugadores</div>
            <input
              className="slider"
              type="range"
              value={totalPlayers}
              onChange={handleTotalPlayersChange}
              min={3}
              max={12}
            />
          </div>

          <div className="role-row">
            <div className="value-pill">{civilians}</div>
            <div className="role-label">Civiles</div>
            <input className="slider" type="range" value={civilians} onChange={handleCiviliansChange} min={0} max={Math.max(0, totalPlayers - impostors - undercovers)} />
            <img className="role-icon" src="/civilician.png" alt="Civil" />
          </div>

          <div className="role-row">
            <div className="value-pill">{impostors}</div>
            <div className="role-label">Impostores</div>
            <input className="slider" type="range" value={impostors} onChange={handleImpostorsChange} min={1} max={Math.max(1, totalPlayers - 2)} />
            <img className="role-icon" src="/impostor.png" alt="Impostor" />
          </div>

          <div className="role-row">
            <div className="value-pill">{undercovers}</div>
            <div className="role-label">Undercovers</div>
            <input className="slider" type="range" value={undercovers} onChange={handleUndercoversChange} min={0} max={Math.max(0, totalPlayers - impostors - 1)} />
            <img className="role-icon" src="/undercover.png" alt="Undercover" />
          </div>

          {error && <p className="text-red-600">{error}</p>}

          <div className="mt-4 row" style={{ justifyContent: 'center' }}>
            <button className="btn" onClick={handleStartGame}>Start Game</button>
            <a className="btn-ghost" href="/">Cancelar</a>
          </div>
        </div>
      </div>
    </main>
  );
}