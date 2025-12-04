import React, { useEffect, useState } from "react";

const WORD_PAIRS: string[] = [
  "gato","manzana","coche","casa","perro","mesa","silla","ventana","puerta","libro",
  "pluma","papel","bicicleta","sombrero","camisa","pantalón","zapato","ciudad","pueblo","montaña",
  "río","mar","playa","sol","luna","estrella","cielo","nube","lluvia","nieve",
  "viento","clima","calor","frío","verano","invierno","primavera","otoño","día","noche",
  "mano","ojo","boca","nariz","oreja","cabeza","pierna","brazo","corazón","alma",
  "mente","cuerpo","cara","sonrisa","lágrima","palabra","idioma","voz","silencio","sonido",
  "música","canción","baile","arte","pintura","cuadro","dibujo","color","luz","sombra",
  "forma","línea","punto","círculo","cuadrado","triángulo","rectángulo","figura","tamaño","peso",
  "hora","minuto","segundo","tiempo","momento","recuerdo","sueño","deseo","esperanza","miedo",
  "alegría","tristeza","amor","odio","paz","guerra","amistad","familia","vecino","compañero",
  "escuela","universidad","clase","lección","examen","nota","cuaderno","bolígrafo","lápiz","pupitre",
  "profesor","estudiante","alumno","maestro","tarea","proyecto","idea","ciencia","física","química",
  "biología","historia","geografía","matemáticas","álgebra","geometría","cálculo","problema","solución","pregunta",
  "respuesta","experimento","teoría","concepto","dato","información","sistema","máquina","motor","tren",
  "avión","barco","carretera","calle","puente","edificio","piso","techo","suelo","árbol",
  "jardín","parque","barrio","callejón","plaza","mercado","tienda","supermercado","restaurante","café",
  "hotel","hospital","banco","oficina","fábrica","taller","aeropuerto","estación","puerto","nave",
  "cohete","satélite","planeta","galaxia","universo","espacio","átomo","partícula","electrón","protón",
  "neutrón","núcleo","energía","fuerza","masa","volumen","densidad","materia","sangre","agua",
  "aire","fuego","tierra","sal","azúcar","miel","leche","pan","fruta","verdura",
  "carne","pescado","arroz","pasta","aceite","mantequilla","queso","huevo","vaso","taza",
  "plato","cuchara","cuchillo","tenedor","mantel","servilleta","cocina","horno","nevera","sala",
  "salón","dormitorio","baño","ropa","vestido","pantalones","camiseta","chaqueta","abrigo","chamarra",
  "bota","sombrero","gorro","bufanda","guante","calcetín","reloj","cinturón","bolso","cartera",
  "llave","historia","novela","cuento","poesía","poema","melodía","ritmo","verso","rima",
  "drama","teatro","película","actor","actriz","escena","guion","público","aplauso","juego",
  "partida","ronda","jugador","equipo","victoria","derrota","empate","campeón","trofeo","medalla",
  "premio","reto","meta","objetivo","desafío","puntuación","récord","final","inicio"
];

function shuffle<T>(arr: T[]) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Game() {
  const isBrowser = typeof window !== "undefined" && typeof sessionStorage !== "undefined";
  const navState = isBrowser ? (window.history.state ?? {}) : {};
  const namesFromStorage = isBrowser ? (() => { try { const raw = sessionStorage.getItem("uc_names"); return raw ? JSON.parse(raw) as string[] : null } catch { return null } })() : null;

  const names: string[] = navState.names ?? namesFromStorage ?? [];
  const totalPlayers = navState.totalPlayers ?? names.length ?? (isBrowser ? Number(sessionStorage.getItem("uc_players") || 0) : 0);
  const impostors = navState.impostors ?? (isBrowser ? Number(sessionStorage.getItem("uc_impostors") || 0) : 0);
  const undercovers = navState.undercovers ?? (isBrowser ? Number(sessionStorage.getItem("uc_undercovers") || 0) : 0);
  const civilians = navState.civilians ?? (isBrowser ? Number(sessionStorage.getItem("uc_civilians") || 0) : Math.max(0, totalPlayers - impostors - undercovers));

  const roles: string[] = [];
  for (let i = 0; i < impostors; i++) roles.push("Impostor");
  for (let i = 0; i < undercovers; i++) roles.push("Undercover");
  for (let i = 0; i < civilians; i++) roles.push("Civilian");
  while (roles.length < totalPlayers) roles.push("Civilian");

  const [civilianWord, setCivilianWord] = useState(() => WORD_PAIRS[Math.floor(Math.random() * WORD_PAIRS.length)]);

  function generatePlayers(word: string) {
    const rolesLocal = roles.slice();
    const shuffledRolesLocal = shuffle(rolesLocal);
    const namesList = names.length ? shuffle(names.slice()) : Array.from({ length: totalPlayers }, (_, i) => `Jugador ${i + 1}`);
    return namesList.map((name, idx) => ({
      name,
      role: shuffledRolesLocal[idx] ?? "Civilian",
      word: shuffledRolesLocal[idx] === "Impostor" ? "" : word,
      alive: true,
    }));
  }

  const [playersState, setPlayersState] = useState(() => generatePlayers(civilianWord));
  const [revealIndex, setRevealIndex] = useState(0);
  const [revealingDone, setRevealingDone] = useState(false);
  const [expelMode, setExpelMode] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [lastExpelled, setLastExpelled] = useState<string | null>(null);
  const [expelledThisRound, setExpelledThisRound] = useState(false);
  const [winningWord, setWinningWord] = useState<string | null>(null);
  const [lastExpelledRole, setLastExpelledRole] = useState<string | null>(null);
  const [lastExpelledWord, setLastExpelledWord] = useState<string | null>(null);
  const [roleRevealed, setRoleRevealed] = useState(false);

  useEffect(() => {
    if (winner === "Civilians" && winningWord) {
      const t = setTimeout(() => {
        handleRestart();
      }, 2200);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [winner, winningWord]);

  useEffect(() => {
    if (roleRevealed) {
      const t = setTimeout(() => {
        setRoleRevealed(false);
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [roleRevealed]);

  const handleNextReveal = () => {
    setRoleRevealed(false);
    if (revealIndex + 1 >= playersState.length) setRevealingDone(true);
    else setRevealIndex((i) => i + 1);
  };

  const handleExpel = (idx: number) => {
    const copy = playersState.slice();
    const expelledPlayer = { ...copy[idx] };
    copy[idx] = { ...copy[idx], alive: false };
    setPlayersState(copy);
    setLastExpelled(expelledPlayer.name);
    setLastExpelledRole(expelledPlayer.role);
    setLastExpelledWord(expelledPlayer.word ?? null);
    setExpelledThisRound(true);

    const alive = copy.filter((p) => p.alive);
    const badCount = alive.filter((p) => p.role === "Undercover" || p.role === "Impostor").length;
    const civCount = alive.filter((p) => p.role === "Civilian").length;

    if (badCount === 0) {
      setWinner("Civilians");
      setWinningWord(civilianWord);
    } else if (badCount >= civCount) {
      setWinner("Undercover/Impostors");
    }
  };

  const continueAfterExpel = () => {
    const shuffled = shuffle(playersState.slice());
    setPlayersState(shuffled);
    setLastExpelled(null);
    setLastExpelledRole(null);
    setLastExpelledWord(null);
    setExpelledThisRound(false);
    setExpelMode(false);
  };

  const handleRestart = () => {
    if (!isBrowser) return;
    let newWord = WORD_PAIRS[Math.floor(Math.random() * WORD_PAIRS.length)];
    if (WORD_PAIRS.length > 1) {
      while (newWord === civilianWord) {
        newWord = WORD_PAIRS[Math.floor(Math.random() * WORD_PAIRS.length)];
      }
    }
    setCivilianWord(newWord);
    setPlayersState(generatePlayers(newWord));
    setRevealIndex(0);
    setRevealingDone(false);
    setExpelMode(false);
    setWinner(null);
    setLastExpelled(null);
    setExpelledThisRound(false);
    setWinningWord(null);
    setLastExpelledRole(null);
    setLastExpelledWord(null);
  };

  const handleModifyPlayers = () => { if (isBrowser) window.location.href = "/setup" };

  if (!playersState || playersState.length === 0) {
    return (
      <main className="app-container">
        <div className="card">
          <h2 className="title">Partida no configurada</h2>
          <p className="muted">Vuelve a setup para configurar la partida.</p>
          <div className="mt-4">
            <a className="btn" href="/setup">Ir a Setup</a>
          </div>
        </div>
      </main>
    );
  }

  // ======================
  // VISTA 1: ASIGNACIÓN DE ROL/PALABRA (Captura 1)
  // ======================
  if (!revealingDone) {
    const p = playersState[revealIndex];
    const cardImage = p.role === "Impostor" ? "/impostor.png" : p.role === "Undercover" ? "/undercover.png" : "/civilician.png";
    
    return (
      <main className="game-page">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <img src="/logotipoimpostorcivillian.png" alt="logo" className="hero-logo" style={{ maxWidth: 100 }} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="inner-box" style={{ display: 'inline-block', padding: '0.75rem 1.5rem' }}>
            <strong style={{ color: '#0f172a' }}>Jugador {p.name}</strong>
          </div>
        </div>

        <div 
          className="role-card" 
          onClick={() => !roleRevealed && setRoleRevealed(true)}
          style={{ cursor: roleRevealed ? 'default' : 'pointer' }}
        >
          <img src={roleRevealed ? cardImage : "/incognito.png"} alt={roleRevealed ? p.role : "???"} />
          <div className="role-card-label">
            {roleRevealed 
              ? (p.role === "Impostor" ? "IMPOSTOR" : p.word ? p.word.toUpperCase() : "CIVILIAN")
              : "???"}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <div className="inner-box" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', marginBottom: '1.5rem' }}>
            <span style={{ color: '#0f172a' }}>{roleRevealed ? "Palabra/Impostor" : "Toca la carta para revelar"}</span>
          </div>
          <div>
            <button className="btn-start-gray" onClick={handleNextReveal}>Siguiente</button>
          </div>
        </div>
      </main>
    );
  }

  // ======================
  // VISTA 3: EXPULSIÓN (Captura 3)
  // ======================
  if (expelledThisRound && lastExpelled) {
    const expelledImage = lastExpelledRole === "Impostor" ? "/impostor.png" : lastExpelledRole === "Undercover" ? "/undercover.png" : "/civilician.png";
    
    return (
      <main className="game-page">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <img src="/logotipoimpostorcivillian.png" alt="logo" className="hero-logo" style={{ maxWidth: 100 }} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="inner-box" style={{ display: 'inline-block', padding: '0.75rem 1.5rem' }}>
            <strong style={{ color: '#0f172a' }}>{lastExpelled} Expulsado</strong>
          </div>
        </div>

        <div className="role-card" style={{ marginBottom: '2rem' }}>
          <img src={expelledImage} alt={String(lastExpelledRole)} />
          <div className="role-card-label">
            {lastExpelledRole === "Impostor" ? "IMPOSTOR" : "CIVILIAN"}
          </div>
        </div>

        {/* Menú lateral con info de ganadores */}
        <div className="side-menu">
          <p><strong>Civilian Ganadores/</strong></p>
          <p><strong>Impostores Ganadores/Undercovers Ganadores/</strong></p>
          <p><strong>Seguir Jugando/ Reiniciar</strong></p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          {!winner && (
            <button className="btn-start-gray" onClick={continueAfterExpel} style={{ marginBottom: '1rem', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}>
              Seguir jugando
            </button>
          )}
          <button className="btn-start-gray" onClick={handleRestart} style={{ marginBottom: '1rem', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}>
            Reiniciar
          </button>
          <button className="btn-start-gray" onClick={handleModifyPlayers} style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto' }}>
            Modificar jugadores
          </button>
        </div>
      </main>
    );
  }

  // ======================
  // VISTA 2: JUEGO PRINCIPAL - GRID INCOGNITO (Captura 2)
  // ======================
  const alivePlayers = playersState.filter(p => p.alive);

  return (
    <main className="game-page">
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <img src="/logotipoimpostorcivillian.png" alt="logo" className="hero-logo" style={{ maxWidth: 100 }} />
      </div>

      {winner ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="inner-box" style={{ display: 'inline-block', padding: '1rem 2rem', marginBottom: '2rem' }}>
            <h3 style={{ color: '#0f172a', margin: 0 }}>Victoria: {winner}</h3>
            {winner === "Civilians" && winningWord && (
              <p style={{ color: '#0f172a', margin: '0.5rem 0 0' }}>La palabra era: <strong>{winningWord}</strong></p>
            )}
          </div>
          <div>
            <button className="btn-start-gray" onClick={handleRestart} style={{ marginBottom: '1rem', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}>
              Reiniciar
            </button>
            <button className="btn-start-gray" onClick={handleModifyPlayers} style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto' }}>
              Modificar jugadores
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="player-grid">
            {alivePlayers.map((p, idx) => {
              const actualIdx = playersState.findIndex(pl => pl.name === p.name);
              return (
                <div 
                  key={p.name} 
                  className="player-card"
                  onClick={() => expelMode && handleExpel(actualIdx)}
                  style={{ cursor: expelMode ? 'pointer' : 'default', opacity: expelMode ? 1 : 0.9 }}
                >
                  <img src="/incognito.png" alt="Incognito" />
                  <div className="player-card-name">{p.name}</div>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button 
              className="btn-start-gray" 
              onClick={() => setExpelMode(v => !v)}
            >
              {expelMode ? "Cancelar" : "Expulsar"}
            </button>
          </div>
        </>
      )}
    </main>
  );
}
