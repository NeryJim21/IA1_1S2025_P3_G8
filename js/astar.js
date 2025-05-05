function aStar( maze )
{
    const grid = createGrid( maze );
    const start = `${ maze.inicio[ 0 ] },${ maze.inicio[ 1 ] }`;
    const end = `${ maze.fin[ 0 ] },${ maze.fin[ 1 ] }`;

    const openSet = new Set( [ start ] );
    const cameFrom = {};
    const gScore = {};
    const fScore = {};

    // Inicializar costos
    for ( let y = 0; y < maze.alto; y++ )
    {
        for ( let x = 0; x < maze.ancho; x++ )
        {
            const key = `${ x },${ y }`;
            gScore[ key ] = Infinity;
            fScore[ key ] = Infinity;
        }
    }

    gScore[ start ] = 0;
    fScore[ start ] = heuristic( maze.inicio, maze.fin );

    while ( openSet.size > 0 )
    {
        // Obtener nodo con menor fScore
        let current = null;
        let lowestF = Infinity;
        for ( const node of openSet )
        {
            if ( fScore[ node ] < lowestF )
            {
                lowestF = fScore[ node ];
                current = node;
            }
        }

        if ( current === end )
        {
            // Reconstruir camino
            return reconstructPath( cameFrom, current );
        }

        openSet.delete( current );
        const [ x, y ] = current.split( ',' ).map( Number );

        const directions = [ [ 1, 0 ], [ -1, 0 ], [ 0, 1 ], [ 0, -1 ] ];
        for ( const [ dx, dy ] of directions )
        {
            const nx = x + dx;
            const ny = y + dy;

            if ( nx >= 0 && nx < maze.ancho && ny >= 0 && ny < maze.alto && !grid[ ny ][ nx ] )
            {
                const neighbor = `${ nx },${ ny }`;
                const tentativeG = gScore[ current ] + 1;

                if ( tentativeG < gScore[ neighbor ] )
                {
                    cameFrom[ neighbor ] = current;
                    gScore[ neighbor ] = tentativeG;
                    fScore[ neighbor ] = tentativeG + heuristic( [ nx, ny ], maze.fin );

                    if ( !openSet.has( neighbor ) )
                    {
                        openSet.add( neighbor );
                    }
                }
            }
        }
    }

    // Si no hay camino
    return [];
}

// Reconstrucción del camino desde el final hasta el inicio
function reconstructPath( cameFrom, current )
{
    const path = [ current.split( ',' ).map( Number ) ];
    while ( current in cameFrom )
    {
        current = cameFrom[ current ];
        path.push( current.split( ',' ).map( Number ) );
    }
    return path.reverse();
}

// Función heurística (distancia Manhattan)
function heuristic( a, b )
{
    return Math.abs( a[ 0 ] - b[ 0 ] ) + Math.abs( a[ 1 ] - b[ 1 ] );
}
