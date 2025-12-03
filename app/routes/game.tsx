import React, { useEffect, useState } from "react";

// Flujo implementado:
// 1) Se asignan roles y palabras (pares) y se mezclan con los nombres.
// 2) Se muestra a cada jugador su palabra/rol uno a uno (botón "Siguiente").
// 3) Al terminar la ronda de revelado aparece la vista de juego con botón "Expulsar".
// 4) Al expulsar se calcula el ganador: si no quedan undercovers/impostores ganan civiles;
//    si undercovers+impostors >= civilians gana el bando de los "malos".
// 5) Se muestra mensaje de victoria y botones: "Reiniciar" y "Modificar jugadores".

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

  // Build roles array and shuffle
  const roles: string[] = [];
  for (let i = 0; i < impostors; i++) roles.push("Impostor");
  for (let i = 0; i < undercovers; i++) roles.push("Undercover");
  for (let i = 0; i < civilians; i++) roles.push("Civilian");
  while (roles.length < totalPlayers) roles.push("Civilian");
  const shuffledRoles = shuffle(roles);

  // choose a single civilian word for everyone and build players; make this regenerable
  const [civilianWord, setCivilianWord] = useState(() => WORD_PAIRS[Math.floor(Math.random() * WORD_PAIRS.length)]);

  function generatePlayers(word: string) {
    const rolesLocal = roles.slice();
    const shuffledRolesLocal = shuffle(rolesLocal);
    // shuffle names order too so order changes on restart
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

  useEffect(() => {
    if (winner === "Civilians" && winningWord) {
      // show the winning word briefly then restart
      const t = setTimeout(() => {
        handleRestart();
      }, 2200);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [winner, winningWord]);

  const handleNextReveal = () => {
    if (revealIndex + 1 >= playersState.length) setRevealingDone(true);
    else setRevealIndex((i) => i + 1);
  };

  const handleExpel = (idx: number) => {
    const copy = playersState.slice();
    const expelledPlayer = { ...copy[idx] };
    copy[idx] = { ...copy[idx], alive: false };
    setPlayersState(copy);
    setLastExpelled(expelledPlayer.name);
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

  const handleRestart = () => {
    if (!isBrowser) return;
    // pick a different word if possible
    let newWord = WORD_PAIRS[Math.floor(Math.random() * WORD_PAIRS.length)];
    if (WORD_PAIRS.length > 1) {
      while (newWord === civilianWord) {
        newWord = WORD_PAIRS[Math.floor(Math.random() * WORD_PAIRS.length)];
      }
    }
    setCivilianWord(newWord);
    // regenerate players with new word and reshuffled roles
    setPlayersState(generatePlayers(newWord));
    setRevealIndex(0);
    setRevealingDone(false);
    setExpelMode(false);
    setWinner(null);
    setLastExpelled(null);
    setExpelledThisRound(false);
    setWinningWord(null);
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

  // Reveal view
  if (!revealingDone) {
    const p = playersState[revealIndex];
    return (
      <main className="app-container">
        <div className="card text-center">
          <h2 className="title">Turno de {p.name}</h2>
          {p.role === "Impostor" ? (
            <p className="mt-3">Rol: <strong>Impostor</strong></p>
          ) : (
            <p className="mt-3">Palabra: <em>{p.word}</em></p>
          )}
          <div className="mt-6">
            <button className="btn" onClick={handleNextReveal}>Siguiente</button>
            {revealIndex + 1 >= playersState.length && (
              <button className="btn-ghost" onClick={() => setRevealingDone(true)} style={{ marginLeft: 8 }}>Terminar revelados</button>
            )}
          </div>
        </div>
      </main>
    );
  }

  // Main game view
  return (
    <main className="app-container">
      <div className="card">
        <h2 className="title">Partida</h2>
        {winner ? (
          <div className="mt-4">
            <h3 className="text-xl">Victoria: {winner}</h3>
            {winner === "Civilians" && winningWord && (
              <p className="muted mt-2">La palabra era: <strong>{winningWord}</strong></p>
            )}
            <div className="mt-3 row">
              <button className="btn" onClick={handleRestart}>Reiniciar</button>
              <button className="btn-ghost" onClick={handleModifyPlayers}>Modificar jugadores</button>
            </div>
          </div>
        ) : (
          <>
            {expelledThisRound && lastExpelled && (
              <div className="p-3 mb-4 rounded bg-gray-100">
                <strong>{lastExpelled} expulsado</strong>
                <div className="mt-2">
                  <button className="btn" onClick={() => { setExpelledThisRound(false); setLastExpelled(null); setExpelMode(false); }}>Siguiente</button>
                </div>
              </div>
            )}
            <div className="mt-4 row">
              <button className="btn" onClick={() => setExpelMode((v) => !v)}>{expelMode ? "Cancelar expulsión" : "Expulsar"}</button>
            </div>

            <ul className="mt-4 space-y-3">
              {playersState.map((p, idx) => (
                <li key={p.name} className={`p-4 rounded-lg border ${!p.alive ? "opacity-50" : ""}`}>
                  <div className="row" style={{ justifyContent: "space-between" }}>
                    <div>
                      <strong className="text-lg">{p.name}</strong>
                      <div className="muted">{p.alive ? "Vivo" : "Expulsado"}</div>
                    </div>
                    {expelMode && p.alive && (
                      <button className="btn-ghost" onClick={() => handleExpel(idx)}>Expulsar</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </main>
  );
}