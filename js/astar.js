function aStar(maze) {
    const grid = createGrid(maze);
    const openSet = new Set([`${maze.inicio[0]},${maze.inicio[1]}`]);
    const cameFrom = {};
    const gScore = {};
    const fScore = {};
    const fullPath = [];
    
    // Inicializar costos
    for (let y = 0; y < maze.alto; y++) {
        for (let x = 0; x < maze.ancho; x++) {
            gScore[`${x},${y}`] = Infinity;
            fScore[`${x},${y}`] = Infinity;
        }
    }
    
    // Costos iniciales
    gScore[`${maze.inicio[0]},${maze.inicio[1]}`] = 0;
    fScore[`${maze.inicio[0]},${maze.inicio[1]}`] = heuristic([maze.inicio[0], maze.inicio[1]], [maze.fin[0], maze.fin[1]]);
    
    fullPath.push([maze.inicio[0], maze.inicio[1]]); // Primer paso
    
    while (openSet.size > 0) {
        // Obtener nodo con menor fScore
        let current = null;
        let lowestFScore = Infinity;
        for (const node of openSet) {
            if (fScore[node] < lowestFScore) {
                lowestFScore = fScore[node];
                current = node;
            }
        }
        
        const [x, y] = current.split(',').map(Number);
        fullPath.push([x, y]);
        
        // Retorna el camino si se llega al final
        if (x === maze.fin[0] && y === maze.fin[1]) {
            return fullPath;
        }
        
        openSet.delete(current);
        
        // Explorar vecinos
        const directions = [[1,0], [-1,0], [0,1], [0,-1]];
        let moved = false;
        
        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx >= 0 && nx < maze.ancho && ny >= 0 && ny < maze.alto && !grid[ny][nx]) {
                const neighbor = `${nx},${ny}`;
                const tentativeGScore = gScore[current] + 1; // Costo 1 por movimiento
                
                if (tentativeGScore < gScore[neighbor]) {
                    cameFrom[neighbor] = current;
                    gScore[neighbor] = tentativeGScore;
                    fScore[neighbor] = gScore[neighbor] + heuristic([nx, ny], [maze.fin[0], maze.fin[1]]);
                    
                    if (!openSet.has(neighbor)) {
                        openSet.add(neighbor);
                        moved = true;
                    }
                }
            }
        }
        
        // Si no se movió, registrar retroceso
        if (!moved && openSet.size > 0) {
            fullPath.push([x, y]);
        }
    }
    
    return fullPath;
}

// Función heurística (Distancia Manhattan)
function heuristic(a, b) {
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}