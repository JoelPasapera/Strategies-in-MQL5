/**
 * DOM Manager - Módulo exclusivo para manipulación del DOM
 * Responsabilidad: Gestión de elementos HTML, eventos y renderizado visual
 */

class DOMManager {
    constructor() {
        this.strategiesContainer = null;
        this.loadingOverlay = null;
        this.init();
    }

    init() {
        this.strategiesContainer = document.getElementById('strategiesGrid');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.setupEventListeners();
    }

    /**
     * Configurar event listeners principales
     */
    setupEventListeners() {
        // Filtro de rendimiento
        const performanceFilter = document.getElementById('performanceFilter');
        if (performanceFilter) {
            performanceFilter.addEventListener('change', (e) => {
                window.PortfolioManager.filterStrategies(e.target.value);
            });
        }

        // Botón de refrescar
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                window.PortfolioManager.refreshStrategies();
            });
        }

        // Botones de exploración
        const exploreBtn = document.getElementById('exploreBtn');
        if (exploreBtn) {
            exploreBtn.addEventListener('click', () => {
                this.strategiesContainer.scrollIntoView({ behavior: 'smooth' });
            });
        }
    }

    /**
     * Mostrar/ocultar overlay de carga
     */
    toggleLoading(show) {
        if (!this.loadingOverlay) return;
        
        if (show) {
            this.loadingOverlay.classList.add('active');
        } else {
            this.loadingOverlay.classList.remove('active');
        }
    }

    /**
     * Extraer datos de estrategia desde HTML
     */
    extractStrategyData(htmlContent, folderName) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        
        // Extraer datos principales
        const data = {
            id: folderName.toLowerCase().replace(/\s+/g, '_'),
            name: folderName,
            symbol: this.extractValue(doc, 'Symbol:'),
            period: this.extractValue(doc, 'Period:'),
            totalNetProfit: this.extractValue(doc, 'Total Net Profit:'),
            profitFactor: this.extractValue(doc, 'Profit Factor:'),
            sharpeRatio: this.extractValue(doc, 'Sharpe Ratio:'),
            totalTrades: this.extractValue(doc, 'Total Trades:'),
            winRate: this.extractWinRate(doc),
            drawdown: this.extractDrawdown(doc),
            folder: folderName
        };

        return data;
    }

    /**
     * Extraer valor de una etiqueta específica
     */
    extractValue(doc, label) {
        const rows = doc.querySelectorAll('tr');
        for (let row of rows) {
            const cells = row.querySelectorAll('td');
            for (let i = 0; i < cells.length - 1; i++) {
                if (cells[i].textContent.trim() === label) {
                    return cells[i + 1].textContent.trim();
                }
            }
        }
        return 'N/A';
    }

    /**
     * Extraer win rate de las operaciones
     */
    extractWinRate(doc) {
        const totalTradesText = this.extractValue(doc, 'Total Trades:');
        const profitTradesText = this.extractValue(doc, 'Profit Trades (% of total):');
        
        if (totalTradesText !== 'N/A' && profitTradesText !== 'N/A') {
            const match = profitTradesText.match(/(\d+)\s*\((\d+\.\d+)%\)/);
            if (match) {
                return parseFloat(match[2]);
            }
        }
        return 0;
    }

    /**
     * Extraer drawdown máximo
     */
    extractDrawdown(doc) {
        const drawdownText = this.extractValue(doc, 'Balance Drawdown Maximal:');
        const match = drawdownText.match(/\((\d+\.\d+)%\)/);
        return match ? parseFloat(match[1]) : 0;
    }

    /**
     * Renderizar grid de estrategias
     */
    renderStrategiesGrid(strategies) {
        if (!this.strategiesContainer) return;

        if (strategies.length === 0) {
            this.strategiesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <h3>No se encontraron estrategias</h3>
                    <p>Crea carpetas con archivos HTML para añadir estrategias</p>
                </div>
            `;
            return;
        }

        this.strategiesContainer.innerHTML = strategies.map(strategy => 
            this.createStrategyCard(strategy)
        ).join('');

        // Añadir animaciones de entrada
        this.animateCards();
    }

    /**
     * Crear tarjeta de estrategia
     */
    createStrategyCard(strategy) {
        const profitValue = this.parseProfitValue(strategy.totalNetProfit);
        const profitClass = profitValue >= 0 ? 'positive' : 'negative';
        const profitSymbol = profitValue >= 0 ? '+' : '';

        return `
            <div class="strategy-card" data-id="${strategy.id}" data-folder="${strategy.folder}">
                <div class="strategy-header">
                    <div>
                        <h4 class="strategy-title">${strategy.name}</h4>
                        <p class="strategy-subtitle">${strategy.symbol} • ${strategy.period}</p>
                    </div>
                    <span class="strategy-status status-active">Activa</span>
                </div>
                
                <div class="strategy-metrics">
                    <div class="metric-item">
                        <div class="metric-label">Retorno Neto</div>
                        <div class="metric-value ${profitClass}">
                            ${profitSymbol}${this.formatCurrency(strategy.totalNetProfit)}
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-label">Drawdown</div>
                        <div class="metric-value negative">
                            ${strategy.drawdown.toFixed(2)}%
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-label">Factor Profit</div>
                        <div class="metric-value">${strategy.profitFactor}</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-label">Win Rate</div>
                        <div class="metric-value">${strategy.winRate.toFixed(1)}%</div>
                    </div>
                </div>
                
                <div class="strategy-stats">
                    <div class="stat-row">
                        <span>Operaciones:</span>
                        <span>${strategy.totalTrades}</span>
                    </div>
                    <div class="stat-row">
                        <span>Sharpe Ratio:</span>
                        <span>${strategy.sharpeRatio}</span>
                    </div>
                </div>
                
                <div class="strategy-actions">
                    <button class="btn btn-primary btn-small" onclick="window.DOMManager.navigateToStrategy('${strategy.folder}')">
                        <i class="fas fa-external-link-alt"></i>
                        Ver Detalles
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="window.DOMManager.showStrategyDetails('${strategy.id}')">
                        <i class="fas fa-info-circle"></i>
                        Info
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Parsear valor de profit de string a número
     */
    parseProfitValue(profitText) {
        if (profitText === 'N/A') return 0;
        const cleanText = profitText.replace(/[^\d.-]/g, '');
        return parseFloat(cleanText) || 0;
    }

    /**
     * Formatear valor monetario
     */
    formatCurrency(value) {
        if (value === 'N/A') return 'N/A';
        const numValue = this.parseProfitValue(value);
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(numValue);
    }

    /**
     * Animar tarjetas de estrategia
     */
    animateCards() {
        const cards = this.strategiesContainer.querySelectorAll('.strategy-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.3s ease-out';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    /**
     * Navegar a estrategia específica
     */
    navigateToStrategy(folderName) {
        window.location.href = `${folderName}/`;
    }

    /**
     * Mostrar detalles de estrategia
     */
    showStrategyDetails(strategyId) {
        const strategy = window.PortfolioManager.getStrategyById(strategyId);
        if (!strategy) return;

        alert(`Detalles de ${strategy.name}:\n\n` +
              `Símbolo: ${strategy.symbol}\n` +
              `Período: ${strategy.period}\n` +
              `Retorno Neto: ${strategy.totalNetProfit}\n` +
              `Factor Profit: ${strategy.profitFactor}\n` +
              `Sharpe Ratio: ${strategy.sharpeRatio}\n` +
              `Total Operaciones: ${strategy.totalTrades}`);
    }

    /**
     * Actualizar contadores del header
     */
    updateHeaderStats(totalStrategies, totalFolders) {
        const strategiesCounter = document.getElementById('totalStrategies');
        const foldersCounter = document.getElementById('totalFolders');

        if (strategiesCounter) {
            this.animateCounter(strategiesCounter, totalStrategies);
        }

        if (foldersCounter) {
            this.animateCounter(foldersCounter, totalFolders);
        }
    }

    /**
     * Animar contador
     */
    animateCounter(element, target) {
        const start = 0;
        const increment = target / 30;
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 50);
    }

    /**
     * Mostrar notificación
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '0.5rem',
            color: 'white',
            fontWeight: '500',
            zIndex: '1000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease-out',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        });
        
        const colors = {
            info: '#06b6d4',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    /**
     * Limpiar contenedor de estrategias
     */
    clearStrategiesGrid() {
        if (this.strategiesContainer) {
            this.strategiesContainer.innerHTML = '';
        }
    }

    /**
     * Actualizar métricas de rendimiento
     */
    updatePerformanceMetrics(metrics) {
        const elements = {
            avgReturn: document.getElementById('avgReturn'),
            maxDrawdown: document.getElementById('maxDrawdown'),
            sharpeRatio: document.getElementById('sharpeRatio'),
            winRate: document.getElementById('winRate')
        };

        Object.entries(elements).forEach(([key, element]) => {
            if (element && metrics[key]) {
                element.textContent = metrics[key];
            }
        });
    }
}

// Inicializar DOM Manager cuando el DOM esté listo
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        window.DOMManager = new DOMManager();
    });
}