'use client';

import React, { useState, useEffect, useRef } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

type Point = { x: number; y: number };

const Snake: React.FC = () => {
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Point>({ x: 1, y: 0 }); // Initial direction right
  const directionRef = useRef<Point>({ x: 1, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const generateFood = () => {
    return {
      x: Math.floor(Math.random() * (GRID_SIZE - 2)) + 1,
      y: Math.floor(Math.random() * (GRID_SIZE - 2)) + 1
    };
  };

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(generateFood());
    setDirection({ x: 1, y: 0 });
    directionRef.current = { x: 1, y: 0 };
    setGameOver(false);
    setScore(0);
    setSpeed(INITIAL_SPEED);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent reversing direction directly
      const currentDir = directionRef.current;
      switch (e.key) {
        case 'ArrowUp': 
          if (currentDir.y === 0) setDirection({ x: 0, y: -1 }); 
          break;
        case 'ArrowDown': 
          if (currentDir.y === 0) setDirection({ x: 0, y: 1 }); 
          break;
        case 'ArrowLeft': 
          if (currentDir.x === 0) setDirection({ x: -1, y: 0 }); 
          break;
        case 'ArrowRight': 
          if (currentDir.x === 0) setDirection({ x: 1, y: 0 }); 
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // Empty dependency array - listener doesn't need to change

  const foodRef = useRef(food);
  
  useEffect(() => {
    foodRef.current = food;
  }, [food]);

  useEffect(() => {
    if (gameOver) return;

    const gameLoop = setInterval(() => {
      setSnake(prevSnake => {
        const currentDir = directionRef.current;
        const newHead = { x: prevSnake[0].x + currentDir.x, y: prevSnake[0].y + currentDir.y };

        // Wall collision
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          setGameOver(true);
          return prevSnake;
        }

        // Self collision
        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];
        const currentFood = foodRef.current;

        // Food collision
        if (newHead.x === currentFood.x && newHead.y === currentFood.y) {
          setScore(s => s + 10);
          setFood(generateFood());
          setSpeed(s => Math.max(50, s - 2));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, speed);

    return () => clearInterval(gameLoop);
  }, [gameOver, speed]);


  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white p-4">
      <div className="mb-4 text-xl font-bold">Score: {score}</div>
      
      <div 
        className="relative bg-gray-800 border-2 border-gray-600 shadow-lg"
        style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}
      >
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
            <h2 className="text-3xl font-bold text-red-500 mb-4">Game Over</h2>
            <button 
              onClick={resetGame}
              className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded text-white font-bold transition-colors"
            >
              Play Again
            </button>
          </div>
        )}

        {/* Snake */}
        {snake.map((segment, i) => (
          <div
            key={i}
            className="absolute bg-green-500 rounded-sm"
            style={{
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              opacity: i === 0 ? 1 : 0.8
            }}
          />
        ))}

        {/* Food */}
        <div
          className="absolute bg-red-500 rounded-full shadow-[0_0_10px_red]"
          style={{
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
            width: CELL_SIZE - 2,
            height: CELL_SIZE - 2
          }}
        />
      </div>
      
      <div className="mt-4 text-gray-400 text-sm">
        Use Arrow Keys to Move
      </div>
    </div>
  );
};

export default Snake;
