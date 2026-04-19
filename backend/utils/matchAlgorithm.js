export const getDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    const R = 3958.8; // miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export const matchDrivers = (pickupLat, pickupLng, destLat, destLng, isHighPriority, trucks, drivers, fuelPrice = 3.85, truckMpg = 6.5) => {
    const tripDistance = getDistance(pickupLat, pickupLng, destLat, destLng);

    // Combine trucks and drivers to get available vehicles with their driver info
    const availableTruckers = trucks.filter(t => t.driver_id).map(t => {
        const d = drivers.find(drv => drv.id === t.driver_id);
        return { ...t, ...d };
    }).filter(t => t.status === 'AVAILABLE' && t.hos_remaining > 1.0);

    const nearestTrucks = [];
    const optimalDrivers = [];

    availableTruckers.forEach(d => {
        const pickupDistance = getDistance(pickupLat, pickupLng, d.lat, d.lng);
        const etaMins = Math.round((pickupDistance / 40) * 60);

        nearestTrucks.push({ ...d, pickupDistance: Number(pickupDistance.toFixed(1)), etaMins });

        const tripHours = tripDistance / 50;
        let matchScore = 100 - (pickupDistance * 0.5);

        if (isHighPriority) {
            matchScore += 15; // default priority bump
        }

        if (d.hos_remaining < (etaMins / 60 + tripHours)) matchScore -= 80;

        const trafficFactor = ['LOW', 'MODERATE', 'HEAVY'][Math.floor(Math.random() * 3)];
        const weatherNote = ['Clear', 'Clear', 'Rain Expected', 'High Winds'][Math.floor(Math.random() * 4)];

        // Cost Intelligence Logic
        const deadheadMiles = pickupDistance;
        const loadedMiles = tripDistance;
        const totalMiles = deadheadMiles + loadedMiles;
        const estimatedFuelCost = (totalMiles / truckMpg) * fuelPrice;

        if (matchScore > 20) {
            optimalDrivers.push({
                ...d,
                pickupDistance: Number(pickupDistance.toFixed(1)),
                etaMins,
                matchScore: Math.max(0, Math.min(99, Math.round(matchScore))),
                trafficFactor,
                weatherNote,
                tripDistance: Number(tripDistance.toFixed(1)),
                estimatedFuelCost: Number(estimatedFuelCost.toFixed(2)),
                deadheadMiles: Number(deadheadMiles.toFixed(1))
            });
        }
    });

    nearestTrucks.sort((a, b) => a.pickupDistance - b.pickupDistance).splice(6);
    optimalDrivers.sort((a, b) => b.matchScore - a.matchScore).splice(6);

    // Calculate savings for the #1 pick vs #2
    if (optimalDrivers.length > 1) {
        const topFuelCost = optimalDrivers[0].estimatedFuelCost;
        const secondFuelCost = optimalDrivers[1].estimatedFuelCost;
        optimalDrivers[0].savingsVsNext = Number((secondFuelCost - topFuelCost).toFixed(2));
        optimalDrivers[1].savingsVsNext = 0; // Baseline
    }

    return { nearestTrucks, optimalDrivers, tripDistance: Number(tripDistance.toFixed(1)) };
};
