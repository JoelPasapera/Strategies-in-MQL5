/**
 * Trading Strategy Hub - Main Application
 * Arquitectura modular y extensible para gestión de estrategias de trading
 */

// Configuración principal de la aplicación
const CONFIG = {
    version: '1.0.0',
    apiEndpoint: '/api',
    updateInterval: 30000, // 30 segundos
    animationDuration: 300,
    chartColors: {
        primary: '#2563eb',
        secondary: '#06b6d4',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444'
    },
    folders: [
        { id: 'estrategia1', name: 'Estrategia Scalping', path: 'estrategia1/', status: 'active' },
        { id: 'estrategia2', name: 'Estrategia Swing', path: 'estrategia2/', status: 'testing' }
    ]
};

// Utilidades y funciones auxiliares
const Utils = {
    // Formatear números con separadores de miles y decimales
    formatNumber: (num, decimals = 2) => {
        return new Intl.NumberFormat('es-ES', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(num);
    },

    // Formatear porcentajes
    formatPercentage: (num, decimals = 1) => {
        const symbol = num >= 0 ? '+' : '';
        return `${symbol}${num.toFixed(decimals)}%`;
    },

    // Generar color basado en rendimiento
    getPerformanceColor: (value) => {
        if (value > 0) return CONFIG.chartColors.success;
        if (value < 0) return CONFIG.chartColors.danger;
        return CONFIG.chartColors.warning;
    },

    // Animar contadores
    animateCounter: (element, target, duration = 1000) => {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    },

    // Mostrar/ocultar overlay de carga
    toggleLoading: (show) => {
        const overlay = document.getElementById('loadingOverlay');
        if (show) {
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
        }
    },

    // Debounce para optimizar eventos
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Generar datos mock para demostración
    generateMockData: () => {
        const strategies = [
            {
                id: 'scalping-eurusd',
                name: 'Scalping EUR/USD',
                subtitle: 'Operaciones intradía con EUR/USD',
                status: 'active',
                return: 15.3,
                drawdown: -5.2,
                sharpe: 1.67,
                winRate: 72,
                trades: 145,
                folder: 'estrategia1'
            },
            {
                id: 'swing-gold',
                name: 'Swing Trading Gold',
                subtitle: 'Posiciones medianas plazo en oro',
                status: 'testing',
                return: 8.7,
                drawdown: -12.1,
                sharpe: 1.23,
                winRate: 58,
                trades: 23,
                folder: 'estrategia2'
            },
            {
                id: 'trend-btc',
                name: 'Trend Following BTC',
                subtitle: 'Seguimiento de tendencias Bitcoin',
                status: 'active',
                return: 22.1,
                drawdown: -18.5,
                sharpe: 1.89,
                winRate: 65,
                trades: 67,
                folder: 'estrategia1'
            },
            {
                id: 'mean-reversion',
                name: 'Mean Reversion SPY',
                subtitle: 'Reversión a la media en SPY',
                status: 'inactive',
                return: -2.3,
                drawdown: -15.8,
                sharpe: 0.45,
                winRate: 42,
                trades: 89,
                folder: 'estrategia2'
            }
        ];
        return strategies;
    }
};

// Gestión de datos y estado de la aplicación
const DataManager = {
    strategies: [],
    folders: CONFIG.folders,
    
    // Inicializar datos
    init: async () => {
        try {
            Utils.toggleLoading(true);
            
            // Simular carga de datos
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            DataManager.strategies = Utils.generateMockData();
            DataManager.updateUI();
            
            Utils.toggleLoading(false);
        } catch (error) {
            console.error('Error al inicializar datos:', error);
            Utils.toggleLoading(false);
        }
    },

    // Actualizar interfaz con datos
    updateUI: () => {
        const totalStrategies = DataManager.strategies.length;
        const totalFolders = DataManager.folders.length;
        
        // Actualizar contadores del header
        Utils.animateCounter(document.getElementById('totalStrategies'), totalStrategies);
        Utils.animateCounter(document.getElementById('totalFolders'), totalFolders);
        
        // Renderizar grid de estrategias
        UIManager.renderStrategiesGrid(DataManager.strategies);
        
        // Actualizar gráfico del hero
        ChartManager.updateHeroChart();
    },

    // Filtrar estrategias
    filterStrategies: (filter) => {
        let filtered = DataManager.strategies;
        
        switch (filter) {
            case 'high':
                filtered = DataManager.strategies.filter(s => s.return > 10);
                break;
            case 'medium':
                filtered = DataManager.strategies.filter(s => s.return >= 0 && s.return <= 10);
                break;
            case 'low':
                filtered = DataManager.strategies.filter(s => s.return < 0);
                break;
            default:
                filtered = DataManager.strategies;
        }
        
        UIManager.renderStrategiesGrid(filtered);
    },

    // Redirigir a estrategia específica
    navigateToStrategy: (folderPath) => {
        window.location.href = folderPath;
    }
};

// Gestión de la interfaz de usuario
const UIManager = {
    // Renderizar grid de estrategias
    renderStrategiesGrid: (strategies) => {
        const grid = document.getElementById('strategiesGrid');
        
        if (strategies.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-line"></i>
                    <h3>No se encontraron estrategias</h3>
                    <p>Intenta ajustar los filtros o añadir nuevas estrategias</p>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = strategies.map(strategy => `
            <div class="strategy-card" data-id="${strategy.id}" data-folder="${strategy.folder}">
                <div class="strategy-header">
                    <div>
                        <h4 class="strategy-title">${strategy.name}</h4>
                        <p class="strategy-subtitle">${strategy.subtitle}</p>
                    </div>
                    <span class="strategy-status status-${strategy.status}">${strategy.status}</span>
                </div>
                
                <div class="strategy-metrics">
                    <div class="metric-item">
                        <div class="metric-label">Retorno</div>
                        <div class="metric-value ${strategy.return >= 0 ? 'positive' : 'negative'}">
                            ${Utils.formatPercentage(strategy.return)}
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-label">Drawdown</div>
                        <div class="metric-value negative">
                            ${Utils.formatPercentage(strategy.drawdown)}
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-label">Sharpe</div>
                        <div class="metric-value">${strategy.sharpe.toFixed(2)}</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-label">Win Rate</div>
                        <div class="metric-value">${strategy.winRate}%</div>
                    </div>
                </div>
                
                <div class="strategy-actions">
                    <button class="btn btn-primary btn-small" onclick="DataManager.navigateToStrategy('${strategy.folder}/')">
                        <i class="fas fa-external-link-alt"></i>
                        Ver Detalles
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="UIManager.showStrategyDetails('${strategy.id}')">
                        <i class="fas fa-info-circle"></i>
                        Info
                    </button>
                </div>
            </div>
        `).join('');
        
        // Añadir animaciones de entrada
        const cards = grid.querySelectorAll('.strategy-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.3s ease-out';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    },

    // Mostrar detalles de estrategia
    showStrategyDetails: (strategyId) => {
        const strategy = DataManager.strategies.find(s => s.id === strategyId);
        if (!strategy) return;
        
        // Crear modal de detalles (simplificado para este ejemplo)
        alert(`Detalles de ${strategy.name}:\n\n` +
              `Retorno: ${Utils.formatPercentage(strategy.return)}\n` +
              `Drawdown: ${Utils.formatPercentage(strategy.drawdown)}\n` +
              `Ratio Sharpe: ${strategy.sharpe.toFixed(2)}\n` +
              `Win Rate: ${strategy.winRate}%\n` +
              `Total Operaciones: ${strategy.trades}`);
    },

    // Actualizar métricas de rendimiento
    updatePerformanceMetrics: () => {
        const strategies = DataManager.strategies;
        
        if (strategies.length === 0) return;
        
        const avgReturn = strategies.reduce((sum, s) => sum + s.return, 0) / strategies.length;
        const maxDrawdown = Math.min(...strategies.map(s => s.drawdown));
        const avgSharpe = strategies.reduce((sum, s) => sum + s.sharpe, 0) / strategies.length;
        const avgWinRate = strategies.reduce((sum, s) => sum + s.winRate, 0) / strategies.length;
        
        document.getElementById('avgReturn').textContent = Utils.formatPercentage(avgReturn);
        document.getElementById('maxDrawdown').textContent = Utils.formatPercentage(maxDrawdown);
        document.getElementById('sharpeRatio').textContent = avgSharpe.toFixed(2);
        document.getElementById('winRate').textContent = Math.round(avgWinRate) + '%';
    }
};

// Gestión de gráficos y visualizaciones
const ChartManager = {
    heroChart: null,
    
    // Inicializar gráfico del hero
    initHeroChart: () => {
        const ctx = document.getElementById('heroChart');
        if (!ctx) return;
        
        // Datos mock para el gráfico
        const data = {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
            datasets: [{
                label: 'Retorno Acumulado',
                data: [0, 2.5, 5.1, 8.3, 12.1, 15.8],
                borderColor: CONFIG.chartColors.primary,
                backgroundColor: CONFIG.chartColors.primary + '20',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: CONFIG.chartColors.primary,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        };
        
        const config = {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(30, 41, 59, 0.9)',
                        titleColor: '#f8fafc',
                        bodyColor: '#cbd5e1',
                        borderColor: CONFIG.chartColors.primary,
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: (context) => {
                                return `Retorno: ${Utils.formatPercentage(context.parsed.y)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        display: false
                    }
                },
                elements: {
                    point: {
                        hoverBackgroundColor: CONFIG.chartColors.primary
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        };
        
        ChartManager.heroChart = new Chart(ctx, config);
    },
    
    // Actualizar gráfico del hero
    updateHeroChart: () => {
        if (!ChartManager.heroChart) {
            ChartManager.initHeroChart();
            return;
        }
        
        // Simular actualización de datos
        const newData = Array.from({length: 6}, () => Math.random() * 20 - 5);
        ChartManager.heroChart.data.datasets[0].data = newData;
        ChartManager.heroChart.update('active');
    }
};

// Gestión de eventos y interacciones
const EventManager = {
    // Inicializar todos los event listeners
    init: () => {
        // Botón de explorar estrategias
        document.getElementById('exploreBtn')?.addEventListener('click', () => {
            document.getElementById('strategiesGrid').scrollIntoView({ 
                behavior: 'smooth' 
            });
        });
        
        // Botón de añadir nueva estrategia
        document.getElementById('addStrategyBtn')?.addEventListener('click', () => {
            UIManager.showAddStrategyModal();
        });
        
        // Filtro de rendimiento
        document.getElementById('performanceFilter')?.addEventListener('change', (e) => {
            DataManager.filterStrategies(e.target.value);
        });
        
        // Botón de refrescar
        document.getElementById('refreshBtn')?.addEventListener('click', () => {
            EventManager.handleRefresh();
        });
        
        // Eventos de teclado
        document.addEventListener('keydown', EventManager.handleKeyboard);
        
        // Eventos de redimensionamiento
        window.addEventListener('resize', Utils.debounce(() => {
            ChartManager.heroChart?.resize();
        }, 250));
    },
    
    // Manejar refresco de datos
    handleRefresh: () => {
        const refreshBtn = document.getElementById('refreshBtn');
        const icon = refreshBtn.querySelector('i');
        
        // Animar icono de refresco
        icon.style.transition = 'transform 0.5s ease';
        icon.style.transform = 'rotate(360deg)';
        
        // Recargar datos
        DataManager.init().then(() => {
            setTimeout(() => {
                icon.style.transform = 'rotate(0deg)';
            }, 500);
        });
    },
    
    // Manejar eventos de teclado
    handleKeyboard: (e) => {
        // Atajos de teclado
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'r':
                    e.preventDefault();
                    EventManager.handleRefresh();
                    break;
                case 'n':
                    e.preventDefault();
                    UIManager.showAddStrategyModal();
                    break;
            }
        }
        
        // Escape para cerrar modales
        if (e.key === 'Escape') {
            UIManager.closeModals();
        }
    }
};

// Funciones adicionales de UI
UIManager.showAddStrategyModal = () => {
    alert('Función de añadir nueva estrategia - En desarrollo\n\n' +
          'Esta función permitirá:\n' +
          '• Crear nuevas carpetas de estrategias\n' +
          '• Configurar parámetros de trading\n' +
          '• Importar datos históricos\n' +
          '• Definir reglas de entrada/salida');
};

UIManager.closeModals = () => {
    // Cerrar cualquier modal abierto
    console.log('Cerrando modales...');
};

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
    console.log(`Trading Strategy Hub v${CONFIG.version} - Iniciando...`);
    
    // Inicializar componentes
    EventManager.init();
    DataManager.init();
    
    // Actualizar métricas de rendimiento
    setTimeout(() => {
        UIManager.updatePerformanceMetrics();
    }, 1500);
    
    // Configurar actualizaciones periódicas
    setInterval(() => {
        DataManager.updateUI();
        UIManager.updatePerformanceMetrics();
    }, CONFIG.updateInterval);
    
    console.log('Aplicación inicializada correctamente');
});

// Manejo de errores global
window.addEventListener('error', (e) => {
    console.error('Error no capturado:', e.error);
    Utils.toggleLoading(false);
});

// Exportar para uso en otros módulos
window.TradingHub = {
    CONFIG,
    Utils,
    DataManager,
    UIManager,
    ChartManager,
    EventManager
};
