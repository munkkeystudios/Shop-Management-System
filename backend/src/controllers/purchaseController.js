const { Purchase, Product, Supplier } = require('../models');


exports.createPurchase = async (req, res) => {
  try {
    const {
      supplier,
      items, 
      totalAmount,
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
      items,
      totalAmount,
      paymentStatus,
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


exports.getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find({})
      .populate('supplier', 'name contactPerson') 
      .populate('items.product', 'name barcode') 
      .populate('createdBy', 'username') 
      .sort({ purchaseDate: -1 }); 

    res.status(200).json({
      success: true,
      count: purchases.length,
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


exports.getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('supplier', 'name contactPerson email phone address')
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


exports.exportPurchases = async (req, res) => {
  try {
    const { format = 'csv' } = req.query; 

    
    const purchases = await Purchase.find({})
      .populate('supplier', 'name')
      .populate('items.product', 'name barcode price') 
      .populate('createdBy', 'username')
      .sort({ purchaseDate: -1 })
      .lean(); 

    if (format.toLowerCase() === 'csv') {
      
      if (purchases.length === 0) {
        return res.status(200).send('No purchase data to export.');
      }

      const { Parser } = require('json2csv'); 

      
      const flattenedData = purchases.flatMap(p =>
        p.items.map(item => ({
          purchaseId: p._id,
          purchaseDate: p.purchaseDate.toISOString().split('T')[0],
          supplierName: p.supplier ? p.supplier.name : 'N/A',
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
        'purchaseId', 'purchaseDate', 'supplierName', 'productName',
        'productBarcode', 'quantity', 'purchasePricePerItem', 'itemTotal',
        'paymentStatus', 'recordedBy', 'notes', 'createdAt'
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
      
      const headers = ['ID', 'Date', 'Supplier', 'Item', 'Qty', 'Unit Price', 'Item Total', 'Status', 'Notes'];
      const colWidths = [80, 60, 100, 120, 30, 60, 60, 50, 100]; 
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
            isFirstItem ? p.purchaseDate.toISOString().split('T')[0] : '', 
            isFirstItem ? (p.supplier ? p.supplier.name : 'N/A') : '', 
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

    } else {
      res.status(400).json({ success: false, message: "Invalid export format specified. Use 'csv' or 'pdf'." });
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
