import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import FieldPreview from "./FieldPreview";

interface Position {
  x: number;
  y: number;
}

interface Line {
  start: Position;
  end: Position;
  player: number;
}

interface Scores {
  player1: number;
  player2: number;
}

interface FieldSize {
  rows: number;
  cols: number;
}

const PaperSoccerGame: React.FC = () => {
  const [rows, setRows] = useState<number>(9);
  const [cols, setCols] = useState<number>(13);
  const [cellSize, setCellSize] = useState<number>(40);
  const [pointSize, setPointSize] = useState<number>(12);
  const [padding, setPadding] = useState<number>(20);
  const [gameMode, setGameMode] = useState<"player" | "ai">("player");
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "medium">("medium");
  const [scores, setScores] = useState<Scores>({ player1: 0, player2: 0 });

  const [lines, setLines] = useState<Line[]>([]);
  const [ballPosition, setBallPosition] = useState<Position>({ x: 0, y: 0 });
  const [currentPlayer, setCurrentPlayer] = useState<number>(1);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<number | null>(null);
  const [visitedPoints, setVisitedPoints] = useState<Record<string, boolean>>(
    {}
  );
  const [isResizing, setIsResizing] = useState<boolean>(false);

  const fieldSizes: FieldSize[] = [
    { rows: 7, cols: 11 },
    { rows: 9, cols: 13 },
    { rows: 11, cols: 15 },
    { rows: 13, cols: 17 },
  ];

  let currentSizeIndex = fieldSizes.findIndex(
    (size) => size.rows === rows && size.cols === cols
  );

  useEffect(() => {
    initializeGame();
  }, [rows, cols, gameMode]);

  useEffect(() => {
    if (gameMode === "ai" && currentPlayer === 2 && !gameOver) {
      const timer = setTimeout(() => makeAIMove(), 500);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, gameMode, gameOver, ballPosition]);

  const initializeGame = (): void => {
    initializeLines();
    const startX = Math.floor(cols / 2);
    const startY = Math.floor(rows / 2);
    setBallPosition({ x: startX, y: startY });
    setVisitedPoints({ [`${startX}-${startY}`]: true });
    setCurrentPlayer(1);
    setGameOver(false);
    setWinner(null);
  };

  const initializeLines = (): void => {
    const newLines: Line[] = [];
    for (let i = 0; i < rows; i++) {
      if (i < Math.floor(rows / 3) || i > Math.floor((2 * rows) / 3)) {
        newLines.push({
          start: { x: 0, y: i },
          end: { x: 0, y: i + 1 },
          player: 0,
        });
        newLines.push({
          start: { x: cols, y: i },
          end: { x: cols, y: i + 1 },
          player: 0,
        });
      }
    }
    for (let j = 0; j < cols; j++) {
      newLines.push({
        start: { x: j, y: 0 },
        end: { x: j + 1, y: 0 },
        player: 0,
      });
      newLines.push({
        start: { x: j, y: rows },
        end: { x: j + 1, y: rows },
        player: 0,
      });
    }
    setLines(newLines);
  };

  const handlePointClick = (x: number, y: number): void => {
    if (gameOver || (gameMode === "ai" && currentPlayer === 2)) return;
    makeMove(x, y);
  };

  const startNewGame = (): void => {
    initializeGame();
  };

  const makeMove = (x: number, y: number): boolean => {
    if (isValidMove(x, y)) {
      const newLines: Line[] = [
        ...lines,
        { start: ballPosition, end: { x, y }, player: currentPlayer },
      ];
      setLines(newLines);
      const newBallPosition: Position = { x, y };
      setBallPosition(newBallPosition);

      const pointKey = `${x}-${y}`;
      const newVisitedPoints = { ...visitedPoints, [pointKey]: true };
      setVisitedPoints(newVisitedPoints);

      if (checkWin(x, y)) {
        setGameOver(true);
        setWinner(currentPlayer);
        triggerConfetti();
        if (
          currentPlayer === 2 &&
          x === 0 &&
          y >= Math.floor(rows / 3) &&
          y <= Math.floor((2 * rows) / 3)
        ) {
          setScores((prev) => ({ ...prev, player2: prev.player2 + 1 }));
          return true;
        }
        if (
          currentPlayer === 1 &&
          x === cols &&
          y >= Math.floor(rows / 3) &&
          y <= Math.floor((2 * rows) / 3)
        ) {
          setScores((prev) => ({ ...prev, player1: prev.player1 + 1 }));
          return true;
        }
      } else {
        const playerGetsExtraTurn = visitedPoints[pointKey];
        if (!playerGetsExtraTurn) {
          switchPlayer();
        } else {
          // Force a re-render to trigger the AI move effect if it's AI's turn
          if (gameMode === "ai" && currentPlayer === 2) {
            setTimeout(() => setBallPosition({ ...newBallPosition }), 0);
          }
        }
      }
      return true;
    }
    return false;
  };

  const switchPlayer = (): void => {
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
  };

  const makeAIMove = (): void => {
    const availableMoves = getAvailableMoves();
    let selectedMove: Position | undefined;

    if (availableMoves.length > 0) {
      if (aiDifficulty === "medium") {
        // Medium AI: Mix of strategic moves and some randomness
        if (Math.random() < 0.8) {
          // 80% chance of making a strategic move
          selectedMove = getBestMove(availableMoves);
        } else {
          // 20% chance of making a random move
          selectedMove =
            availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }
      } else {
        // Easy AI: Mostly random moves with a small chance of strategic move
        if (Math.random() < 0.2) {
          // 20% chance of making a strategic move
          selectedMove = getBestMove(availableMoves);
        } else {
          // 80% chance of making a random move
          selectedMove =
            availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }
      }

      if (selectedMove) {
        makeMove(selectedMove.x, selectedMove.y);
      }
    } else {
      // No available moves, switch to the other player
      switchPlayer();
    }
  };

  const getAvailableMoves = (): Position[] => {
    const moves: Position[] = [];
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const newX = ballPosition.x + dx;
        const newY = ballPosition.y + dy;
        if (isValidMove(newX, newY)) {
          moves.push({ x: newX, y: newY });
        }
      }
    }
    return moves;
  };

  const getBestMove = (availableMoves: Position[]): Position => {
    return (
      availableMoves.reduce(
        (best: (Position & { score: number }) | null, move) => {
          const distanceToGoal = Math.abs(
            move.x - (currentPlayer === 1 ? cols : 0)
          );
          const movesAfter = getAvailableMoves().length;
          const score = distanceToGoal * 2 + movesAfter;

          if (!best || score < best.score) {
            return { ...move, score };
          }
          return best;
        },
        null
      ) || availableMoves[0]
    );
  };

  const renderGameModeSelection = () => (
    <div
      style={{
        marginBottom: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <h2
        style={{ color: "#ffffff", textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}
      >
        Select Game Mode
      </h2>
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={() => setGameMode("player")}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            fontWeight: "bold",
            color: "#ffffff",
            backgroundColor:
              gameMode === "player" ? "#3498db" : "rgba(52, 152, 219, 0.7)",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          Player vs Player
        </button>
        <button
          onClick={() => setGameMode("ai")}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            fontWeight: "bold",
            color: "#ffffff",
            backgroundColor:
              gameMode === "ai" ? "#2ecc71" : "rgba(46, 204, 113, 0.7)",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          Player vs AI
        </button>
      </div>
      {gameMode === "ai" && (
        <div>
          <h3
            style={{
              color: "#ffffff",
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            AI Difficulty
          </h3>
          <select
            value={aiDifficulty}
            onChange={(e) =>
              setAiDifficulty(e.target.value as "medium" | "easy")
            }
            style={{
              padding: "5px 10px",
              fontSize: "14px",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              color: "#ffffff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
          </select>
        </div>
      )}
    </div>
  );

  const renderScoreBoard = () => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        maxWidth: "400px",
        marginBottom: "20px",
        padding: "10px",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        borderRadius: "10px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div style={{ fontSize: "24px", fontWeight: "bold", color: "#ffffff" }}>
        {scores.player1} - {scores.player2}
      </div>
      <button
        onClick={startNewGame}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          fontWeight: "bold",
          color: "#ffffff",
          backgroundColor: "#e74c3c",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          transition: "all 0.3s ease",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        New Game
      </button>
    </div>
  );

  const isValidMove = (x: number, y: number): boolean => {
    // Check if the move is within the field boundaries
    if (x < 0 || x > cols || y < 0 || y > rows) return false;

    // Check if the move is only one step away
    if (Math.abs(x - ballPosition.x) > 1 || Math.abs(y - ballPosition.y) > 1)
      return false;
    if (x === ballPosition.x && y === ballPosition.y) return false;

    // Check if the line already exists
    const lineExists = lines.some(
      (line) =>
        (line.start.x === ballPosition.x &&
          line.start.y === ballPosition.y &&
          line.end.x === x &&
          line.end.y === y) ||
        (line.end.x === ballPosition.x &&
          line.end.y === ballPosition.y &&
          line.start.x === x &&
          line.start.y === y)
    );

    // Check if the move is along the edge of the field
    const isEdgeMove =
      ((x === 0 || x === cols) && y >= 0 && y <= rows) ||
      ((y === 0 || y === rows) && x >= 0 && x <= cols);

    // The move is valid if it's not an existing line and either it's not on the edge or it's within the goal area
    return (
      !lineExists &&
      (!isEdgeMove ||
        ((x === 0 || x === cols) &&
          y > Math.floor(rows / 3) &&
          y < Math.floor((2 * rows) / 3)))
    );
  };

  const checkWin = (x: number, y: number): boolean => {
    // Bal oldali kapu (2. játékos)
    if (
      currentPlayer === 2 &&
      x === 0 &&
      y >= Math.floor(rows / 3) &&
      y <= Math.floor((2 * rows) / 3)
    )
      return true;
    // Jobb oldali kapu (1. játékos)
    if (
      currentPlayer === 1 &&
      x === cols &&
      y >= Math.floor(rows / 3) &&
      y <= Math.floor((2 * rows) / 3)
    )
      return true;

    // Kapu alján lévő vonal érintése
    if (
      currentPlayer === 1 &&
      x === cols - 1 &&
      y === Math.floor((2 * rows) / 3) + 1
    )
      return true;
    if (currentPlayer === 2 && x === 1 && y === Math.floor((2 * rows) / 3) + 1)
      return true;

    return false;
  };

  const renderBackground = () => (
    <motion.div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "linear-gradient(45deg, #1a2a6c, #b21f1f, #fdbb2d)",
        backgroundSize: "400% 400%",
        zIndex: -1,
      }}
      animate={{
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );

  const renderPoints = () => {
    const points = [];
    for (let y = 0; y <= rows; y++) {
      for (let x = 0; x <= cols; x++) {
        points.push(
          <motion.div
            key={`${x}-${y}`}
            style={{
              position: "absolute",
              left: `${padding + x * cellSize - pointSize / 2}px`,
              top: `${padding + y * cellSize - pointSize / 2}px`,
              width: `${pointSize}px`,
              height: `${pointSize}px`,
              borderRadius: "50%",
              background:
                x === ballPosition.x && y === ballPosition.y
                  ? "#FFD700"
                  : visitedPoints[`${x}-${y}`]
                  ? "#FF69B4"
                  : "rgba(255, 255, 255, 0.5)",
              cursor: "pointer",
              zIndex: 2,
              boxShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
            }}
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handlePointClick(x, y)}
          />
        );
      }
    }
    return points;
  };

  const renderLines = () => {
    return lines.map((line, index) => (
      <motion.line
        key={index}
        x1={padding + line.start.x * cellSize}
        y1={padding + line.start.y * cellSize}
        x2={padding + line.end.x * cellSize}
        y2={padding + line.end.y * cellSize}
        stroke={
          line.player === 1
            ? "#3498db"
            : line.player === 2
            ? "#2ecc71"
            : "rgba(255, 255, 255, 0.3)"
        }
        strokeWidth="3"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5 }}
        style={{ filter: "drop-shadow(0 0 2px rgba(255, 255, 255, 0.5))" }}
      />
    ));
  };

  const renderGoals = () => {
    const goalWidth = cellSize;
    const goalHeight = Math.floor(rows / 3) * cellSize;
    const goalDepth = cellSize / 2;
    const cornerRadius = 5;

    return (
      <>
        {/* Bal oldali kapu */}
        <g>
          <path
            d={`
              M ${padding} ${padding + Math.floor(rows / 3) * cellSize}
              L ${padding} ${padding + Math.floor((2 * rows) / 3) * cellSize}
              L ${padding + goalDepth} ${
              padding + Math.floor((2 * rows) / 3) * cellSize + goalDepth
            }
              L ${padding + goalDepth} ${
              padding + Math.floor(rows / 3) * cellSize - goalDepth
            }
              Z
            `}
            fill="#2c3e50"
            stroke="#3498db"
            strokeWidth="2"
          />
          <rect
            x={padding}
            y={padding + Math.floor(rows / 3) * cellSize}
            width={goalWidth}
            height={goalHeight}
            fill="none"
            stroke="#3498db"
            strokeWidth="4"
            rx={cornerRadius}
            ry={cornerRadius}
          />
        </g>

        {/* Jobb oldali kapu */}
        <g>
          <path
            d={`
              M ${padding + cols * cellSize} ${
              padding + Math.floor(rows / 3) * cellSize
            }
              L ${padding + cols * cellSize} ${
              padding + Math.floor((2 * rows) / 3) * cellSize
            }
              L ${padding + cols * cellSize - goalDepth} ${
              padding + Math.floor((2 * rows) / 3) * cellSize + goalDepth
            }
              L ${padding + cols * cellSize - goalDepth} ${
              padding + Math.floor(rows / 3) * cellSize - goalDepth
            }
              Z
            `}
            fill="#2c3e50"
            stroke="#2ecc71"
            strokeWidth="2"
          />
          <rect
            x={padding + cols * cellSize - goalWidth}
            y={padding + Math.floor(rows / 3) * cellSize}
            width={goalWidth}
            height={goalHeight}
            fill="none"
            stroke="#2ecc71"
            strokeWidth="4"
            rx={cornerRadius}
            ry={cornerRadius}
          />
        </g>
      </>
    );
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleResize = (direction: number): void => {
    if (isResizing) return;

    let newIndex = currentSizeIndex + direction;
    if (newIndex < 0) newIndex = fieldSizes.length - 1;
    if (newIndex >= fieldSizes.length) newIndex = 0;

    setIsResizing(true);

    // Animáció a pálya eltűnéséhez
    const field: HTMLDivElement = document.querySelector(
      ".game-field"
    ) as HTMLDivElement;
    field.style.transition = "opacity 0.5s, transform 0.5s";
    field.style.opacity = "0";
    field.style.transform = `scale(${direction > 0 ? 1.1 : 0.9})`;

    setTimeout(() => {
      setRows(fieldSizes[newIndex].rows);
      setCols(fieldSizes[newIndex].cols);
      currentSizeIndex = newIndex;

      // Pálya újrainicializálása
      initializeGame();

      // Animáció a pálya megjelenéséhez
      setTimeout(() => {
        field.style.opacity = "1";
        field.style.transform = "scale(1)";
        setIsResizing(false);
      }, 50);
    }, 500);
  };

  const renderResizeButtons = () => {
    const prevIndex =
      (currentSizeIndex - 1 + fieldSizes.length) % fieldSizes.length;
    const nextIndex = (currentSizeIndex + 1) % fieldSizes.length;
    const previewSize = 300; // Növeltük az előnézet méretét

    return (
      <>
        <div
          style={{
            position: "absolute",
            left: `-${previewSize + 60}px`,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <FieldPreview
            rows={fieldSizes[prevIndex].rows}
            cols={fieldSizes[prevIndex].cols}
            size={previewSize}
            onClick={() => handleResize(-1)}
          />
        </div>
        <div
          style={{
            position: "absolute",
            right: `-${previewSize + 60}px`,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <FieldPreview
            rows={fieldSizes[nextIndex].rows}
            cols={fieldSizes[nextIndex].cols}
            size={previewSize}
            onClick={() => handleResize(1)}
          />
        </div>
      </>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontFamily: "'Roboto', sans-serif",
        color: "#ffffff",
        padding: "20px",
        boxSizing: "border-box",
        width: "100%",
        overflow: "hidden",
        background: "linear-gradient(45deg, #1a2a6c, #b21f1f, #fdbb2d)",
      }}
    >
      {renderScoreBoard()}
      {renderGameModeSelection()}
      <div
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {renderResizeButtons()}
        <div
          className="game-field"
          style={{
            position: "relative",
            width: `${cols * cellSize + 2 * padding}px`,
            height: `${rows * cellSize + 2 * padding}px`,
            background: "rgba(0, 0, 0, 0.5)",
            borderRadius: "20px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
            overflow: "hidden",
          }}
        >
          <svg
            width="100%"
            height="100%"
            style={{ position: "absolute", top: 0, left: 0 }}
          >
            {renderLines()}
            {renderGoals()}
          </svg>
          {renderPoints()}
        </div>
      </div>

      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{
              marginTop: "20px",
              fontSize: "32px",
              fontWeight: "bold",
              color: winner === 1 ? "#3498db" : "#2ecc71",
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              background: "rgba(0, 0, 0, 0.5)",
              padding: "10px 20px",
              borderRadius: "10px",
            }}
          >
            Játék vége! {winner === 1 ? "Kék" : "Zöld"} játékos nyert!
          </motion.div>
        )}
      </AnimatePresence>
      {!gameOver && (
        <motion.div
          style={{
            marginTop: "20px",
            fontSize: "24px",
            textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
            background: "rgba(0, 0, 0, 0.5)",
            padding: "10px 20px",
            borderRadius: "10px",
          }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          Jelenlegi játékos:
          <span
            style={{
              fontWeight: "bold",
              color: currentPlayer === 1 ? "#3498db" : "#2ecc71",
              marginLeft: "10px",
            }}
          >
            {currentPlayer === 1
              ? "Kék"
              : gameMode === "ai"
              ? "AI (Zöld)"
              : "Zöld"}
          </span>
        </motion.div>
      )}
    </div>
  );
};

export default PaperSoccerGame;
