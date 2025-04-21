const { Sale, Product } = require('../models');

//new sale
exports.createSale = async (req, res) => {
    try {
        const {
            billNumber,
            customerName, // Consider structure, maybe customer: { name, phone }? SDS differs.
            customerPhone,
            items, // Expected: [{ product: productId, quantity: number, price: number, subtotal: number }]
            subtotal,
            discount,
            tax,
            total,
            paymentMethod,
            amountPaid,
            change,
            notes
        } = req.body;

        // *** MODIFIED: Enhanced Validation ***
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Sale items are required' });
        }
        if (billNumber === undefined || total === undefined || amountPaid === undefined) {
            return res.status(400).json({ success: false, message: 'Bill number, total, and amount paid are required' });
        }
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'User authentication required to create sale.' });
        }

        // *** MODIFIED: Robust Stock Check and Update ***
        // 1. Validate all items and check stock BEFORE making changes
        const productUpdates = [];
        for (const item of items) {
            const product = await Product.findById(item.product).select('name quantity'); // Select only needed fields
            if (!product) {
                // Rollback potential previous updates is complex without transactions.
                // Best to check all first.
                return res.status(400).json({ success: false, message: `Product with ID ${item.product} not found` });
            }
            if (product.quantity < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for product ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`
                });
            }
            productUpdates.push({ id: item.product, quantityChange: -item.quantity });
        }

        // 2. If all checks pass, create the Sale document
        const sale = new Sale({
            billNumber,
            // SDS shows customer nested, adapting slightly from original code
            customer: {
                name: customerName || 'Walk-in Customer',
                phone: customerPhone
            },
            items, // Assuming frontend sends calculated price/subtotal per item
            subtotal,
            discount,
            tax,
            total,
            paymentMethod,
            paymentStatus: amountPaid >= total ? 'paid' : (amountPaid > 0 ? 'partial' : 'pending'), // Refined status
            amountPaid,
            change: amountPaid > total ? amountPaid - total : 0, // Change shouldn't be negative
            notes,
            createdBy: req.user._id // Use authenticated user ID
        });

        await sale.save();

        // 3. After sale is successfully saved, update product quantities
        // Consider using a transaction here if your MongoDB setup supports it for atomicity
        for (const update of productUpdates) {
            await Product.findByIdAndUpdate(update.id, { $inc: { quantity: update.quantityChange } });
            // TODO: Add more sophisticated stock status updates if needed (e.g., based on minStockLevel, status='out_of_stock')
            const updatedProduct = await Product.findById(update.id).select('quantity status');
            if (updatedProduct && updatedProduct.quantity <= 0 && updatedProduct.status !== 'out_of_stock') {
                await Product.findByIdAndUpdate(update.id, { status: 'out_of_stock' });
            }
        }

        res.status(201).json({ success: true, message: "Sale created successfully", data: sale }); // Return success and the created sale

    } catch (error) {
        console.error('Create sale error:', error);
        // Handle potential duplicate billNumber error
        if (error.code === 11000 && error.keyPattern && error.keyPattern.billNumber) {
            return res.status(409).json({ success: false, message: 'Bill number already exists.', error: 'Duplicate bill number' });
        }
        res.status(500).json({ success: false, message: 'Error creating sale', error: error.message });
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
            paymentMethod,
            billNumber // Added for filtering by bill number
        } = req.query;

        const query = {};

        // Bill number filter (exact match)
        if (billNumber) {
            const billNum = parseInt(billNumber, 10);
            if (!isNaN(billNum)) {
                query.billNumber = billNum;
            }
        }

        //date filter
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                try { query.createdAt.$gte = new Date(startDate); } catch (e) { /* ignore invalid date */ }
            }
            if (endDate) {
                try {
                    const endOfDay = new Date(endDate);
                    endOfDay.setHours(23, 59, 59, 999); // Ensure end date includes the whole day
                    query.createdAt.$lte = endOfDay;
                } catch (e) { /* ignore invalid date */ }
            }
        }

        //payment filter
        if (paymentStatus) query.paymentStatus = paymentStatus;
        if (paymentMethod) query.paymentMethod = paymentMethod;

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            sort: { createdAt: -1 }, // Sort by newest first
            populate: [
                { path: 'items.product', select: 'name price' }, // Select specific fields
                { path: 'createdBy', select: 'username name' } // Select specific fields
            ],
            lean: true // Use lean for better performance if only reading data
        };

        // Use mongoose-paginate-v2 if installed, otherwise basic skip/limit
        let result;
        if (Sale.paginate) { // Check if pagination plugin is available
            result = await Sale.paginate(query, options);
        } else {
            const skip = (options.page - 1) * options.limit;
            const sales = await Sale.find(query)
                .populate(options.populate)
                .sort(options.sort)
                .skip(skip)
                .limit(options.limit)
                .exec();
            const count = await Sale.countDocuments(query);
            result = {
                docs: sales,
                totalDocs: count,
                totalPages: Math.ceil(count / options.limit),
                page: options.page,
                limit: options.limit,
            };
        }


        res.status(200).json({
            success: true,
            sales: result.docs, // Or just result.sales if not using paginate plugin structure
            totalPages: result.totalPages,
            currentPage: result.page,
            totalSales: result.totalDocs // Or result.count
        });
    } catch (error) {
        console.error('Get sales error:', error);
        res.status(500).json({ success: false, message: 'Error fetching sales', error: error.message });
    }
};

//get a single sale by id
exports.getSaleById = async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id)
            .populate('items.product', 'name price barcode') // Added barcode
            .populate('createdBy', 'username name'); // Added name

        if (!sale) {
            return res.status(404).json({ success: false, message: 'Sale not found' });
        }

        res.status(200).json({ success: true, data: sale }); // Added success flag
    } catch (error) {
        console.error('Get sale error:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'Invalid Sale ID format' });
        }
        res.status(500).json({ success: false, message: 'Error fetching sale', error: error.message });
    }
};

//update sale payment status
exports.updatePaymentStatus = async (req, res) => {
    try {
        const { amountPaid } = req.body;
        if (amountPaid === undefined || typeof amountPaid !== 'number' || amountPaid < 0) {
            return res.status(400).json({ success: false, message: 'Valid amountPaid is required.' });
        }

        const sale = await Sale.findById(req.params.id);

        if (!sale) {
            return res.status(404).json({ success: false, message: 'Sale not found' });
        }

        sale.amountPaid = amountPaid;
        sale.paymentStatus = amountPaid >= sale.total ? 'paid' : (amountPaid > 0 ? 'partial' : 'pending'); // Refined status
        sale.change = amountPaid > sale.total ? amountPaid - sale.total : 0; // Change shouldn't be negative

        await sale.save();
        res.status(200).json({ success: true, message: "Payment status updated", data: sale }); // Added success flag and message
    } catch (error) {
        console.error('Update payment status error:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'Invalid Sale ID format' });
        }
        res.status(500).json({ success: false, message: 'Error updating payment status', error: error.message });
    }
};

//sales statistics
exports.getSalesStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = {};

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                try { query.createdAt.$gte = new Date(startDate); } catch (e) {/* ignore */ }
            }
            if (endDate) {
                try {
                    const endOfDay = new Date(endDate);
                    endOfDay.setHours(23, 59, 59, 999);
                    query.createdAt.$lte = endOfDay;
                } catch (e) {/* ignore */ }
            }
        }

        const stats = await Sale.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalSalesValue: { $sum: '$total' }, // Renamed for clarity
                    totalDiscountValue: { $sum: '$discount' }, // Renamed for clarity
                    totalTaxValue: { $sum: '$tax' }, // Renamed for clarity
                    averageSaleValue: { $avg: '$total' }, // Renamed for clarity
                    totalTransactions: { $sum: 1 }
                }
            },
            {
                $project: { // Round the average value
                    _id: 0, // Exclude the _id field
                    totalSalesValue: 1,
                    totalDiscountValue: 1,
                    totalTaxValue: 1,
                    averageSaleValue: { $round: ["$averageSaleValue", 2] },
                    totalTransactions: 1
                }
            }
        ]);

        const paymentMethodStats = await Sale.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$paymentMethod',
                    count: { $sum: 1 },
                    totalValue: { $sum: '$total' } // Renamed for clarity
                }
            },
            { $sort: { _id: 1 } } // Sort by payment method name
        ]);

        // Ensure default values if no sales found
        const overallStats = stats[0] || {
            totalSalesValue: 0,
            totalDiscountValue: 0,
            totalTaxValue: 0,
            averageSaleValue: 0,
            totalTransactions: 0
        };

        res.status(200).json({ // Added success flag and status code
            success: true,
            overall: overallStats,
            byPaymentMethod: paymentMethodStats
        });
    } catch (error) {
        console.error('Get sales stats error:', error);
        res.status(500).json({ success: false, message: 'Error fetching sales statistics', error: error.message });
    }
};

exports.getLastBillNumber = async (req, res) => {
    try {

        const lastSale = await Sale.findOne().sort({ createdAt: -1 }).select('billNumber'); // Fetch the most recent billNumber
        if (!lastSale) {
            return res.status(404).json({
                success: false,
                message: 'No sales found'
            });
        }

        res.json({
            success: true,
            lastBillNumber: lastSale.billNumber
        });
    } catch (error) {
        console.error('Get last bill number error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching last bill number',
            error: error.message
        });
    }
};

exports.getLastTenSales = async (req, res) => {
    try {
        const sales = await Sale.find()
            .sort({ createdAt: -1 }) // Sort by newest first
            .limit(10) 
            .populate('items.product', 'name price') 
            .populate('createdBy', 'username name') 
            .lean(); // Use lean for better performance if only reading data

        res.status(200).json({
            success: true,
            data: sales
        });
        
    } catch (error) {
        console.error('Get last 10 sales error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching last 10 sales',
            error: error.message
        });
    }
};