
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

// Export sales to CSV or PDF
exports.exportSales = async (req, res) => {
  try {
    const { format = 'csv', startDate, endDate, paymentStatus } = req.query;

    // Build query based on filters
    const query = {};

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endOfDay;
      }
    }

    // Payment status filter
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    // Fetch sales with populated fields
    const sales = await Sale.find(query)
      .populate('items.product', 'name barcode price')
      .populate('createdBy', 'username name')
      .sort({ createdAt: -1 })
      .lean();

    if (format.toLowerCase() === 'csv') {
      // CSV Export Logic
      if (sales.length === 0) {
        return res.status(200).send('No sales data to export.');
      }

      const { Parser } = require('json2csv');

      // Flatten the data for CSV export
      const flattenedData = sales.map(sale => ({
        saleId: sale._id,
        billNumber: sale.billNumber,
        date: sale.createdAt.toISOString().split('T')[0],
        time: sale.createdAt.toISOString().split('T')[1].substring(0, 8),
        customerName: sale.customer?.name || 'Walk-in Customer',
        customerPhone: sale.customer?.phone || 'N/A',
        subtotal: sale.subtotal,
        discount: sale.discount,
        tax: sale.tax,
        total: sale.total,
        paymentMethod: sale.paymentMethod,
        paymentStatus: sale.paymentStatus,
        amountPaid: sale.amountPaid,
        change: sale.change,
        createdBy: sale.createdBy ? sale.createdBy.name || sale.createdBy.username : 'N/A',
        itemCount: sale.items.length,
        notes: sale.notes || ''
      }));

      const fields = [
        'saleId', 'billNumber', 'date', 'time', 'customerName', 'customerPhone',
        'subtotal', 'discount', 'tax', 'total', 'paymentMethod', 'paymentStatus',
        'amountPaid', 'change', 'createdBy', 'itemCount', 'notes'
      ];

      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(flattenedData);

      res.header('Content-Type', 'text/csv');
      res.attachment('sales.csv');
      res.status(200).send(csv);

    } else if (format.toLowerCase() === 'pdf') {
      // PDF Export Logic
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 50, layout: 'landscape' });

      res.header('Content-Type', 'application/pdf');
      res.attachment('sales.pdf');
      doc.pipe(res);

      // Add title
      doc.fontSize(18).text('Sales Report', { align: 'center' }).moveDown();

      if (sales.length === 0) {
        doc.fontSize(12).text('No sales data to export.');
        doc.end();
        return;
      }

      // Add filters information if any
      let filterText = 'Filters: ';
      let hasFilters = false;

      if (startDate) {
        filterText += `From ${new Date(startDate).toLocaleDateString()} `;
        hasFilters = true;
      }

      if (endDate) {
        filterText += `To ${new Date(endDate).toLocaleDateString()} `;
        hasFilters = true;
      }

      if (paymentStatus) {
        filterText += `Payment Status: ${paymentStatus} `;
        hasFilters = true;
      }

      if (hasFilters) {
        doc.fontSize(10).text(filterText, { align: 'left' }).moveDown();
      }

      // Define table headers and column widths
      const headers = ['Bill #', 'Date', 'Customer', 'Total', 'Payment Method', 'Status', 'Created By'];
      const colWidths = [60, 80, 120, 70, 100, 80, 100];

      // Draw headers
      let y = doc.y;
      let x = doc.page.margins.left;

      headers.forEach((header, i) => {
        doc.fontSize(10).text(header, x, y, { width: colWidths[i], align: 'left', underline: true });
        x += colWidths[i];
      });

      y += 20;

      // Draw rows
      sales.forEach((sale, index) => {
        x = doc.page.margins.left;

        // Format date
        const date = new Date(sale.createdAt).toLocaleDateString();

        // Draw cells
        doc.fontSize(9).text(sale.billNumber.toString(), x, y, { width: colWidths[0] });
        x += colWidths[0];

        doc.fontSize(9).text(date, x, y, { width: colWidths[1] });
        x += colWidths[1];

        doc.fontSize(9).text(sale.customer?.name || 'Walk-in Customer', x, y, { width: colWidths[2] });
        x += colWidths[2];

        doc.fontSize(9).text(sale.total.toFixed(2), x, y, { width: colWidths[3] });
        x += colWidths[3];

        doc.fontSize(9).text(sale.paymentMethod, x, y, { width: colWidths[4] });
        x += colWidths[4];

        doc.fontSize(9).text(sale.paymentStatus, x, y, { width: colWidths[5] });
        x += colWidths[5];

        doc.fontSize(9).text(sale.createdBy ? sale.createdBy.name || sale.createdBy.username : 'N/A', x, y, { width: colWidths[6] });

        y += 20;

        // Add new page if needed
        if (y > doc.page.height - doc.page.margins.bottom - 20) {
          doc.addPage({ layout: 'landscape' });
          y = doc.page.margins.top;

          // Redraw headers on new page
          x = doc.page.margins.left;
          headers.forEach((header, i) => {
            doc.fontSize(10).text(header, x, y, { width: colWidths[i], align: 'left', underline: true });
            x += colWidths[i];
          });

          y += 20;
        }
      });

      // Add summary at the end
      doc.moveDown();
      const totalAmount = sales.reduce((sum, sale) => sum + sale.total, 0);
      doc.fontSize(12).text(`Total Sales: ${sales.length}`, { align: 'right' });
      doc.fontSize(12).text(`Total Amount: $${totalAmount.toFixed(2)}`, { align: 'right' });

      doc.end();
    } else {
      res.status(400).json({ success: false, message: "Invalid export format specified. Use 'csv' or 'pdf'." });
    }
  } catch (error) {
    console.error('Error exporting sales:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error exporting sales',
      error: error.message
    });
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
                 try { query.createdAt.$gte = new Date(startDate); } catch(e) {/* ignore */}
            }
            if (endDate) {
                try {
                     const endOfDay = new Date(endDate);
                     endOfDay.setHours(23, 59, 59, 999);
                     query.createdAt.$lte = endOfDay;
                } catch(e) {/* ignore */}
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

// Get the last bill number



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