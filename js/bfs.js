function bfs(maze) {
    const grid = createGrid(maze);
    const visited = new Set();
    const fullPath = [];
    const stack = [[maze.inicio[0], maze.inicio[1]]];
    
    visited.add(`${maze.inicio[0]},${maze.inicio[1]}`);
    fullPath.push([maze.inicio[0], maze.inicio[1]]);
    
    const directions = [[1,0], [-1,0], [0,1], [0,-1]];
    
    while (stack.length > 0) {
        const [x, y] = stack[stack.length - 1]; // Mira el último punto sin eliminarlo
        
        // Si llegamos al final
        if (x === maze.fin[0] && y === maze.fin[1]) {
            return fullPath;
        }
        
        let moved = false;
        
        // Intenta moverse en todas las direcciones
        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx >= 0 && nx < maze.ancho && ny >= 0 && ny < maze.alto && 
                !grid[ny][nx] && !visited.has(`${nx},${ny}`)) {
                
                visited.add(`${nx},${ny}`);
                stack.push([nx, ny]);
                fullPath.push([nx, ny]);
                moved = true;
                break;
            }
        }
        
        // Si no pudo moverse a ninguna dirección, retrocede
        if (!moved) {
            if (stack.length > 1) {
                stack.pop();
                fullPath.push(stack[stack.length - 1]);
            } else {
                break; // No hay solución
            }
        }
    }
    return fullPath;
}
