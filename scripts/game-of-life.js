$(document).ready(function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
  
    let cellSize = 10;
    let rows, cols;
    let grid;
    let historyGrid = [];
  
    function setup() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      rows = Math.floor(canvas.height / cellSize);
      cols = Math.floor(canvas.width / cellSize);
  
      grid = new Array(cols).fill(null).map(() => new Array(rows).fill(false));
  
      canvas.addEventListener('click', handleClick);

      randomizeGrid();
      draw();
      setInterval(update, 100);
    }

    function handleClick(event) {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const cellX = Math.floor(mouseX / cellSize);
      const cellY = Math.floor(mouseY / cellSize);

      grid[cellX][cellY] = !grid[cellX][cellY];
      draw();
    }
  
    function randomizeGrid() {
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          grid[i][j] = Math.random() > 0.5;
        }
      }
    }
  
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
  
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          if (grid[i][j]) {
            ctx.fillStyle = 'hsla(116, 58%, 60%, 1)';
          } else if (historyGrid.length > 0 && !grid[i][j] && historyGrid[0][i][j]) {
            ctx.fillStyle = 'hsla(0,0%,30%,.7)';
          } else {
            ctx.fillStyle = '#000';
          }
          ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
      }
  
      // Draw gridlines
      ctx.strokeStyle = 'rgba(30, 30, 30, 0.5)';
      ctx.beginPath();
      for (let i = 0; i <= canvas.width; i += cellSize) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
      }
      for (let j = 0; j <= canvas.height; j += cellSize) {
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
      }
      ctx.stroke();
    }
  
    function update() {
      let nextGen = new Array(cols).fill(null).map(() => new Array(rows).fill(false));
  
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          let neighbors = countNeighbors(i, j);
  
          if (grid[i][j]) {
            if (neighbors < 2 || neighbors > 3) {
              nextGen[i][j] = false;
            } else {
              nextGen[i][j] = true;
            }
          } else {
            if (neighbors === 3) {
              nextGen[i][j] = true;
            }
          }
        }
      }
  
      historyGrid.unshift(grid.map(row => row.slice())); // Saving the grid state to history
      if (historyGrid.length > 5) {
        historyGrid.pop();
      }
  
      grid = nextGen;
      draw();
    }
  
    function countNeighbors(x, y) {
      let count = 0;
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          let col = (x + i + cols) % cols;
          let row = (y + j + rows) % rows;
          count += grid[col][row] ? 1 : 0;
        }
      }
      count -= grid[x][y] ? 1 : 0;
      return count;
    }
  
    window.addEventListener('resize', function() {
      setup();
    });
  
    setup();
  });
  