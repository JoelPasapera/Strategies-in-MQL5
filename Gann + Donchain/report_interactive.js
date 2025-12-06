document.addEventListener("DOMContentLoaded", function() {
    initDashboard();
});

function initDashboard() {
    injectStyles();
    createControlPanel();
    enhanceTables();
    colorizeProfits();
    makeChartsInteractive();
}

// 1. Inyección de Estilos CSS Modernos
function injectStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
        :root {
            --bg-color: #f4f6f8;
            --card-bg: #ffffff;
            --text-color: #333;
            --accent-color: #2196F3;
            --success-color: #4caf50;
            --danger-color: #f44336;
            --border-color: #e0e0e0;
        }
        
        body.dark-mode {
            --bg-color: #121212;
            --card-bg: #1e1e1e;
            --text-color: #e0e0e0;
            --border-color: #333;
        }

        body {
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
            background-color: var(--bg-color);
            color: var(--text-color);
            transition: background 0.3s, color 0.3s;
            margin: 0;
            padding: 20px;
        }

        /* Contenedor principal */
        div[align="center"] {
            max-width: 1200px;
            margin: 0 auto;
            background: var(--card-bg);
            padding: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            border-radius: 8px;
        }

        /* Tablas */
        table {
            width: 100%;
            border-collapse: collapse !important;
            margin-bottom: 20px;
        }
        
        td, th {
            padding: 10px 8px !important;
            border-bottom: 1px solid var(--border-color);
            font-size: 13px !important;
        }

        th {
            background-color: var(--accent-color);
            color: white;
            cursor: pointer;
            text-align: left;
            position: sticky;
            top: 0;
        }

        th:hover {
            background-color: #1976D2;
        }

        /* Panel de Control */
        .dashboard-controls {
            position: fixed;
            top: 20px;
            right: 20px;
            display: flex;
            gap: 10px;
            z-index: 1000;
        }

        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            transition: transform 0.1s;
        }

        .btn:active { transform: scale(0.95); }

        .btn-dark {
            background-color: #333;
            color: white;
        }
        
        .btn-search {
            background-color: var(--accent-color);
            color: white;
        }

        /* Utilidades */
        .profit-pos { color: var(--success-color) !important; font-weight: bold; }
        .profit-neg { color: var(--danger-color) !important; font-weight: bold; }
        
        .search-container {
            margin: 20px 0;
            display: flex;
            justify-content: center;
        }

        #searchInput {
            padding: 10px;
            width: 300px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 14px;
        }

        /* Imágenes/Gráficos */
        img {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
            cursor: zoom-in;
            transition: transform 0.2s;
        }
        img:hover { transform: scale(1.01); }

        /* Modal para imágenes */
        .modal {
            display: none;
            position: fixed;
            z-index: 2000;
            padding-top: 50px;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.9);
        }
        .modal-content {
            margin: auto;
            display: block;
            max-width: 90%;
            max-height: 90vh;
        }
    `;
    document.head.appendChild(style);
}

// 2. Panel de Control (Modo Oscuro y Búsqueda)
function createControlPanel() {
    const controls = document.createElement('div');
    controls.className = 'dashboard-controls';

    // Botón Dark Mode
    const btnDark = document.createElement('button');
    btnDark.className = 'btn btn-dark';
    btnDark.innerHTML = '🌙 Modo Oscuro';
    btnDark.onclick = () => {
        document.body.classList.toggle('dark-mode');
        btnDark.innerHTML = document.body.classList.contains('dark-mode') ? '☀️ Modo Claro' : '🌙 Modo Oscuro';
    };

    controls.appendChild(btnDark);
    document.body.appendChild(controls);

    // Barra de Búsqueda global
    const mainTable = document.querySelector('div[align="center"]');
    const searchDiv = document.createElement('div');
    searchDiv.className = 'search-container';
    searchDiv.innerHTML = `<input type="text" id="searchInput" placeholder="🔍 Buscar orden, fecha o precio...">`;
    mainTable.insertBefore(searchDiv, mainTable.firstChild);

    document.getElementById('searchInput').addEventListener('keyup', function() {
        const filter = this.value.toLowerCase();
        const rows = document.querySelectorAll('tr');
        
        rows.forEach(row => {
            // Ignorar filas de encabezado o estructura
            if(row.cells.length > 2 && !row.querySelector('th')) {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(filter) ? '' : 'none';
            }
        });
    });
}

// 3. Mejoras en las Tablas (Ordenamiento)
function enhanceTables() {
    const tables = document.querySelectorAll('table');
    
    tables.forEach(table => {
        const headerRow = table.querySelector('tr[align="center"]');
        if (!headerRow) return;

        // Identificar si es la tabla de Órdenes o Deals
        const cells = headerRow.querySelectorAll('td, th');
        
        // Convertir celdas de encabezado visual a verdaderos <th> si no lo son
        cells.forEach((cell, index) => {
            cell.style.cursor = "pointer";
            cell.title = "Click para ordenar";
            cell.addEventListener('click', () => sortTable(table, index));
        });
    });
}

function sortTable(table, n) {
    let rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    switching = true;
    dir = "asc"; 
    
    // Asumimos que las filas de datos empiezan después de los encabezados complejos
    // En este reporte específico, hay muchas filas de estructura.
    // Buscamos el tbody principal.
    
    while (switching) {
        switching = false;
        rows = table.rows;
        // Comenzamos el loop asumiendo que las primeras filas son encabezados.
        // Ajuste heurístico: empezar desde la fila 3 o 4
        for (i = 3; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];
            
            if (!x || !y) continue; // Saltar filas de estructura

            let xContent = x.innerText.toLowerCase();
            let yContent = y.innerText.toLowerCase();

            // Detectar si es número
            const xNum = parseFloat(xContent.replace(/ /g, ''));
            const yNum = parseFloat(yContent.replace(/ /g, ''));

            if (!isNaN(xNum) && !isNaN(yNum)) {
                if (dir == "asc") {
                    if (xNum > yNum) { shouldSwitch = true; break; }
                } else {
                    if (xNum < yNum) { shouldSwitch = true; break; }
                }
            } else {
                if (dir == "asc") {
                    if (xContent > yContent) { shouldSwitch = true; break; }
                } else {
                    if (xContent < yContent) { shouldSwitch = true; break; }
                }
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount ++; 
        } else {
            if (switchcount == 0 && dir == "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
}

// 4. Colorear Ganancias y Pérdidas
function colorizeProfits() {
    // Buscar la columna de "Profit" en la tabla de Deals
    // Usualmente es la antepenúltima columna o se identifica por el encabezado.
    // En este HTML específico, las tablas son genéricas. Iteramos celdas.
    
    const rows = document.querySelectorAll('tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        
        // La tabla de Deals tiene ~13 columnas. Profit es la 10 (índice)
        if (cells.length >= 10) {
            const profitCell = cells[cells.length - 3]; // Profit suele ser la 3ra desde el final
            const profitText = profitCell.innerText.replace(/ /g, '');
            const profit = parseFloat(profitText);

            if (!isNaN(profit)) {
                if (profit > 0) {
                    profitCell.classList.add('profit-pos');
                    // Añadir un + visual
                    profitCell.innerText = "+" + profitText;
                } else if (profit < 0) {
                    profitCell.classList.add('profit-neg');
                }
            }
        }
    });
}

// 5. Lightbox para Gráficos
function makeChartsInteractive() {
    // Crear el modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = '<span style="position:absolute;top:15px;right:35px;color:#f1f1f1;font-size:40px;font-weight:bold;cursor:pointer;" onclick="this.parentElement.style.display=\'none\'">&times;</span><img class="modal-content" id="img01">';
    document.body.appendChild(modal);

    const modalImg = document.getElementById("img01");
    const images = document.querySelectorAll('img');

    images.forEach(img => {
        img.onclick = function(){
            modal.style.display = "block";
            modalImg.src = this.src;
        }
    });
}
