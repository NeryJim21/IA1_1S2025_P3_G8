function dijkstra(maze) {
    const grid = createGrid(maze);
    const visited = new Set();
    const fullPath = [];
    const stack = [[maze.inicio[0], maze.inicio[1]]];
    const distances = {};
    const previous = {};

    // Inicializar distancias
    for (let y = 0; y < maze.alto; y++) {
        for (let x = 0; x < maze.ancho; x++) {
            distances[`${x},${y}`] = Infinity;
        }
    }
    distances[`${maze.inicio[0]},${maze.inicio[1]}`] = 0;

    fullPath.push([maze.inicio[0], maze.inicio[1]]);

    while (stack.length > 0) {
        const [x, y] = stack[stack.length - 1];
        const current = `${x},${y}`;
        visited.add(current);

        // Si llegamos al final
        if (x === maze.fin[0] && y === maze.fin[1]) {
            return fullPath;
        }

        let moved = false;
        let minDistance = Infinity;
        let bestNeighbor = null;

        // Explorar vecinos en orden de distancia
        const directions = [[1,0], [-1,0], [0,1], [0,-1]];
        for (const [dx, dy] of directions) {
            const nx = x + dx, ny = y + dy;
            const neighbor = `${nx},${ny}`;

            if (nx >= 0 && nx < maze.ancho && ny >= 0 && ny < maze.alto && 
                !grid[ny][nx] && !visited.has(neighbor)) {
                
                const newDistance = distances[current] + 1;
                if (newDistance < distances[neighbor]) {
                    distances[neighbor] = newDistance;
                    previous[neighbor] = current;
                }

                // Seleccionar el vecino con menor distancia
                if (distances[neighbor] < minDistance) {
                    minDistance = distances[neighbor];
                    bestNeighbor = [nx, ny];
                }
            }
        }

        // Mover al mejor vecino
        if (bestNeighbor) {
            stack.push(bestNeighbor);
            fullPath.push(bestNeighbor);
            moved = true;
        } 
        // Retroceder si no hay movimientos válidos
        else if (stack.length > 1) {
            stack.pop();
            fullPath.push(stack[stack.length - 1]);
        } else {
            break; // No hay solución
        }
    }

    return fullPath;
}