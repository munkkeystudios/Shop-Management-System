const { Sale, Product } = require('../models'); 
const Loan = require('../models/loan');
const mongoose = require('mongoose');

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
            notes,
            loanNumber
        } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Sale items are required' });
        }
        if (billNumber === undefined || total === undefined || amountPaid === undefined) {
            return res.status(400).json({ success: false, message: 'Bill number, total, and amount paid are required' });
        }
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'User authentication required to create sale.' });
        }

        const productUpdates = [];
        for (const item of items) {
            const product = await Product.findById(item.product).select('name quantity');
            if (!product) {
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

        let loan = null;
        if (paymentMethod === 'loan') {
            if (!loanNumber) {
                return res.status(400).json({ success: false, message: 'Loan number is required for loan payments.' });
            }

            loan = await Loan.findOne({ loanNumber: parseInt(loanNumber) });
            if (!loan) {
                return res.status(404).json({ success: false, message: 'Loan not found.' });
            }

            if (loan.loanAmount === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Loan amount is 0. No loan is allowed for this customer.'
                });
            }

            if (loan.remainingBalance + total > loan.loanAmount) {
                return res.status(400).json({
                    success: false,
                    message: `Exceeding loan limit. Loan amount is ${loan.loanAmount}, but the remaining balance would exceed this limit.`
                });
            }

            loan.remainingBalance += total;

            if (amountPaid > 0) {
                loan.amountPaid += amountPaid;
                loan.remainingBalance -= amountPaid;
                if (loan.remainingBalance < 0) {
                    loan.remainingBalance = 0;
                }
            }

            loan.paymentStatus = loan.remainingBalance === 0 ? 'paid' : (loan.amountPaid > 0 ? 'partial' : 'pending');

            await loan.save();
        }

        let paymentStatus;
        if (paymentMethod === 'loan') {
            paymentStatus = 'unpaid';
        } else if (paymentMethod === 'cash' || paymentMethod === 'card') {
            paymentStatus = 'paid';
        } else {
            paymentStatus = amountPaid >= total ? 'paid' : (amountPaid > 0 ? 'partial' : 'pending');
        }

        let currentBillNumber = billNumber;
        let isDuplicateBill = true;
        let maxAttempts = 20;
        
        while (isDuplicateBill && maxAttempts > 0) {
            const existingBill = await Sale.findOne({ billNumber: currentBillNumber });
            
            if (!existingBill) {
                isDuplicateBill = false;
            } else {
                currentBillNumber++;
                maxAttempts--;
            }
        }
        
        if (maxAttempts === 0) {
            return res.status(409).json({ 
                success: false, 
                message: 'Unable to generate a unique bill number after multiple attempts.' 
            });
        }

        const sale = new Sale({
            billNumber: currentBillNumber,
            customer: {
                name: customerName || 'Walk-in Customer',
                phone: customerPhone
            },
            items,
            subtotal,
            discount,
            tax,
            total,
            paymentMethod,
            paymentStatus,
            amountPaid,
            change: amountPaid > total ? amountPaid - total : 0,
            notes,
            createdBy: req.user._id,
            loan: loan ? loan._id : null
        });

        await sale.save();

        for (const update of productUpdates) {
            await Product.findByIdAndUpdate(update.id, { $inc: { quantity: update.quantityChange } });
            const updatedProduct = await Product.findById(update.id).select('quantity status');
            if (updatedProduct && updatedProduct.quantity <= 0 && updatedProduct.status !== 'out_of_stock') {
                await Product.findByIdAndUpdate(update.id, { status: 'out_of_stock' });
            }
        }

        const wasIncremented = currentBillNumber !== billNumber;

        res.status(201).json({ 
            success: true, 
            message: wasIncremented 
                ? `Sale created with adjusted bill number ${currentBillNumber} (original ${billNumber} was already in use)`
                : "Sale created successfully", 
            data: sale,
            updatedBillNumber: currentBillNumber
        });

    } catch (error) {
        console.error('Create sale error:', error);
        if (error.code === 11000 && error.keyPattern && error.keyPattern.billNumber) {
            return res.status(409).json({ success: false, message: 'Bill number already exists.', error: 'Duplicate bill number' });
        }
        res.status(500).json({ success: false, message: 'Error creating sale', error: error.message });
    }
};

exports.getSales = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            startDate,
            endDate,
            paymentStatus,
            paymentMethod,
            billNumber
        } = req.query;

        const query = {};

        if (billNumber) {
            const billNum = parseInt(billNumber, 10);
            if (!isNaN(billNum)) {
                query.billNumber = billNum;
            }
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                try { query.createdAt.$gte = new Date(startDate); } catch (e) { /* ignore invalid date */ }
            }
            if (endDate) {
                try {
                    const endOfDay = new Date(endDate);
                    endOfDay.setHours(23, 59, 59, 999);
                    query.createdAt.$lte = endOfDay;
                } catch (e) { /* ignore invalid date */ }
            }
        }

        if (paymentStatus) query.paymentStatus = paymentStatus;
        if (paymentMethod) query.paymentMethod = paymentMethod;

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            sort: { createdAt: -1 },
            populate: [
                { path: 'items.product', select: 'name price' },
                { path: 'createdBy', select: 'username name' }
            ],
            lean: true
        };

        let result;
        if (Sale.paginate) {
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
            sales: result.docs,
            totalPages: result.totalPages,
            currentPage: result.page,
            totalSales: result.totalDocs
        });
    } catch (error) {
        console.error('Get sales error:', error);
        res.status(500).json({ success: false, message: 'Error fetching sales', error: error.message });
    }
};

exports.getSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid sale ID format: ${id}`
      });
    }
    
    const sale = await Sale.findById(id)
      .populate('items.product', 'name price images')
      .populate('createdBy', 'username name')
      .lean();

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    res.status(200).json({
      success: true,
      data: sale
    });
  } catch (error) {
    console.error('Get sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching sale',
      error: error.message
    });
  }
};

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
        sale.paymentStatus = amountPaid >= sale.total ? 'paid' : (amountPaid > 0 ? 'partial' : 'pending');
        sale.change = amountPaid > sale.total ? amountPaid - sale.total : 0;

        await sale.save();
        res.status(200).json({ success: true, message: "Payment status updated", data: sale });
    } catch (error) {
        console.error('Update payment status error:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'Invalid Sale ID format' });
        }
        res.status(500).json({ success: false, message: 'Error updating payment status', error: error.message });
    }
};

exports.exportSales = async (req, res) => {
  try {
    const { format = 'csv', startDate, endDate, paymentStatus } = req.query;

    const query = {};

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

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    const sales = await Sale.find(query)
      .populate('items.product', 'name barcode price')
      .populate('createdBy', 'username name')
      .sort({ createdAt: -1 })
      .lean();

    if (format.toLowerCase() === 'csv') {
      if (sales.length === 0) {
        return res.status(200).send('No sales data to export.');
      }

      const { Parser } = require('json2csv');

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
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 50, layout: 'landscape' });

      res.header('Content-Type', 'application/pdf');
      res.attachment('sales.pdf');
      doc.pipe(res);

      doc.fontSize(18).text('Sales Report', { align: 'center' }).moveDown();

      if (sales.length === 0) {
        doc.fontSize(12).text('No sales data to export.');
        doc.end();
        return;
      }

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

      const headers = ['Bill #', 'Date', 'Customer', 'Total', 'Payment Method', 'Status', 'Created By'];
      const colWidths = [60, 80, 120, 70, 100, 80, 100];

      let y = doc.y;
      let x = doc.page.margins.left;

      headers.forEach((header, i) => {
        doc.fontSize(10).text(header, x, y, { width: colWidths[i], align: 'left', underline: true });
        x += colWidths[i];
      });

      y += 20;

      sales.forEach((sale, index) => {
        x = doc.page.margins.left;

        const date = new Date(sale.createdAt).toLocaleDateString();

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

        if (y > doc.page.height - doc.page.margins.bottom - 20) {
          doc.addPage({ layout: 'landscape' });
          y = doc.page.margins.top;

          x = doc.page.margins.left;
          headers.forEach((header, i) => {
            doc.fontSize(10).text(header, x, y, { width: colWidths[i], align: 'left', underline: true });
            x += colWidths[i];
          });

          y += 20;
        }
      });

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
                    totalSalesValue: { $sum: '$total' },
                    totalDiscountValue: { $sum: '$discount' },
                    totalTaxValue: { $sum: '$tax' },
                    averageSaleValue: { $avg: '$total' },
                    totalTransactions: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
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
                    totalValue: { $sum: '$total' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const overallStats = stats[0] || {
            totalSalesValue: 0,
            totalDiscountValue: 0,
            totalTaxValue: 0,
            averageSaleValue: 0,
            totalTransactions: 0
        };

        res.status(200).json({
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
        const lastSale = await Sale.findOne().sort({ createdAt: -1 }).select('billNumber');
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
            .sort({ createdAt: -1 })
            .limit(10) 
            .populate('items.product', 'name price') 
            .populate('createdBy', 'username name') 
            .lean();

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

exports.getRecentSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('items.product', 'name price')
      .populate('createdBy', 'username name')
      .lean();

    res.status(200).json({
      success: true,
      data: sales
    });
  } catch (error) {
    console.error('Get recent sales error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching recent sales',
      error: error.message
    });
  }
};