// report_script.js

document.addEventListener("DOMContentLoaded", function() {
    initDashboard();
});

function initDashboard() {
    // Ya no inyectamos estilos aquí porque usamos el archivo CSS externo
    createControlPanel();
    enhanceTables();
    colorizeProfits();
    makeChartsInteractive();
}

// 1. Panel de Control (Modo Oscuro y Búsqueda)
function createControlPanel() {
    const controls = document.createElement('div');
    controls.className = 'dashboard-controls';

    // Botón Dark Mode
    const btnDark = document.createElement('button');
    btnDark.className = 'btn btn-dark';
    btnDark.innerHTML = '🌙 Modo Oscuro';
    btnDark.onclick = () => {
        document.body.classList.toggle('dark-mode');
        // Cambiar texto del botón
        if(document.body.classList.contains('dark-mode')){
            btnDark.innerHTML = '☀️ Modo Claro';
            btnDark.style.backgroundColor = '#f4f4f4';
            btnDark.style.color = '#333';
        } else {
            btnDark.innerHTML = '🌙 Modo Oscuro';
            btnDark.style.backgroundColor = '#333';
            btnDark.style.color = 'white';
        }
    };

    controls.appendChild(btnDark);
    document.body.appendChild(controls);

    // Barra de Búsqueda global
    const mainTable = document.querySelector('div[align="center"]');
    if (mainTable) {
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
}

// 2. Mejoras en las Tablas (Ordenamiento)
function enhanceTables() {
    const tables = document.querySelectorAll('table');
    
    tables.forEach(table => {
        const headerRow = table.querySelector('tr[align="center"]');
        if (!headerRow) return;

        const cells = headerRow.querySelectorAll('td, th');
        
        cells.forEach((cell, index) => {
            cell.style.cursor = "pointer";
            cell.title = "Click para ordenar";
            
            // Si es un TD, lo convertimos visualmente en header
            if(cell.tagName === 'TD') {
                cell.style.fontWeight = 'bold';
            }

            cell.addEventListener('click', () => sortTable(table, index));
        });
    });
}

function sortTable(table, n) {
    let rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    switching = true;
    dir = "asc"; 
    
    while (switching) {
        switching = false;
        rows = table.rows;
        // Comenzamos el loop asumiendo que las primeras filas son estructura
        // Empezamos desde la fila 3 para evitar títulos del reporte
        for (i = 3; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];
            
            if (!x || !y) continue; 

            let xContent = x.innerText.toLowerCase();
            let yContent = y.innerText.toLowerCase();

            // Detectar si es número (quitando espacios y comas)
            const xNum = parseFloat(xContent.replace(/ /g, '').replace(/,/g, ''));
            const yNum = parseFloat(yContent.replace(/ /g, '').replace(/,/g, ''));

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

// 3. Colorear Ganancias y Pérdidas
function colorizeProfits() {
    const rows = document.querySelectorAll('tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        
        // La tabla de Deals tiene muchas columnas. Profit suele ser la 3ra desde el final.
        if (cells.length >= 10) {
            // Intentamos localizar la columna Profit por posición relativa desde el final
            const profitCell = cells[cells.length - 3]; 
            if(profitCell) {
                const profitText = profitCell.innerText.replace(/ /g, '');
                const profit = parseFloat(profitText);

                // Verificamos que no sea una fecha u otro dato por error
                if (!isNaN(profit)) {
                    if (profit > 0) {
                        profitCell.classList.add('profit-pos');
                        profitCell.innerText = "+" + profitText;
                    } else if (profit < 0) {
                        profitCell.classList.add('profit-neg');
                    }
                }
            }
        }
    });
}

// 4. Lightbox para Gráficos
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
    
    // Cerrar al hacer click fuera
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}
