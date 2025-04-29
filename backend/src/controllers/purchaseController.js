const { Purchase, Product, Supplier } = require('../models');

// Create a new purchase
exports.createPurchase = async (req, res) => {
  try {
    const {
      supplier,
      date,
      warehouse,
      items, 
      totalAmount,
      tax,
      discount,
      status,
      paymentStatus,
      notes
    } = req.body;
    
    if (!supplier || !items || !Array.isArray(items) || items.length === 0 || totalAmount === undefined) {
      return res.status(400).json({ success: false, message: 'Supplier, items, and total amount are required.' });
    }
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: 'User authentication required to record purchase.' });
    }

    const purchase = await Purchase.create({
      supplier,
      date: date || new Date(),
      warehouse,
      items,
      totalAmount,
      tax: tax || 0,
      discount: discount || 0,
      status: status || 'pending',
      paymentStatus: paymentStatus || 'pending',
      notes,
      createdBy: req.user._id 
    });

    res.status(201).json({
      success: true,
      message: 'Purchase recorded successfully',
      data: purchase
    });

  } catch (error) {
    console.error('Error creating purchase:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error recording purchase',
      error: error.message
    });
  }
};

// Get all purchases with pagination, sorting and filtering
exports.getAllPurchases = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = '-date',
      supplier,
      status,
      paymentStatus,
      warehouse,
      startDate,
      endDate,
      minAmount,
      maxAmount
    } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (supplier) filter.supplier = supplier;
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (warehouse) filter.warehouse = warehouse;
    
    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    // Amount range filter
    if (minAmount || maxAmount) {
      filter.totalAmount = {};
      if (minAmount) filter.totalAmount.$gte = Number(minAmount);
      if (maxAmount) filter.totalAmount.$lte = Number(maxAmount);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query with pagination
    const purchases = await Purchase.find(filter)
      .populate('supplier', 'name') 
      .populate('warehouse', 'name')
      .populate('items.product', 'name barcode') 
      .populate('createdBy', 'username') 
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const totalCount = await Purchase.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: purchases.length,
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      currentPage: parseInt(page),
      data: purchases
    });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error fetching purchases',
      error: error.message
    });
  }
};

// Get a single purchase by ID
exports.getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('supplier', 'name contactPerson email phone address')
      .populate('warehouse', 'name location')
      .populate('items.product', 'name barcode description price')
      .populate('createdBy', 'username');

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    res.status(200).json({
      success: true,
      data: purchase
    });
  } catch (error) {
    console.error('Error fetching purchase by ID:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid Purchase ID format' });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error fetching purchase',
      error: error.message
    });
  }
};

// Update purchase status
exports.updatePurchaseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;
    
    const updateData = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    
    const purchase = await Purchase.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Purchase status updated successfully',
      data: purchase
    });
    
  } catch (error) {
    console.error('Error updating purchase status:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid Purchase ID format' });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error updating purchase status',
      error: error.message
    });
  }
};

// Delete a purchase
exports.deletePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findByIdAndDelete(req.params.id);
    
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Purchase deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting purchase:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid Purchase ID format' });
    }
    res.status(500).json({
      success: false,
      message: 'Server Error deleting purchase',
      error: error.message
    });
  }
};

// Export purchases
exports.exportPurchases = async (req, res) => {
  try {
    const { format = 'csv' } = req.query; 
    
    // Apply the same filters as getAllPurchases
    const { 
      supplier,
      status,
      paymentStatus,
      warehouse,
      startDate,
      endDate,
      minAmount,
      maxAmount
    } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (supplier) filter.supplier = supplier;
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (warehouse) filter.warehouse = warehouse;
    
    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    // Amount range filter
    if (minAmount || maxAmount) {
      filter.totalAmount = {};
      if (minAmount) filter.totalAmount.$gte = Number(minAmount);
      if (maxAmount) filter.totalAmount.$lte = Number(maxAmount);
    }
    
    const purchases = await Purchase.find(filter)
      .populate('supplier', 'name')
      .populate('warehouse', 'name')
      .populate('items.product', 'name barcode price') 
      .populate('createdBy', 'username')
      .sort({ date: -1 })
      .lean(); 

    if (format.toLowerCase() === 'csv') {
      
      if (purchases.length === 0) {
        return res.status(200).send('No purchase data to export.');
      }

      const { Parser } = require('json2csv'); 

      const flattenedData = purchases.flatMap(p =>
        p.items.map(item => ({
          purchaseId: p._id,
          purchaseDate: p.date ? p.date.toISOString().split('T')[0] : 'N/A',
          supplierName: p.supplier ? p.supplier.name : 'N/A',
          warehouseName: p.warehouse ? p.warehouse.name : 'N/A',
          status: p.status || 'N/A',
          productName: item.product ? item.product.name : 'N/A',
          productBarcode: item.product ? item.product.barcode : 'N/A',
          quantity: item.quantity,
          purchasePricePerItem: item.price,
          itemTotal: item.quantity * item.price,
          paymentStatus: p.paymentStatus,
          recordedBy: p.createdBy ? p.createdBy.username : 'N/A',
          notes: p.notes || '',
          createdAt: p.createdAt.toISOString(),
        }))
      );

      const fields = [
        'purchaseId', 'purchaseDate', 'supplierName', 'warehouseName', 'status',
        'productName', 'productBarcode', 'quantity', 'purchasePricePerItem', 
        'itemTotal', 'paymentStatus', 'recordedBy', 'notes', 'createdAt'
      ];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(flattenedData);

      res.header('Content-Type', 'text/csv');
      res.attachment('purchases.csv');
      res.status(200).send(csv);

    } else if (format.toLowerCase() === 'pdf') {
      
      const PDFDocument = require('pdfkit'); 
      const doc = new PDFDocument({ margin: 50, layout: 'landscape' }); 

      res.header('Content-Type', 'application/pdf');
      res.attachment('purchases.pdf');
      doc.pipe(res); 
      
      doc.fontSize(18).text('Purchase Report', { align: 'center' }).moveDown();

      if (purchases.length === 0) {
        doc.fontSize(12).text('No purchase data to export.');
        doc.end();
        return;
      }

      const tableTop = doc.y;
      
      const headers = ['ID', 'Date', 'Supplier', 'Warehouse', 'Status', 'Item', 'Qty', 'Unit Price', 'Item Total', 'Payment Status', 'Notes'];
      const colWidths = [60, 60, 80, 80, 50, 100, 30, 50, 50, 70, 80]; 
      let x = doc.page.margins.left;

      headers.forEach((header, i) => {
        doc.fontSize(8).text(header, x, tableTop, { width: colWidths[i], align: 'left', underline: true });
        x += colWidths[i];
      });

      let y = tableTop + 15;
      purchases.forEach(p => {
        let isFirstItem = true;
        p.items.forEach(item => {
          x = doc.page.margins.left;
          const rowData = [
            isFirstItem ? p._id.toString().substring(0, 8) + '...' : '', 
            isFirstItem ? (p.date ? p.date.toISOString().split('T')[0] : 'N/A') : '', 
            isFirstItem ? (p.supplier ? p.supplier.name : 'N/A') : '', 
            isFirstItem ? (p.warehouse ? p.warehouse.name : 'N/A') : '', 
            isFirstItem ? (p.status || 'N/A') : '',
            item.product ? item.product.name : 'N/A',
            item.quantity.toString(),
            item.price.toFixed(2),
            (item.quantity * item.price).toFixed(2),
            isFirstItem ? p.paymentStatus : '', 
            isFirstItem ? (p.notes || '') : '' 
          ];

          rowData.forEach((cell, i) => {
            doc.text(cell, x, y, { width: colWidths[i], align: 'left' });
            x += colWidths[i];
          });

          y += 15;
          isFirstItem = false; 

          if (y > doc.page.height - doc.page.margins.bottom - 15) { 
            doc.addPage({layout: 'landscape'});
            y = doc.page.margins.top; 
             
            x = doc.page.margins.left;
            headers.forEach((header, i) => {
              doc.fontSize(8).text(header, x, y, { width: colWidths[i], align: 'left', underline: true });
              x += colWidths[i];
            });
            y += 15; 
          }
        });
        if (!isFirstItem) y += 5; 
      });

      doc.end();

    } else if (format.toLowerCase() === 'excel') {
      // For Excel format you would need to install a package like 'exceljs'
      // This is a stub - implement if needed
      res.status(501).json({ success: false, message: "Excel export not yet implemented" });
    } else {
      res.status(400).json({ success: false, message: "Invalid export format specified. Use 'csv', 'pdf', or 'excel'." });
    }

  } catch (error) {
    console.error('Error exporting purchases:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error exporting purchases',
      error: error.message
    });
  }
};