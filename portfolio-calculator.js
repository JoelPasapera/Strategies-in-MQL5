/**
 * Portfolio Calculator - Módulo dedicado a cálculos del portafolio
 * Responsabilidad: Todas las operaciones matemáticas y análisis de rendimiento
 */

class PortfolioCalculator {
    constructor() {
        this.strategies = [];
        this.portfolioMetrics = {};
        this.init();
    }

    init() {
        this.resetMetrics();
    }

    /**
     * Resetear métricas del portafolio
     */
    resetMetrics() {
        this.portfolioMetrics = {
            totalReturn: 0,
            totalDrawdown: 0,
            avgSharpeRatio: 0,
            avgWinRate: 0,
            totalTrades: 0,
            portfolioValue: 0,
            riskMetrics: {},
            performanceRatios: {}
        };
    }

    /**
     * Calcular métricas del portafolio
     */
    calculatePortfolioMetrics(strategies) {
        this.strategies = strategies;
        this.resetMetrics();

        if (strategies.length === 0) {
            return this.portfolioMetrics;
        }

        // Calcular métricas agregadas
        this.calculateTotalReturn();
        this.calculateAverageDrawdown();
        this.calculateAverageSharpeRatio();
        this.calculateAverageWinRate();
        this.calculateTotalTrades();
        this.calculateRiskMetrics();
        this.calculatePerformanceRatios();

        return this.portfolioMetrics;
    }

    /**
     * Calcular retorno total del portafolio
     */
    calculateTotalReturn() {
        let totalReturn = 0;
        let totalWeight = 0;

        this.strategies.forEach(strategy => {
            const returnValue = this.parseReturnValue(strategy.totalNetProfit);
            const weight = this.calculateStrategyWeight(strategy);
            
            totalReturn += returnValue * weight;
            totalWeight += weight;
        });

        this.portfolioMetrics.totalReturn = totalWeight > 0 ? totalReturn / totalWeight : 0;
    }

    /**
     * Calcular drawdown promedio
     */
    calculateAverageDrawdown() {
        let totalDrawdown = 0;
        let validStrategies = 0;

        this.strategies.forEach(strategy => {
            if (strategy.drawdown > 0) {
                totalDrawdown += strategy.drawdown;
                validStrategies++;
            }
        });

        this.portfolioMetrics.totalDrawdown = validStrategies > 0 ? totalDrawdown / validStrategies : 0;
    }

    /**
     * Calcular Sharpe ratio promedio
     */
    calculateAverageSharpeRatio() {
        let totalSharpe = 0;
        let validStrategies = 0;

        this.strategies.forEach(strategy => {
            const sharpeValue = this.parseSharpeRatio(strategy.sharpeRatio);
            if (sharpeValue > 0) {
                totalSharpe += sharpeValue;
                validStrategies++;
            }
        });

        this.portfolioMetrics.avgSharpeRatio = validStrategies > 0 ? totalSharpe / validStrategies : 0;
    }

    /**
     * Calcular win rate promedio
     */
    calculateAverageWinRate() {
        let totalWinRate = 0;
        let validStrategies = 0;

        this.strategies.forEach(strategy => {
            if (strategy.winRate > 0) {
                totalWinRate += strategy.winRate;
                validStrategies++;
            }
        });

        this.portfolioMetrics.avgWinRate = validStrategies > 0 ? totalWinRate / validStrategies : 0;
    }

    /**
     * Calcular total de operaciones
     */
    calculateTotalTrades() {
        let totalTrades = 0;

        this.strategies.forEach(strategy => {
            const trades = this.parseTotalTrades(strategy.totalTrades);
            totalTrades += trades;
        });

        this.portfolioMetrics.totalTrades = totalTrades;
    }

    /**
     * Calcular métricas de riesgo
     */
    calculateRiskMetrics() {
        const returns = this.strategies.map(s => this.parseReturnValue(s.totalNetProfit));
        const drawdowns = this.strategies.map(s => s.drawdown).filter(d => d > 0);

        this.portfolioMetrics.riskMetrics = {
            volatility: this.calculateVolatility(returns),
            maxDrawdown: Math.max(...drawdowns, 0),
            var95: this.calculateVaR(returns, 0.05),
            expectedShortfall: this.calculateExpectedShortfall(returns, 0.05)
        };
    }

    /**
     * Calcular ratios de rendimiento
     */
    calculatePerformanceRatios() {
        const totalReturn = this.portfolioMetrics.totalReturn;
        const volatility = this.portfolioMetrics.riskMetrics.volatility;
        const maxDrawdown = this.portfolioMetrics.riskMetrics.maxDrawdown;

        this.portfolioMetrics.performanceRatios = {
            returnToVolatility: volatility > 0 ? totalReturn / volatility : 0,
            returnToDrawdown: maxDrawdown > 0 ? totalReturn / maxDrawdown : 0,
            calmarRatio: maxDrawdown > 0 ? totalReturn / maxDrawdown : 0,
            sterlingRatio: this.calculateSterlingRatio(),
            burkeRatio: this.calculateBurkeRatio()
        };
    }

    /**
     * Calcular peso de estrategia basado en rendimiento
     */
    calculateStrategyWeight(strategy) {
        const returnValue = Math.abs(this.parseReturnValue(strategy.totalNetProfit));
        const sharpeValue = this.parseSharpeRatio(strategy.sharpeRatio);
        const winRateValue = strategy.winRate / 100;

        // Ponderación basada en múltiples factores
        const weight = (returnValue * 0.4) + (sharpeValue * 30) + (winRateValue * 1000);
        return Math.max(weight, 1); // Mínimo peso de 1
    }

    /**
     * Parsear valor de retorno de string a número
     */
    parseReturnValue(returnText) {
        if (!returnText || returnText === 'N/A') return 0;
        
        // Manejar diferentes formatos: "24 569.10", "$24,569.10", etc.
        const cleanText = returnText.replace(/[^\d.-]/g, '');
        return parseFloat(cleanText) || 0;
    }

    /**
     * Parsear Sharpe ratio de string a número
     */
    parseSharpeRatio(sharpeText) {
        if (!sharpeText || sharpeText === 'N/A') return 0;
        
        const cleanText = sharpeText.toString().replace(/[^\d.]/g, '');
        return parseFloat(cleanText) || 0;
    }

    /**
     * Parsear total de trades de string a número
     */
    parseTotalTrades(tradesText) {
        if (!tradesText || tradesText === 'N/A') return 0;
        
        const cleanText = tradesText.replace(/[^\d]/g, '');
        return parseInt(cleanText) || 0;
    }

    /**
     * Calcular volatilidad (desviación estándar)
     */
    calculateVolatility(returns) {
        if (returns.length === 0) return 0;

        const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
        const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
        
        return Math.sqrt(variance);
    }

    /**
     * Calcular Value at Risk (VaR)
     */
    calculateVaR(returns, confidenceLevel) {
        if (returns.length === 0) return 0;

        const sortedReturns = [...returns].sort((a, b) => a - b);
        const index = Math.floor(confidenceLevel * sortedReturns.length);
        
        return sortedReturns[index] || 0;
    }

    /**
     * Calcular Expected Shortfall (ES)
     */
    calculateExpectedShortfall(returns, confidenceLevel) {
        if (returns.length === 0) return 0;

        const varValue = this.calculateVaR(returns, confidenceLevel);
        const tailReturns = returns.filter(r => r <= varValue);
        
        return tailReturns.length > 0 
            ? tailReturns.reduce((sum, r) => sum + r, 0) / tailReturns.length 
            : 0;
    }

    /**
     * Calcular Sterling Ratio
     */
    calculateSterlingRatio() {
        const averageDrawdown = this.portfolioMetrics.riskMetrics.maxDrawdown;
        const annualizedReturn = this.portfolioMetrics.totalReturn * 12; // Asumiendo retorno mensual
        
        return averageDrawdown > 0 ? annualizedReturn / averageDrawdown : 0;
    }

    /**
     * Calcular Burke Ratio
     */
    calculateBurkeRatio() {
        const returns = this.strategies.map(s => this.parseReturnValue(s.totalNetProfit));
        const squaredDrawdowns = returns.filter(r => r < 0).map(r => Math.pow(r, 2));
        
        if (squaredDrawdowns.length === 0) return 0;
        
        const burkeDenominator = Math.sqrt(squaredDrawdowns.reduce((sum, d) => sum + d, 0));
        const annualizedReturn = this.portfolioMetrics.totalReturn * 12;
        
        return burkeDenominator > 0 ? annualizedReturn / burkeDenominator : 0;
    }

    /**
     * Calcular correlación entre estrategias
     */
    calculateStrategyCorrelations() {
        const correlations = [];
        
        for (let i = 0; i < this.strategies.length; i++) {
            for (let j = i + 1; j < this.strategies.length; j++) {
                const strategy1 = this.strategies[i];
                const strategy2 = this.strategies[j];
                
                // Aquí iría la lógica para calcular correlación real
                // Por ahora usamos un valor simulado
                const correlation = (Math.random() - 0.5) * 0.4; // -0.2 a 0.2
                
                correlations.push({
                    strategy1: strategy1.name,
                    strategy2: strategy2.name,
                    correlation: correlation
                });
            }
        }
        
        return correlations;
    }

    /**
     * Generar reporte de portafolio
     */
    generatePortfolioReport() {
        return {
            summary: {
                totalStrategies: this.strategies.length,
                totalReturn: this.formatPercentage(this.portfolioMetrics.totalReturn),
                totalDrawdown: this.formatPercentage(this.portfolioMetrics.totalDrawdown),
                sharpeRatio: this.portfolioMetrics.avgSharpeRatio.toFixed(2),
                totalTrades: this.portfolioMetrics.totalTrades
            },
            riskMetrics: {
                volatility: this.formatPercentage(this.portfolioMetrics.riskMetrics.volatility),
                maxDrawdown: this.formatPercentage(this.portfolioMetrics.riskMetrics.maxDrawdown),
                var95: this.formatCurrency(this.portfolioMetrics.riskMetrics.var95),
                expectedShortfall: this.formatCurrency(this.portfolioMetrics.riskMetrics.expectedShortfall)
            },
            performanceRatios: {
                calmarRatio: this.portfolioMetrics.performanceRatios.calmarRatio.toFixed(2),
                sterlingRatio: this.portfolioMetrics.performanceRatios.sterlingRatio.toFixed(2),
                burkeRatio: this.portfolioMetrics.performanceRatios.burkeRatio.toFixed(2)
            },
            correlations: this.calculateStrategyCorrelations()
        };
    }

    /**
     * Formatear porcentaje
     */
    formatPercentage(value) {
        return `${value.toFixed(2)}%`;
    }

    /**
     * Formatear moneda
     */
    formatCurrency(value) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(value);
    }

    /**
     * Calcular métricas de rendimiento promedio
     */
    calculateAveragePerformance() {
        if (this.strategies.length === 0) {
            return {
                avgReturn: '0%',
                avgDrawdown: '0%',
                avgSharpe: '0',
                avgWinRate: '0%'
            };
        }

        return {
            avgReturn: this.formatPercentage(this.portfolioMetrics.totalReturn),
            avgDrawdown: this.formatPercentage(this.portfolioMetrics.totalDrawdown),
            avgSharpe: this.portfolioMetrics.avgSharpeRatio.toFixed(2),
            avgWinRate: this.formatPercentage(this.portfolioMetrics.avgWinRate)
        };
    }

    /**
     * Filtrar estrategias por rendimiento
     */
    filterStrategiesByPerformance(strategies, filter) {
        switch (filter) {
            case 'high':
                return strategies.filter(s => this.parseReturnValue(s.totalNetProfit) > 10000);
            case 'medium':
                return strategies.filter(s => {
                    const returnValue = this.parseReturnValue(s.totalNetProfit);
                    return returnValue >= 0 && returnValue <= 10000;
                });
            case 'low':
                return strategies.filter(s => this.parseReturnValue(s.totalNetProfit) < 0);
            default:
                return strategies;
        }
    }

    /**
     * Calcular diversificación del portafolio
     */
    calculateDiversification() {
        const correlations = this.calculateStrategyCorrelations();
        const avgCorrelation = correlations.length > 0 
            ? correlations.reduce((sum, c) => sum + Math.abs(c.correlation), 0) / correlations.length 
            : 0;

        return {
            averageCorrelation: avgCorrelation,
            diversificationRatio: 1 - avgCorrelation,
            riskReduction: Math.max(0, (1 - avgCorrelation) * 100),
            isWellDiversified: avgCorrelation < 0.3
        };
    }

    /**
     * Optimizar asignación de capital
     */
    optimizeCapitalAllocation() {
        const totalWeight = this.strategies.reduce((sum, strategy) => {
            return sum + this.calculateStrategyWeight(strategy);
        }, 0);

        const allocations = this.strategies.map(strategy => {
            const weight = this.calculateStrategyWeight(strategy);
            const allocationPercentage = (weight / totalWeight) * 100;
            
            return {
                name: strategy.name,
                allocation: allocationPercentage,
                weight: weight
            };
        });

        return allocations.sort((a, b) => b.allocation - a.allocation);
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.PortfolioCalculator = PortfolioCalculator;
}