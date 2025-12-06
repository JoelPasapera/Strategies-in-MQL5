/**
 * Estrategia Scalping - Módulo JavaScript
 * Gestión específica de la estrategia de scalping EUR/USD
 */

// Configuración específica de la estrategia
const STRATEGY_CONFIG = {
    id: 'scalping-eurusd',
    name: 'Estrategia Scalping EUR/USD',
    pair: 'EUR/USD',
    timeframe: '5m',
    status: 'active',
    updateInterval: 5000, // 5 segundos para actualizaciones en tiempo real
    chartColors: {
        primary: '#10b981',
        secondary: '#06b6d4',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b'
    }
};

// Utilidades específicas de la estrategia
const StrategyUtils = {
    // Formatear precios de forex
    formatPrice: (price, decimals = 5) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(price);
    },

    // Formatear pips
    formatPips: (pips) => {
        const symbol = pips >= 0 ? '+' : '';
        return `${symbol}${pips.toFixed(1)} pips`;
    },

    // Generar datos mock de trades
    generateMockTrades: (count = 10) => {
        const trades = [];
        const now = new Date();
        const types = ['BUY', 'SELL'];
        
        for (let i = 0; i < count; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const entryPrice = 1.0850 + (Math.random() - 0.5) * 0.01;
            const pips = (Math.random() - 0.4) * 20; // -8 a +12 pips
            const exitPrice = entryPrice + (pips * 0.0001);
            const lots = 0.1 + Math.random() * 0.4; // 0.1 a 0.5 lotes
            const result = pips * lots * 10; // Aproximación del resultado en USD
            
            trades.push({
                id: `trade_${i}`,
                timestamp: new Date(now.getTime() - (i * 3600000)), // Cada hora
                type: type,
                entryPrice: entryPrice,
                exitPrice: exitPrice,
                lots: lots,
                pips: pips,
                result: result
            });
        }
        
        return trades;
    },

    // Calcular métricas de rendimiento
    calculateMetrics: (trades) => {
        const totalTrades = trades.length;
        const winningTrades = trades.filter(t => t.result > 0).length;
        const losingTrades = trades.filter(t => t.result < 0).length;
        const totalPips = trades.reduce((sum, t) => sum + t.pips, 0);
        const totalResult = trades.reduce((sum, t) => sum + t.result, 0);
        const winRate = (winningTrades / totalTrades) * 100;
        const avgWin = winningTrades > 0 ? trades.filter(t => t.result > 0).reduce((sum, t) => sum + t.result, 0) / winningTrades : 0;
        const avgLoss = losingTrades > 0 ? trades.filter(t => t.result < 0).reduce((sum, t) => sum + t.result, 0) / losingTrades : 0;
        
        return {
            totalTrades,
            winningTrades,
            losingTrades,
            totalPips,
            totalResult,
            winRate,
            avgWin,
            avgLoss
        };
    }
};

// Gestión de datos de la estrategia
const StrategyData = {
    trades: [],
    metrics: {},
    
    // Inicializar datos de la estrategia
    init: () => {
        StrategyData.trades = StrategyUtils.generateMockTrades(15);
        StrategyData.metrics = StrategyUtils.calculateMetrics(StrategyData.trades);
        StrategyData.updateUI();
    },
    
    // Actualizar interfaz con datos
    updateUI: () => {
        StrategyUI.updateTradesTable(StrategyData.trades);
        StrategyUI.updateMetrics(StrategyData.metrics);
    },
    
    // Añadir nueva operación
    addTrade: (trade) => {
        StrategyData.trades.unshift(trade);
        if (StrategyData.trades.length > 20) {
            StrategyData.trades = StrategyData.trades.slice(0, 20);
        }
        StrategyData.metrics = StrategyUtils.calculateMetrics(StrategyData.trades);
        StrategyData.updateUI();
    }
};

// Gestión de la interfaz de la estrategia
const StrategyUI = {
    // Actualizar tabla de operaciones
    updateTradesTable: (trades) => {
        const tbody = document.getElementById('tradesTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = trades.map(trade => `
            <tr>
                <td>${StrategyUtils.formatDate(trade.timestamp)}</td>
                <td class="trade-type-${trade.type.toLowerCase()}">${trade.type}</td>
                <td>${StrategyUtils.formatPrice(trade.entryPrice)}</td>
                <td>${StrategyUtils.formatPrice(trade.exitPrice)}</td>
                <td>${trade.lots.toFixed(2)}</td>
                <td class="${trade.pips >= 0 ? 'trade-result-positive' : 'trade-result-negative'}">
                    ${StrategyUtils.formatPips(trade.pips)}
                </td>
                <td class="${trade.result >= 0 ? 'trade-result-positive' : 'trade-result-negative'}">
                    $${trade.result.toFixed(2)}
                </td>
            </tr>
        `).join('');
    },
    
    // Actualizar métricas
    updateMetrics: (metrics) => {
        // Actualizar las tarjetas de métricas con animación
        const metricCards = document.querySelectorAll('.metric-card');
        metricCards.forEach((card, index) => {
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
                card.style.transform = 'scale(1)';
            }, index * 100);
        });
    },
    
    // Mostrar notificación
    showNotification: (message, type = 'info') => {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Estilos para la notificación
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
        
        // Color según tipo
        const colors = {
            info: '#06b6d4',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
};

// Gestión de gráficos de la estrategia
const StrategyCharts = {
    equityChart: null,
    distributionChart: null,
    
    // Inicializar gráficos
    init: () => {
        StrategyCharts.initEquityChart();
        StrategyCharts.initDistributionChart();
    },
    
    // Gráfico de evolución del capital
    initEquityChart: () => {
        const ctx = document.getElementById('equityChart');
        if (!ctx) return;
        
        // Generar datos mock de equity
        const labels = [];
        const data = [];
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        
        let currentEquity = 10000; // Capital inicial
        
        for (let i = 0; i < 30; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            labels.push(date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }));
            
            // Simular crecimiento del capital
            const dailyReturn = (Math.random() - 0.45) * 0.02; // Sesgo positivo
            currentEquity *= (1 + dailyReturn);
            data.push(currentEquity);
        }
        
        const chartData = {
            labels: labels,
            datasets: [{
                label: 'Capital',
                data: data,
                borderColor: STRATEGY_CONFIG.chartColors.primary,
                backgroundColor: STRATEGY_CONFIG.chartColors.primary + '20',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: STRATEGY_CONFIG.chartColors.primary,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5
            }]
        };
        
        const config = {
            type: 'line',
            data: chartData,
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
                        borderColor: STRATEGY_CONFIG.chartColors.primary,
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: (context) => {
                                return `Capital: $${context.parsed.y.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(71, 85, 105, 0.3)'
                        },
                        ticks: {
                            color: '#94a3b8'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(71, 85, 105, 0.3)'
                        },
                        ticks: {
                            color: '#94a3b8',
                            callback: (value) => '$' + value.toFixed(0)
                        }
                    }
                }
            }
        };
        
        StrategyCharts.equityChart = new Chart(ctx, config);
    },
    
    // Gráfico de distribución de operaciones
    initDistributionChart: () => {
        const ctx = document.getElementById('distributionChart');
        if (!ctx) return;
        
        const data = {
            labels: ['Ganadoras', 'Perdedoras'],
            datasets: [{
                data: [72, 28], // Porcentajes
                backgroundColor: [
                    STRATEGY_CONFIG.chartColors.success,
                    STRATEGY_CONFIG.chartColors.danger
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        };
        
        const config = {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#cbd5e1',
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(30, 41, 59, 0.9)',
                        titleColor: '#f8fafc',
                        bodyColor: '#cbd5e1',
                        borderColor: STRATEGY_CONFIG.chartColors.primary,
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                            label: (context) => {
                                return `${context.label}: ${context.parsed}%`;
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        };
        
        StrategyCharts.distributionChart = new Chart(ctx, config);
    },
    
    // Actualizar gráficos
    updateCharts: () => {
        if (StrategyCharts.equityChart) {
            // Simular nueva actualización de datos
            const newData = StrategyCharts.equityChart.data.datasets[0].data;
            const lastValue = newData[newData.length - 1];
            const newValue = lastValue * (1 + (Math.random() - 0.5) * 0.002);
            
            newData.push(newValue);
            if (newData.length > 30) {
                newData.shift();
            }
            
            StrategyCharts.equityChart.update('active');
        }
    }
};

// Funciones auxiliares adicionales
StrategyUtils.formatDate = (date) => {
    return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

// Gestión de eventos de la estrategia
const StrategyEvents = {
    // Inicializar event listeners
    init: () => {
        // Botones de control de estrategia
        document.getElementById('startStrategy')?.addEventListener('click', () => {
            StrategyEvents.handleStartStrategy();
        });
        
        document.getElementById('pauseStrategy')?.addEventListener('click', () => {
            StrategyEvents.handlePauseStrategy();
        });
        
        document.getElementById('stopStrategy')?.addEventListener('click', () => {
            StrategyEvents.handleStopStrategy();
        });
        
        // Botón de refrescar trades
        document.getElementById('refreshTrades')?.addEventListener('click', () => {
            StrategyEvents.handleRefreshTrades();
        });
        
        // Controles del gráfico
        document.querySelectorAll('.btn-chart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                StrategyEvents.handleChartPeriodChange(e.target.dataset.period);
            });
        });
    },
    
    // Manejar inicio de estrategia
    handleStartStrategy: () => {
        StrategyUI.showNotification('Estrategia iniciada correctamente', 'success');
        
        // Actualizar UI
        const startBtn = document.getElementById('startStrategy');
        const pauseBtn = document.getElementById('pauseStrategy');
        
        startBtn.disabled = true;
        startBtn.style.opacity = '0.5';
        pauseBtn.disabled = false;
        pauseBtn.style.opacity = '1';
        
        // Iniciar actualizaciones en tiempo real
        StrategyEvents.startRealTimeUpdates();
    },
    
    // Manejar pausa de estrategia
    handlePauseStrategy: () => {
        StrategyUI.showNotification('Estrategia pausada', 'warning');
        
        // Actualizar UI
        const startBtn = document.getElementById('startStrategy');
        const pauseBtn = document.getElementById('pauseStrategy');
        
        startBtn.disabled = false;
        startBtn.style.opacity = '1';
        pauseBtn.disabled = true;
        pauseBtn.style.opacity = '0.5';
        
        // Detener actualizaciones en tiempo real
        StrategyEvents.stopRealTimeUpdates();
    },
    
    // Manejar detención de estrategia
    handleStopStrategy: () => {
        if (confirm('¿Estás seguro de que quieres detener la estrategia?')) {
            StrategyUI.showNotification('Estrategia detenida', 'error');
            
            // Actualizar UI
            const startBtn = document.getElementById('startStrategy');
            const pauseBtn = document.getElementById('pauseStrategy');
            
            startBtn.disabled = false;
            startBtn.style.opacity = '1';
            pauseBtn.disabled = true;
            pauseBtn.style.opacity = '0.5';
            
            // Detener actualizaciones
            StrategyEvents.stopRealTimeUpdates();
        }
    },
    
    // Manejar refresco de trades
    handleRefreshTrades: () => {
        const refreshBtn = document.getElementById('refreshTrades');
        const icon = refreshBtn.querySelector('i');
        
        // Animar icono
        icon.style.transition = 'transform 0.5s ease';
        icon.style.transform = 'rotate(360deg)';
        
        // Generar nuevos trades
        setTimeout(() => {
            const newTrades = StrategyUtils.generateMockTrades(5);
            newTrades.forEach(trade => StrategyData.addTrade(trade));
            
            icon.style.transform = 'rotate(0deg)';
            StrategyUI.showNotification('Trades actualizados', 'info');
        }, 500);
    },
    
    // Manejar cambio de período del gráfico
    handleChartPeriodChange: (period) => {
        // Actualizar botones activos
        document.querySelectorAll('.btn-chart').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.querySelector(`[data-period="${period}"]`).classList.add('active');
        
        // Actualizar gráfico según período
        StrategyUI.showNotification(`Período cambiado a ${period}`, 'info');
        
        // Aquí se actualizarían los datos del gráfico según el período seleccionado
        StrategyCharts.updateCharts();
    },
    
    // Iniciar actualizaciones en tiempo real
    startRealTimeUpdates: () => {
        StrategyEvents.updateInterval = setInterval(() => {
            // Simular nueva operación aleatoria
            if (Math.random() < 0.3) { // 30% de probabilidad
                const newTrade = StrategyUtils.generateMockTrades(1)[0];
                StrategyData.addTrade(newTrade);
                StrategyCharts.updateCharts();
            }
        }, STRATEGY_CONFIG.updateInterval);
    },
    
    // Detener actualizaciones en tiempo real
    stopRealTimeUpdates: () => {
        if (StrategyEvents.updateInterval) {
            clearInterval(StrategyEvents.updateInterval);
            StrategyEvents.updateInterval = null;
        }
    }
};

// Inicialización de la estrategia
document.addEventListener('DOMContentLoaded', () => {
    console.log(`Estrategia Scalping v1.0 - Iniciando...`);
    
    // Inicializar componentes
    StrategyEvents.init();
    StrategyData.init();
    StrategyCharts.init();
    
    // Deshabilitar botón de pausa inicialmente
    document.getElementById('pauseStrategy').disabled = true;
    document.getElementById('pauseStrategy').style.opacity = '0.5';
    
    console.log('Estrategia inicializada correctamente');
});

// Manejo de errores global
window.addEventListener('error', (e) => {
    console.error('Error en la estrategia:', e.error);
    StrategyUI.showNotification('Error en la estrategia: ' + e.message, 'error');
});

// Exportar para uso en otros módulos
window.ScalpingStrategy = {
    STRATEGY_CONFIG,
    StrategyUtils,
    StrategyData,
    StrategyUI,
    StrategyCharts,
    StrategyEvents
};