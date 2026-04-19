import { generateInvoice } from '../utils/invoiceGenerator.js';

export const submitBilling = (req, res) => {
    try {
        const { driverName, distance } = req.body;
        const invoice = generateInvoice(driverName, distance);
        res.json({ success: true, ...invoice });
    } catch (e) {
        res.status(500).json({ error: String(e) });
    }
};
