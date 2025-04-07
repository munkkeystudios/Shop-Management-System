const { Sale, Product } = require('../models');

//new sale
exports.createSale = async (req, res) => {
    try {
        const {
            billNumber,
            customerName,
            customerPhone,
            items,
            subtotal,
            discount,
            tax,
            total,
            paymentMethod,
            amountPaid,
            change,
            notes
        } = req.body;

        //check if items selected
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Sale items are required' });
        }

        //check if product exists and has enough stock
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ message: `Product ${item.product} not found` });
            }
            if (product.quantity < item.quantity) {
                return res.status(400).json({ 
                    message: `Insufficient stock for product ${product.name}. Available: ${product.quantity}` 
                });
            }
            //update product quantity
            product.quantity -= item.quantity;
            await product.save();
        }

        //create sale
        const sale = new Sale({
            billNumber,
            customerName,
            customerPhone,
            items,
            subtotal,
            discount,
            tax,
            total,
            paymentMethod,
            paymentStatus: amountPaid >= total ? 'paid' : 'partial',
            amountPaid,
            change,
            notes,
            createdBy: req.user._id
        });

        await sale.save();
        res.status(201).json(sale);
    } catch (error) {
        console.error('Create sale error:', error);
        res.status(500).json({ message: 'Error creating sale', error: error.message });
    }
};

//get all sales with filtering etc
exports.getSales = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            startDate,
            endDate,
            paymentStatus,
            paymentMethod
        } = req.query;

        const query = {};
        
        //date filter
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        //payment filter
        if (paymentStatus) query.paymentStatus = paymentStatus;
        if (paymentMethod) query.paymentMethod = paymentMethod;

        const sales = await Sale.find(query)
            .populate('items.product', 'name price')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Sale.countDocuments(query);

        res.json({
            sales,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('Get sales error:', error);
        res.status(500).json({ message: 'Error fetching sales', error: error.message });
    }
};

//get a single sale by id
exports.getSaleById = async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id)
            .populate('items.product', 'name price')
            .populate('createdBy', 'name');

        if (!sale) {
            return res.status(404).json({ message: 'Sale not found' });
        }

        res.json(sale);
    } catch (error) {
        console.error('Get sale error:', error);
        res.status(500).json({ message: 'Error fetching sale', error: error.message });
    }
};

//update sale payment status
exports.updatePaymentStatus = async (req, res) => {
    try {
        const { amountPaid } = req.body;
        const sale = await Sale.findById(req.params.id);

        if (!sale) {
            return res.status(404).json({ message: 'Sale not found' });
        }

        sale.amountPaid = amountPaid;
        sale.paymentStatus = amountPaid >= sale.total ? 'paid' : 'partial';
        sale.change = amountPaid - sale.total;

        await sale.save();
        res.json(sale);
    } catch (error) {
        console.error('Update payment status error:', error);
        res.status(500).json({ message: 'Error updating payment status', error: error.message });
    }
};

//sales statistics
exports.getSalesStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = {};

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const stats = await Sale.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: '$total' },
                    totalDiscount: { $sum: '$discount' },
                    totalTax: { $sum: '$tax' },
                    averageSale: { $avg: '$total' },
                    totalTransactions: { $sum: 1 }
                }
            }
        ]);

        const paymentMethodStats = await Sale.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$paymentMethod',
                    count: { $sum: 1 },
                    total: { $sum: '$total' }
                }
            }
        ]);

        res.json({
            overall: stats[0] || {
                totalSales: 0,
                totalDiscount: 0,
                totalTax: 0,
                averageSale: 0,
                totalTransactions: 0
            },
            byPaymentMethod: paymentMethodStats
        });
    } catch (error) {
        console.error('Get sales stats error:', error);
        res.status(500).json({ message: 'Error fetching sales statistics', error: error.message });
    }
}; 