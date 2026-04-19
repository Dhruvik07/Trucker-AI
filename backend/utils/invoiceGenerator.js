export const generateInvoice = (driverName, distance) => {
    const safeDistance = distance || Math.floor(Math.random() * 500) + 150;
    return {
        invoiceNumber: `INV-${Math.floor(Math.random() * 9000) + 1000}`,
        client: 'Tempe Logistics Hub',
        date: new Date().toLocaleDateString(),
        driverName: driverName || 'Unknown Driver',
        distance: safeDistance,
        lineHaul: (safeDistance * 3).toFixed(2),
        fuelSurcharge: (safeDistance * 0.25).toFixed(2),
        total: (safeDistance * 3.25).toFixed(2)
    };
};
