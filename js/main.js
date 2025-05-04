// Variables globales
let isSimulationRunning = false;
let currentAnimation = null;
// Configuración base inicial
let mazeData = {
    "ancho": 5,
    "alto": 5,
    "inicio": [0, 0],
    "fin": [4, 4],
    "paredes": [
        [0, 1], [2, 1], [3, 1],
        [1, 3], [2, 3], [3, 3]
    ]
}


// Configuración básica de la escena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Iluminación
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.5);
scene.add(hemisphereLight);

// Controles de cámara (zoom con rueda del mouse)
camera.position.set(5, 10, 5);
camera.lookAt(0, 0, 0);
window.addEventListener('wheel', (e) => {
    camera.position.y = Math.max(5, Math.min(20, camera.position.y - e.deltaY * 0.01));
    camera.lookAt(0, 0, 0);
});

// Variables para el laberinto y robot
let maze, robot;

// Inicializar la escena
initScene();

function initScene() {
    // Crear el laberinto
    maze = createMaze(mazeData);
    scene.add(maze);

    // Crear el robot
    robot = createRobot();
    scene.add(robot);
    resetRobotPosition();
}

// Animación
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// Controles
document.getElementById('start').addEventListener('click', startSimulation);
document.getElementById('reset').addEventListener('click', resetSimulation);
document.getElementById('stop').addEventListener('click', stopSimulation);
document.getElementById('json').addEventListener('click', () => {
    document.getElementById('jsonInput').click();
});

// Input para cargar JSON
const jsonInput = document.createElement('input');
jsonInput.id = 'jsonInput';
jsonInput.type = 'file';
jsonInput.accept = '.json';
jsonInput.style.display = 'none';
jsonInput.addEventListener('change', handleFileSelect);
document.body.appendChild(jsonInput);

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

// Funciones principales
function createMaze(data) {
    const group = new THREE.Group();
    
    // Suelo
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(data.ancho, data.alto),
        new THREE.MeshStandardMaterial({ color: 0xeeeeee })
    );
    floor.rotation.x = -Math.PI / 2;
    group.add(floor);
    
    // Paredes
    const wallGeometry = new THREE.BoxGeometry(1, 1, 1);
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x5555ff });
    
    data.paredes.forEach(pos => {
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.set(pos[0] - data.ancho/2 + 0.5, 0.5, pos[1] - data.alto/2 + 0.5);
        group.add(wall);
    });
    
    // Inicio (verde) y Fin (rojo)
    const start = createMarker(data.inicio, 0x00ff00);
    const end = createMarker(data.fin, 0xff0000);
    group.add(start);
    group.add(end);
    
    return group;
}


function createMarker(position, color) {
    const marker = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 0.1, 32),
        new THREE.MeshStandardMaterial({ color })
    );
    marker.position.set(
        position[0] - mazeData.ancho/2 + 0.5,
        0.05,
        position[1] - mazeData.alto/2 + 0.5
    );
    return marker;
}

function createRobot() {
    const robot = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.8, 0.6),
        new THREE.MeshStandardMaterial({ color: 0xffaa00 })
    );
    // Ojos
    const eye1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0x000000 })
    );
    eye1.position.set(0.2, 0.2, 0.31);
    robot.add(eye1);
    
    const eye2 = eye1.clone();
    eye2.position.x = -0.2;
    robot.add(eye2);
    
    return robot;
}

function resetRobotPosition() {
    robot.position.set(
        mazeData.inicio[0] - mazeData.ancho/2 + 0.5,
        0.4,
        mazeData.inicio[1] - mazeData.alto/2 + 0.5
    );
    robot.rotation.y = 0;
}

function resetScene() {
    scene.remove(maze);
    
    maze = createMaze(mazeData);
    scene.add(maze);
    
    resetRobotPosition();
}

function stopSimulation() {
    isSimulationRunning = false;
    
    if (currentAnimation) {
        cancelAnimationFrame(currentAnimation);
        currentAnimation = null;
    }
    
    document.getElementById('info').textContent = "Simulación detenida. Puedes reiniciar o seleccionar otro algoritmo.";
}

// Algoritmos de búsqueda
async function startSimulation() {
    if (isSimulationRunning) return;
    isSimulationRunning = true;
    
    const algorithm = document.getElementById('algorithm').value;
    let path = [];
    
    document.getElementById('info').textContent = `Ejecutando ${algorithm}...`;
    
    switch(algorithm) {
        case 'BFS': path = bfs(mazeData); break;
        case 'DFS': path = dfs(mazeData); break;
        case 'AStar': path = aStar(mazeData); break;
        case 'Dijkstra': path = dijkstra(mazeData); break;
        case 'CU': path = uniformCost(mazeData); break;
    }
    
    // Animar el recorrido del robot
    for (const step of path) {
        if (!isSimulationRunning) break;
        
        await moveRobotTo(step[0], step[1]);
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    if (isSimulationRunning) {
        document.getElementById('info').textContent = 
            `Simulación completada usando ${algorithm}. Puedes reiniciar o probar otro algoritmo.`;
        isSimulationRunning = false;
    }
}

function resetSimulation() {
    stopSimulation();
    resetRobotPosition();
    document.getElementById('info').textContent = "Simulación reiniciada. Selecciona un algoritmo y haz clic en Iniciar";
}

async function moveRobotTo(x, y) {
    return new Promise(resolve => {
        if (!isSimulationRunning) return resolve();
        
        const targetX = x - mazeData.ancho/2 + 0.5;
        const targetZ = y - mazeData.alto/2 + 0.5;
        
        const duration = 500; // ms
        const startTime = Date.now();
        const startX = robot.position.x;
        const startZ = robot.position.z;
        
        // Calcular dirección para rotación
        const dx = targetX - startX;
        const dz = targetZ - startZ;
        robot.rotation.y = Math.atan2(dx, dz);
        
        function updatePosition() {
            if (!isSimulationRunning) return resolve();
            
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            robot.position.x = startX + (targetX - startX) * progress;
            robot.position.z = startZ + (targetZ - startZ) * progress;
            
            // Pequeño "salto" para hacerlo más cartoon
            robot.position.y = 0.4 + Math.sin(progress * Math.PI) * 0.2;
            
            if (progress < 1) {
                currentAnimation = requestAnimationFrame(updatePosition);
            } else {
                resolve();
            }
        }
        updatePosition();
    });
}

function createGrid(maze) {
    const grid = Array(maze.alto).fill().map(() => Array(maze.ancho).fill(false));
    maze.paredes.forEach(([x, y]) => {
        grid[y][x] = true; // Paredes como true
    });
    return grid;
}

// Manejo de redimensionamiento de ventana
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});