import React from 'react';

function Grid({ grid, setGrid }) {

  const handleInputChange = (index, value) => {
    const newValue = value === '' ? '' : Math.max(1, Math.min(9, parseInt(value) || 0));
    
    if (newValue !== '' && grid.includes(newValue.toString())) {
      return;
    }

    const newGrid = [...grid];
    newGrid[index] = newValue.toString();
    setGrid(newGrid);
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '10px',
      width: '300px',
      margin: '0 auto'
    }}>
      {grid.map((value, index) => (
        <input
          key={index}
          type="number"
          value={value}
          onChange={(e) => handleInputChange(index, e.target.value)}
          style={{
            width: '70%',
            height: '60px',
            fontSize: '24px',
            textAlign: 'center'
          }}
          className='border border-gray-300 rounded-md outline-none'
          min="1"
          max="9"
        />
      ))}
    </div>
  );
}

export default Grid;