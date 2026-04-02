import React from "react";
import "./GameDashboard.css";

const games = [
  { id: 1, name: "Eye Movement Space Shooter", url: "http://127.0.0.1:3001/hacknight-2.0/frontend/src/components/Games/SpaceShooter/index.html" },
  { id: 2, name: "Eye Movement Aviator", url: "http://localhost:8123/" },
  { id: 3, name: "Eye Movement VR World", url: "http://127.0.0.1:3001/hacknight-2.0/frontend/src/components/Games/VRWORLD/index.html" },
];

const GameDashboard = () => {
  return (
    <div className="game-dashboard">
      <h1 className="title">Game Library</h1>
      <div className="game-list">
        {games.map((game) => (
          <a key={game.id} href={game.url} target="_blank" rel="noopener noreferrer" className="game-button">
            {game.name}
          </a>
        ))}
      </div>
    </div>
  );
};

export default GameDashboard;
