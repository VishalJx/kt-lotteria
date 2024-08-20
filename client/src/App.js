import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Grid from './components/Grid';

function App() {
  const [user1Grid, setUser1Grid] = useState(Array(9).fill(''));
  const [user2Grid, setUser2Grid] = useState(Array(9).fill(''));
  const [gameStarted, setGameStarted] = useState(false);
  const [winner, setWinner] = useState(null);
  const [currentNumber, setCurrentNumber] = useState(null);

  useEffect(() => {
    if (gameStarted) {
      const socket = new WebSocket('ws://localhost:8000');
  
      socket.onopen = () => {
        console.log('WebSocket connection opened');
      };
  
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setWinner(data.winner);
      };
  
      socket.onclose = () => {
        console.log('WebSocket connection closed');
      };
  
      return () => {
        socket.close();
      };
    }
  }, [gameStarted]);

  const startGame = async () => {
    try {
      await axios.post('/start-game', {
        user1Grid,
        user2Grid
      });
      setGameStarted(true);
      generateRandomNumber();
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const generateRandomNumber = () => {
    const newNumber = Math.floor(Math.random() * 9) + 1;
    setCurrentNumber(newNumber);
    axios.post('/cut-number', { number: newNumber });
  };

  return (
    <div className="h-[100vh] bg-gray-100 py-1 flex flex-col justify-center sm:py-8">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Number Cutting Game</h1>
          {!gameStarted ? (
            <div>
              <div>
                <h2 className="text-xl font-semibold mb-3 text-gray-700">User 1 Grid</h2>
                <Grid grid={user1Grid} setGrid={setUser1Grid} />
              </div>
              <div className='mb-5'>
                <h2 className="text-xl font-semibold mb-3 pt-5 text-gray-700">User 2 Grid</h2>
                <Grid grid={user2Grid} setGrid={setUser2Grid} />
              </div>
              <button 
                onClick={startGame}
                className="w-full py-3 px-6 text-white rounded-lg bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200"
              >
                Start Game
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-700">Game in progress</h2>
              <p className="text-xl text-gray-600">Current number: <span className="font-bold text-blue-600">{currentNumber}</span></p>
              <button 
                onClick={generateRandomNumber}
                className="w-full py-3 px-6 text-white rounded-lg bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors duration-200"
              >
                Generate Next Number
              </button>
            </div>
          )}
          {winner && (
            <div className="mt-8 p-4 bg-yellow-100 rounded-lg">
              <h2 className="text-2xl font-bold text-yellow-800">{winner} wins!</h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;