import React from "react";
import { motion } from "framer-motion";

interface FieldPreviewProps {
  rows: number;
  cols: number;
  size: number;
  onClick: () => void;
}

const FieldPreview: React.FC<FieldPreviewProps> = ({
  rows,
  cols,
  size,
  onClick,
}) => {
  const cellSize = Math.floor(size / Math.max(rows, cols));
  const fieldWidth = cols * cellSize;
  const fieldHeight = rows * cellSize;
  const goalWidth = cellSize;
  const goalHeight = Math.floor(rows / 3) * cellSize;

  const pulseAnimation = {
    scale: [1, 1.02, 1],
    boxShadow: [
      "0 4px 6px rgba(0, 0, 0, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.2)",
      "0 6px 8px rgba(0, 0, 0, 0.2), inset 0 0 30px rgba(255, 255, 255, 0.4)",
      "0 4px 6px rgba(0, 0, 0, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.2)",
    ],
  };

  const pointAnimation = {
    scale: [1, 1.2, 1],
    opacity: [0.5, 1, 0.5],
  };

  return (
    <motion.div
      onClick={onClick}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "10px",
        cursor: "pointer",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "10px",
        boxShadow:
          "0 4px 6px rgba(0, 0, 0, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.2)",
        position: "relative",
        overflow: "hidden",
        background: "rgba(0, 0, 0, 0.5)",
      }}
      whileHover={{
        scale: 1.05,
        boxShadow:
          "0 6px 8px rgba(0, 0, 0, 0.2), inset 0 0 30px rgba(255, 255, 255, 0.3)",
      }}
      animate={pulseAnimation}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <motion.div
        style={{
          width: `${fieldWidth}px`,
          height: `${fieldHeight}px`,
          border: "2px solid rgba(255, 255, 255, 0.7)",
          borderRadius: "5px",
          position: "relative",
        }}
        animate={{
          borderColor: [
            "rgba(255, 255, 255, 0.7)",
            "rgba(255, 255, 255, 1)",
            "rgba(255, 255, 255, 0.7)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Középvonal */}
        <motion.div
          style={{
            position: "absolute",
            left: "50%",
            top: "0",
            bottom: "0",
            width: "1px",
            background: "rgba(255, 255, 255, 0.7)",
          }}
          animate={{
            backgroundColor: [
              "rgba(255, 255, 255, 0.7)",
              "rgba(255, 255, 255, 1)",
              "rgba(255, 255, 255, 0.7)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Bal kapu */}
        <motion.div
          style={{
            position: "absolute",
            left: "-2px",
            top: `${(fieldHeight - goalHeight) / 2}px`,
            width: `${goalWidth}px`,
            height: `${goalHeight}px`,
            border: "2px solid rgba(255, 255, 255, 0.7)",
            borderLeft: "none",
          }}
          animate={{
            borderColor: [
              "rgba(255, 255, 255, 0.7)",
              "rgba(255, 255, 255, 1)",
              "rgba(255, 255, 255, 0.7)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Jobb kapu */}
        <motion.div
          style={{
            position: "absolute",
            right: "-2px",
            top: `${(fieldHeight - goalHeight) / 2}px`,
            width: `${goalWidth}px`,
            height: `${goalHeight}px`,
            border: "2px solid rgba(255, 255, 255, 0.7)",
            borderRight: "none",
          }}
          animate={{
            borderColor: [
              "rgba(255, 255, 255, 0.7)",
              "rgba(255, 255, 255, 1)",
              "rgba(255, 255, 255, 0.7)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Pontok */}
        {Array.from({ length: rows * cols }).map((_, index) => {
          const x = index % cols;
          const y = Math.floor(index / cols);
          return (
            <motion.div
              key={index}
              style={{
                position: "absolute",
                left: `${x * cellSize}px`,
                top: `${y * cellSize}px`,
                width: `${cellSize * 0.2}px`,
                height: `${cellSize * 0.2}px`,
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.7)",
                transform: "translate(-50%, -50%)",
              }}
              animate={pointAnimation}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 2, // Random delay for each point
              }}
            />
          );
        })}
      </motion.div>

      {/* Méret jelzés */}
      <motion.div
        style={{
          position: "absolute",
          top: "5px",
          left: "5px",
          fontSize: "12px",
          color: "rgba(255, 255, 255, 0.7)",
          background: "rgba(0, 0, 0, 0.5)",
          padding: "2px 5px",
          borderRadius: "3px",
        }}
        animate={{
          color: [
            "rgba(255, 255, 255, 0.7)",
            "rgba(255, 255, 255, 1)",
            "rgba(255, 255, 255, 0.7)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {rows}x{cols}
      </motion.div>
    </motion.div>
  );
};

export default FieldPreview;
