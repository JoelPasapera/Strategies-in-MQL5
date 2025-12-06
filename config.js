/**
 * Configuración centralizada de estrategias
 * Para añadir nueva carpeta: solo añade un objeto al array
 */
export const strategiesConfig = [
    {
        id: 'estrategia-momentum',
        name: 'Momentum Strategy',
        description: 'Estrategia basada en impulso de precios y volumen',
        folder: 'strategies/estrategia-momentum',
        status: 'active',
        metrics: {
            winRate: '68%',
            trades: 145
        }
    },
    {
        id: 'estrategia-scalping',
        name: 'Scalping FX',
        description: 'Operaciones rápidas en pares de divisas menores',
        folder: 'strategies/estrategia-scalping',
        status: 'active',
        metrics: {
            winRate: '72%',
            trades: 892
        }
    },
    {
        id: 'estrategia-mean-reversion',
        name: 'Mean Reversion',
        description: 'Reversión a la media en ETFs',
        folder: 'strategies/estrategia-mean-reversion',
        status: 'inactive',
        metrics: {
            winRate: '55%',
            trades: 67
        }
    }
];
