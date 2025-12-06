/**
 * Main Application - Módulo principal que une todos los componentes
 * Responsabilidad: Coordinar entre DOM Manager, Portfolio Calculator y otros módulos
 */

// Configuración principal de la aplicación
const APP_CONFIG = {
    version: '2.0.0',
    apiEndpoint: '/api',
    updateInterval: 60000, // 1 minuto
    animationDuration: 300,
    chartColors: {
        primary: '#2563eb',
        secondary: '#06b6d4',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444'
    }
};

// Clase principal de la aplicación
class TradingHubApp {
    constructor() {
        this.domManager = null;
        this.portfolioCalculator = null;
        this.strategies = [];
        this.folders = [];
        this.updateInterval = null;
        this.init();
    }

    /**
     * Inicializar aplicación
     */
    async init() {
        try {
            console.log(`Trading Hub v${APP_CONFIG.version} - Iniciando...`);
            
            // Mostrar loading
            this.showLoading(true);
            
            // Inicializar managers
            await this.initializeManagers();
            
            // Cargar estrategias
            await this.loadStrategies();
            
            // Configurar actualizaciones automáticas
            this.setupAutoUpdates();
            
            // Configurar eventos globales
            this.setupGlobalEvents();
            
            // Ocultar loading
            this.showLoading(false);
            
            console.log('Aplicación inicializada correctamente');
            
        } catch (error) {
            console.error('Error al inicializar aplicación:', error);
            this.showLoading(false);
            this.showNotification('Error al inicializar la aplicación', 'error');
        }
    }

    /**
     * Inicializar managers
     */
    async initializeManagers() {
        // Esperar a que DOM Manager esté disponible
        await this.waitForDOMManager();
        
        // Inicializar Portfolio Calculator
        this.portfolioCalculator = new window.PortfolioCalculator();
        
        // Asignar referencias globales
        window.PortfolioManager = this;
    }

    /**
     * Esperar a que DOM Manager esté disponible
     */
    waitForDOMManager() {
        return new Promise((resolve) => {
            const checkDOMManager = () => {
                if (window.DOMManager) {
                    this.domManager = window.DOMManager;
                    resolve();
                } else {
                    setTimeout(checkDOMManager, 100);
                }
            };
            checkDOMManager();
        });
    }

    /**
     * Cargar estrategias desde carpetas
     */
    async loadStrategies() {
        try {
            this.folders = await this.discoverStrategyFolders();
            this.strategies = await this.loadStrategyData(this.folders);
            
            // Actualizar UI
            this.updateUI();
            
        } catch (error) {
            console.error('Error al cargar estrategias:', error);
            this.strategies = this.getMockStrategies(); // Fallback
            this.updateUI();
        }
    }

    /**
     * Descubrir carpetas de estrategias
     */
    async discoverStrategyFolders() {
        // En un entorno real, esto se haría mediante una API o lectura de directorio
        // Por ahora, simulamos la existencia de carpetas
        const mockFolders = [
            'Gann + Donchain',
            'estrategia1',
            'estrategia2'
        ];
        
        // Verificar que las carpetas existen intentando acceder a sus archivos
        const validFolders = [];
        
        for (const folder of mockFolders) {
            try {
                const response = await fetch(`./${folder}/index.html`);
                if (response.ok) {
                    validFolders.push(folder);
                }
            } catch (error) {
                console.warn(`No se pudo acceder a la carpeta: ${folder}`);
            }
        }
        
        return validFolders;
    }

    /**
     * Cargar datos de estrategias
     */
    async loadStrategyData(folders) {
        const strategies = [];
        
        for (const folder of folders) {
            try {
                const response = await fetch(`./${folder}/index.html`);
                const htmlContent = await response.text();
                
                const strategyData = this.domManager.extractStrategyData(htmlContent, folder);
                strategies.push(strategyData);
                
            } catch (error) {
                console.error(`Error al cargar datos de ${folder}:`, error);
                // Crear datos mock para la estrategia
                strategies.push(this.createMockStrategy(folder));
            }
        }
        
        return strategies;
    }

    /**
     * Crear estrategia mock
     */
    createMockStrategy(folderName) {
        const mockData = {
            id: folderName.toLowerCase().replace(/\s+/g, '_'),
            name: folderName,
            symbol: 'XAUUSD',
            period: 'M30 (2015.01.01 - 2025.12.04)',
            totalNetProfit: `${(Math.random() * 50000 - 10000).toFixed(2)}`,
            profitFactor: (Math.random() * 2 + 0.5).toFixed(2),
            sharpeRatio: (Math.random() * 2 + 0.5).toFixed(2),
            totalTrades: Math.floor(Math.random() * 2000 + 500),
            winRate: Math.random() * 40 + 40, // 40-80%
            drawdown: Math.random() * 20 + 5, // 5-25%
            folder: folderName
        };
        
        return mockData;
    }

    /**
     * Obtener estrategias mock (fallback)
     */
    getMockStrategies() {
        return [
            this.createMockStrategy('Estrategia Scalping'),
            this.createMockStrategy('Swing Trading Gold'),
            this.createMockStrategy('Trend Following BTC'),
            this.createMockStrategy('Mean Reversion SPY')
        ];
    }

    /**
     * Actualizar interfaz de usuario
     */
    updateUI() {
        // Actualizar grid de estrategias
        this.domManager.renderStrategiesGrid(this.strategies);
        
        // Actualizar contadores del header
        this.domManager.updateHeaderStats(this.strategies.length, this.folders.length);
        
        // Calcular y actualizar métricas del portafolio
        this.updatePortfolioMetrics();
    }

    /**
     * Actualizar métricas del portafolio
     */
    updatePortfolioMetrics() {
        const metrics = this.portfolioCalculator.calculatePortfolioMetrics(this.strategies);
        const averagePerformance = this.portfolioCalculator.calculateAveragePerformance();
        
        // Actualizar métricas en el DOM
        this.domManager.updatePerformanceMetrics({
            avgReturn: averagePerformance.avgReturn,
            maxDrawdown: this.portfolioCalculator.formatPercentage(metrics.totalDrawdown),
            sharpeRatio: averagePerformance.avgSharpe,
            winRate: averagePerformance.avgWinRate
        });
    }

    /**
     * Filtrar estrategias
     */
    filterStrategies(filter) {
        const filteredStrategies = this.portfolioCalculator.filterStrategiesByPerformance(
            this.strategies, 
            filter
        );
        
        this.domManager.renderStrategiesGrid(filteredStrategies);
        
        const filterText = filter === 'all' ? 'Todas' : 
                          filter === 'high' ? 'Alto rendimiento' :
                          filter === 'medium' ? 'Rendimiento medio' : 'Rendimiento bajo';
        
        this.domManager.showNotification(`Filtrando por: ${filterText}`, 'info');
    }

    /**
     * Refrescar estrategias
     */
    async refreshStrategies() {
        this.domManager.showNotification('Refrescando estrategias...', 'info');
        
        try {
            await this.loadStrategies();
            this.domManager.showNotification('Estrategias actualizadas correctamente', 'success');
        } catch (error) {
            console.error('Error al refrescar estrategias:', error);
            this.domManager.showNotification('Error al refrescar estrategias', 'error');
        }
    }

    /**
     * Obtener estrategia por ID
     */
    getStrategyById(strategyId) {
        return this.strategies.find(s => s.id === strategyId);
    }

    /**
     * Configurar actualizaciones automáticas
     */
    setupAutoUpdates() {
        this.updateInterval = setInterval(() => {
            this.refreshStrategies();
        }, APP_CONFIG.updateInterval);
    }

    /**
     * Configurar eventos globales
     */
    setupGlobalEvents() {
        // Eventos de teclado
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Eventos de redimensionamiento
        window.addEventListener('resize', this.debounce(() => {
            this.handleWindowResize();
        }, 250));

        // Eventos de visibilidad de página
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
    }

    /**
     * Manejar atajos de teclado
     */
    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'r':
                    e.preventDefault();
                    this.refreshStrategies();
                    break;
                case 'f':
                    e.preventDefault();
                    document.getElementById('performanceFilter').focus();
                    break;
            }
        }

        if (e.key === 'Escape') {
            this.domManager.clearStrategiesGrid();
            this.updateUI();
        }
    }

    /**
     * Manejar cambio de tamaño de ventana
     */
    handleWindowResize() {
        // Actualizar gráficos si existen
        if (window.ChartManager && window.ChartManager.heroChart) {
            window.ChartManager.heroChart.resize();
        }
    }

    /**
     * Manejar cambio de visibilidad de página
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // Pausar actualizaciones cuando la página no está visible
            this.pauseAutoUpdates();
        } else {
            // Reanudar actualizaciones cuando la página vuelve a estar visible
            this.resumeAutoUpdates();
        }
    }

    /**
     * Pausar actualizaciones automáticas
     */
    pauseAutoUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    /**
     * Reanudar actualizaciones automáticas
     */
    resumeAutoUpdates() {
        if (!this.updateInterval) {
            this.setupAutoUpdates();
        }
    }

    /**
     * Mostrar/ocultar loading
     */
    showLoading(show) {
        if (this.domManager) {
            this.domManager.toggleLoading(show);
        }
    }

    /**
     * Mostrar notificación
     */
    showNotification(message, type = 'info') {
        if (this.domManager) {
            this.domManager.showNotification(message, type);
        }
    }

    /**
     * Función debounce para optimizar eventos
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Generar reporte completo del portafolio
     */
    generateFullReport() {
        const portfolioReport = this.portfolioCalculator.generatePortfolioReport(this.strategies);
        const diversification = this.portfolioCalculator.calculateDiversification();
        const allocations = this.portfolioCalculator.optimizeCapitalAllocation();

        return {
            timestamp: new Date().toISOString(),
            version: APP_CONFIG.version,
            portfolioSummary: portfolioReport,
            diversification: diversification,
            capitalAllocation: allocations,
            strategies: this.strategies.map(s => ({
                name: s.name,
                symbol: s.symbol,
                return: s.totalNetProfit,
                sharpeRatio: s.sharpeRatio,
                winRate: s.winRate,
                drawdown: s.drawdown
            }))
        };
    }

    /**
     * Descargar reporte como JSON
     */
    downloadReport() {
        const report = this.generateFullReport();
        const dataStr = JSON.stringify(report, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `portfolio_report_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }

    /**
     * Limpiar recursos
     */
    destroy() {
        this.pauseAutoUpdates();
        
        if (this.domManager) {
            this.domManager.clearStrategiesGrid();
        }
        
        this.strategies = [];
        this.folders = [];
    }
}

// Función para inicializar Chart Manager (si se necesita)
class ChartManager {
    static initHeroChart() {
        const ctx = document.getElementById('heroChart');
        if (!ctx) return;

        // Implementación básica del gráfico del hero
        const data = {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
            datasets: [{
                label: 'Retorno Acumulado',
                data: [0, 2.5, 5.1, 8.3, 12.1, 15.8],
                borderColor: APP_CONFIG.chartColors.primary,
                backgroundColor: APP_CONFIG.chartColors.primary + '20',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        };

        const config = {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { display: false }, y: { display: false } }
            }
        };

        window.heroChart = new Chart(ctx, config);
    }

    static updateHeroChart() {
        if (window.heroChart) {
            const newData = Array.from({length: 6}, () => Math.random() * 20 - 5);
            window.heroChart.data.datasets[0].data = newData;
            window.heroChart.update('active');
        }
    }
}

// Inicializar aplicación cuando el DOM esté listo
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // Esperar a que todos los scripts estén cargados
        const checkScripts = () => {
            if (window.DOMManager && window.PortfolioCalculator) {
                window.TradingHub = new TradingHubApp();
                
                // Inicializar Chart Manager si Chart.js está disponible
                if (typeof Chart !== 'undefined') {
                    ChartManager.initHeroChart();
                }
            } else {
                setTimeout(checkScripts, 100);
            }
        };
        
        checkScripts();
    });

    // Manejo de errores global
    window.addEventListener('error', (e) => {
        console.error('Error no capturado:', e.error);
        if (window.TradingHub) {
            window.TradingHub.showNotification('Error: ' + e.message, 'error');
        }
    });

    // Manejo de errores de recursos
    window.addEventListener('error', (e) => {
        if (e.target.tagName === 'SCRIPT') {
            console.error('Error al cargar script:', e.target.src);
        }
    }, true);

    // Limpiar recursos al salir
    window.addEventListener('beforeunload', () => {
        if (window.TradingHub) {
            window.TradingHub.destroy();
        }
    });
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TradingHubApp, APP_CONFIG };
}
