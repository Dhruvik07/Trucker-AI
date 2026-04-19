import React from 'react';
import { DollarSign, TrendingDown } from 'lucide-react';

export const CostImpactCard = ({ driver }) => {
    if (!driver || driver.savingsVsNext === undefined) return null;

    const isHighestSavings = driver.savingsVsNext > 0;

    return (
        <div className="flex-col gap-2 mt-3 p-3 rounded" style={{ background: isHighestSavings ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)', border: `1px solid ${isHighestSavings ? 'var(--success)' : 'transparent'}` }}>
            <div className="flex-row items-center justify-between">
                <span className="flex-row items-center gap-2" style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                    <DollarSign size={14} color={isHighestSavings ? 'var(--success)' : 'var(--text-muted)'} /> Estimated Fuel
                </span>
                <span style={{ fontWeight: 'bold' }}>${driver.estimatedFuelCost}</span>
            </div>

            {isHighestSavings && (
                <div className="flex-row items-center justify-between" style={{ color: 'var(--success)', fontSize: '0.85rem' }}>
                    <span className="flex-row items-center gap-1"><TrendingDown size={14} /> Savings vs option #2</span>
                    <span style={{ fontWeight: 'bold' }}>+${driver.savingsVsNext}</span>
                </div>
            )}

            <div className="flex-row items-center justify-between mt-1 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Deadhead miles: {driver.deadheadMiles} mi</span>
            </div>
        </div>
    );
};

export default CostImpactCard;
