import React from "react";

export default function Home() {
  return (
    <main className="app-container">
      <div className="hero-card mx-auto max-w-md">
        <div className="mb-6">
          <img src="/logotipoimpostorcivillian.png" alt="Undercover logo" className="hero-logo" />
        </div>

        <div className="mt-4">
          <a href="/setup" className="inline-block">
            <button className="btn-start-gray">Start Game</button>
          </a>
        </div>
      </div>
    </main>
  );
}
