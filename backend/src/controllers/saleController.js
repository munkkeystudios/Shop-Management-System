const { Sale, Product } = require('../models');

//new sale
exports.createSale = async (req, res) => {
    try {
        const {
            billNumber,
            customer,
            items,
            paymentMethod,
            amountPaid,
            notes
        } = req.body;

        //check if items selected
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ 
                success: false,
                message: 'Sale items are required' 
            });
        }

        const processedItems = [];
        let subtotal = 0;
        let totalDiscount = 0;
        let totalTax = 0;

        //check if product exists and has enough stock
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ 
                    success: false,
                    message: `Product ${item.product} not found` 
                });
            }
            if (product.quantity < item.quantity) {
                return res.status(400).json({ 
                    success: false,
                    message: `Insufficient stock for product ${product.name}. Available: ${product.quantity}` 
                });
            }

            //item price with product discount
            const originalPrice = product.price;
            const discountRate = product.discountRate;
            const effectivePrice = originalPrice - (originalPrice * discountRate / 100);
            const itemDiscount = (originalPrice - effectivePrice) * item.quantity;
            
            const taxAmount = (effectivePrice * product.taxRate / 100) * item.quantity;
            
            const itemSubtotal = effectivePrice * item.quantity;
            
            const processedItem = {
                product: item.product,
                quantity: item.quantity,
                price: originalPrice,
                productDiscountRate: discountRate,
                effectivePrice: effectivePrice,
                subtotal: itemSubtotal
            };
            
            processedItems.push(processedItem);
            subtotal += itemSubtotal;
            totalDiscount += itemDiscount;
            totalTax += taxAmount;
            
            //update product quantity
            product.quantity -= item.quantity;
            await product.save();
        }

        //final amounts
        const total = subtotal + totalTax;
        
        const paymentStatus = amountPaid >= total ? 'paid' : (amountPaid > 0 ? 'partial' : 'pending');
        
        const change = Math.max(0, amountPaid - total);

        //create sale
        const sale = new Sale({
            billNumber,
            customer: {
                name: customer?.name ,
                phone: customer?.phone ,
                email: customer?.email 
            },
            items: processedItems,
            subtotal,
            discount: totalDiscount,
            tax: totalTax,
            total,
            paymentMethod,
            paymentStatus,
            amountPaid,
            change,
            notes,
            createdBy: req.user._id
        });

        await sale.save();
        
        res.status(201).json({
            success: true,
            message: 'Sale created successfully',
            data: sale
        });
    } catch (error) {
        console.error('Create sale error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error creating sale', 
            error: error.message 
        });
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