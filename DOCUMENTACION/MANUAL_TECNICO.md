# **Manual Técnico - Sistema MazeBot**  

## **RESPONSABLES**

| _Nombre_                       | _Carnet_  |
| ------------------------------ | --------- |
| Nery Oswaldo Jiménez Contreras | 201700381 |
| Fredy Samuel Quijada Ceballos  | 202004812 |
| Elvis Joseph Vásquez Villatoro | 202006666 |
## Índice

- [**Manual Técnico - Sistema MazeBot**](#manual-técnico---sistema-mazebot)
  - [**RESPONSABLES**](#responsables)
  - [Índice](#índice)
  - [1. Descripción General del Proyecto](#1-descripción-general-del-proyecto)
  - [2. Tecnologías Utilizadas](#2-tecnologías-utilizadas)
  - [3. Estructura del Proyecto](#3-estructura-del-proyecto)
  - [4. Visualización 3D del Laberinto](#4-visualización-3d-del-laberinto)
  - [5. Carga Dinámica desde JSON](#5-carga-dinámica-desde-json)
  - [6. Implementación de Algoritmos de Búsqueda](#6-implementación-de-algoritmos-de-búsqueda)
  - [7. Control de Simulación y Eventos](#7-control-de-simulación-y-eventos)
  - [8. Consideraciones de Diseño y Rendimiento](#8-consideraciones-de-diseño-y-rendimiento)
  - [9. Siguientes Pasos o Mejoras Futuras](#9-siguientes-pasos-o-mejoras-futuras)

---

## 1. Descripción General del Proyecto

El proyecto implementa una visualización interactiva en 3D de un robot que navega en un laberinto. El sistema permite al usuario seleccionar distintos algoritmos de búsqueda para simular el recorrido desde un punto inicial hasta un destino, mostrando el camino en tiempo real y la toma de decisiones del robot.

---

## 2. Tecnologías Utilizadas

- Three.js: Librería JavaScript para gráficos 3D renderizados en el navegador.

- JavaScript Vanilla: Para la lógica de la simulación y control de eventos.

- HTML y CSS: Para estructurar y diseñar la interfaz gráfica.

- JSON: Para definir la configuración de los laberintos.

---

## 3. Estructura del Proyecto

```
├── archivos de prueba
│   ├── dificil.json
│   ├── facil.json
│   ├── medio.json
│   └── otro.json
├── css
│   └── styles.css
├── DOCUMENTACION
│   ├── img
│   │   ├── btn.png
│   │   ├── fin.png
│   │   ├── inicio.png
│   │   ├── inico.png
│   │   └── medio.png
│   ├── MANUAL_TECNICO.md
│   └── MANUAL_USUARIO.md
├── index.html
├── js
│   ├── astar.js
│   ├── bfs.js
│   ├── dfs.js
│   ├── dijkstra.js
│   ├── main.js
│   └── uniformcost.js
├── LICENSE
└── README.md
```

---

## 4. Visualización 3D del Laberinto

El entorno 3D está construido usando Three.js, donde se renderiza un laberinto con paredes, caminos y un robot móvil representado por un cubo 3D. Cada celda del laberinto es procesada desde un archivo JSON para posicionar los objetos en el espacio.

---

## 5. Carga Dinámica desde JSON

Los laberintos están definidos en archivos .json, estructurados como matrices donde cada número representa un tipo de celda (camino, muro, inicio, fin). Al cargar un archivo, el sistema genera automáticamente el entorno 3D correspondiente.

```js
// Función para cargar JSON
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const newMazeData = JSON.parse(e.target.result);
            
            // Validar la estructura del JSON
            if (!newMazeData.ancho || !newMazeData.alto || !newMazeData.inicio || 
                !newMazeData.fin || !newMazeData.paredes) {
                alert("El archivo JSON no tiene la estructura correcta.");
                return;
            }
            
            // Detener simulación actual si está en curso
            stopSimulation();
            
            // Actualizar mazeData y regenerar el laberinto
            mazeData = newMazeData;
            resetScene();
            
            document.getElementById('info').textContent = 
                `Laberinto cargado: ${mazeData.ancho}x${mazeData.alto}. Selecciona un algoritmo y haz clic en Iniciar`;
        } catch (error) {
            alert("Error al parsear el archivo JSON: " + error.message);
        }
    };
    reader.readAsText(file);
}
```


---

## 6. Implementación de Algoritmos de Búsqueda

El sistema implementa cinco algoritmos de búsqueda clásica:

- BFS (Anchura)

  BFS explora el laberinto en capas, es decir, primero explora todos los nodos a una distancia dada antes de pasar a los nodos más lejanos. Garantiza encontrar el camino más corto si todos los pasos tienen el mismo costo. Se eligió BFS como base para comparar con otros algoritmos porque es simple y asegura el camino más corto en laberintos sin pesos. Es útil para observar la eficiencia y la cantidad de nodos explorados.

- DFS (Profundidad)

    DFS se enfoca en ir lo más profundo posible por un camino antes de retroceder. Puede encontrar una solución rápidamente pero no garantiza el camino más corto. DFS se eligió por su simplicidad y para mostrar la diferencia entre estrategias (profundidad) y exhaustivas (amplitud). Sirve como comparación importante con BFS.

- Dijkstra

    Algoritmo de búsqueda de costo uniforme que garantiza el camino más corto al nodo destino considerando pesos positivos. Calcula las distancias mínimas desde el inicio a todos los nodos. Se eligió Dijkstra por su capacidad de encontrar caminos óptimos aún en laberintos con pesos variables.

- Costo Uniforme

    Es una variante de Dijkstra donde se prioriza siempre el nodo de menor costo acumulado. En laberintos sin pesos, su comportamiento es muy similar a Dijkstra. Se incluyó para demostrar diferencias sutiles entre algoritmos de costo uniforme y heurísticos. Aunque el comportamiento es similar al de Dijkstra, permite modular fácilmente para incluir distintos costos.

- A *

    A* combina las ventajas de Dijkstra y búsqueda heurística, utilizando una función f(n) = g(n) + h(n), donde g(n) es el costo acumulado y h(n) una heurística (en este caso, distancia Manhattan) para estimar el costo restante hasta el destino. Fue seleccionado por ser uno de los algoritmos más eficientes y populares para la búsqueda de caminos en IA. Su capacidad de enfocarse hacia el objetivo usando la heurística lo hace muy adecuado para resolver laberintos rápidamente.

Cada algoritmo está en un archivo independiente y retorna el camino óptimo como una lista de coordenadas que el robot debe seguir.


---

## 7. Control de Simulación y Eventos

La simulación es controlada por botones y eventos:

- Iniciar: Ejecuta el algoritmo seleccionado.
- Reiniciar: Restaura el laberinto.
- Detener: Detiene la simulación.
- Cargar JSON: Permite cargar un nuevo laberinto.

---

## 8. Consideraciones de Diseño y Rendimiento

- Separación modular de algoritmos para facilitar el mantenimiento.
- Carga dinámica del laberinto, lo que permite modificar o agregar nuevos sin cambiar el código.
- Uso eficiente de Three.js, reduciendo la cantidad de geometrías al mínimo necesario.
- Animaciones suaves, gracias a la función requestAnimationFrame.

---

## 9. Siguientes Pasos o Mejoras Futuras

- Agregar visualización de la cola de exploración en tiempo real.
- Implementar un sistema de puntuación basado en eficiencia.
- Añadir obstáculos dinámicos o enemigos móviles.
- Incluir modelos 3D personalizados en lugar de cubos.
- Incorporar sonido y efectos al llegar al destino.

---