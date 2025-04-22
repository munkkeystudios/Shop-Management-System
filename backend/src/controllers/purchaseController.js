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


// Import functionality to add to your existing purchase controller

// const fs = require('fs');
// const path = require('path');
// const multer = require('multer');
// const csv = require('csv-parser');
// const xlsx = require('xlsx');
// const { Purchase, Product, Supplier } = require('../models');

// // Configure multer for file upload storage
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = path.join(__dirname, '../../uploads/purchases');
    
//     // Create directory if it doesn't exist
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }
    
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     const fileExt = path.extname(file.originalname);
//     cb(null, 'purchase-import-' + uniqueSuffix + fileExt);
//   }
// });

// const fileFilter = (req, file, cb) => {
//   const allowedTypes = ['.csv', '.xls', '.xlsx'];
//   const ext = path.extname(file.originalname).toLowerCase();
  
//   if (allowedTypes.includes(ext)) {
//     cb(null, true);
//   } else {
//     cb(new Error('Only CSV, XLS, or XLSX files are allowed!'), false);
//   }
// };

// const upload = multer({ 
//   storage: storage, 
//   fileFilter: fileFilter,
//   limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
// });

// // Import purchase from file (CSV/Excel)
// exports.importPurchase = async (req, res) => {
//   try {
//     // Process file upload using multer middleware
//     upload.single('file')(req, res, async (err) => {
//       if (err) {
//         return res.status(400).json({ 
//           success: false, 
//           message: err.message 
//         });
//       }
      
//       if (!req.file) {
//         return res.status(400).json({ 
//           success: false, 
//           message: 'Please upload a file.' 
//         });
//       }
      
//       if (!req.user || !req.user._id) {
//         return res.status(401).json({ 
//           success: false, 
//           message: 'User authentication required to import purchase.' 
//         });
//       }
      
//       const filePath = req.file.path;
//       const fileExt = path.extname(req.file.originalname).toLowerCase();
      
//       let purchaseItems = [];
      
//       // Process the file based on its type
//       try {
//         if (fileExt === '.csv') {
//           purchaseItems = await processCSV(filePath);
//         } else if (fileExt === '.xlsx' || fileExt === '.xls') {
//           purchaseItems = processExcel(filePath);
//         }
//       } catch (error) {
//         // Clean up file on error
//         if (fs.existsSync(filePath)) {
//           fs.unlinkSync(filePath);
//         }
        
//         return res.status(400).json({ 
//           success: false, 
//           message: `Error processing file: ${error.message}` 
//         });
//       }
      
//       if (purchaseItems.length === 0) {
//         // Clean up file if no items
//         if (fs.existsSync(filePath)) {
//           fs.unlinkSync(filePath);
//         }
        
//         return res.status(400).json({ 
//           success: false, 
//           message: 'No valid purchase items found in file.' 
//         });
//       }
      
//       try {
//         const { 
//           supplier, 
//           date = new Date(), 
//           orderTax = 0, 
//           discount = 0, 
//           status = 'pending',
//           warehouse = null,
//           notes = '' 
//         } = req.body;
        
//         // Validate supplier
//         const supplierExists = await Supplier.findById(supplier);
//         if (!supplierExists) {
//           return res.status(400).json({ 
//             success: false, 
//             message: 'Supplier not found.' 
//           });
//         }
        
//         // Process purchase items
//         const processedItems = [];
//         let totalAmount = 0;
        
//         for (const item of purchaseItems) {
//           // Find product by barcode/code or create new
//           let product;
          
//           if (item.barcode || item.productCode) {
//             const searchQuery = item.barcode 
//               ? { barcode: item.barcode } 
//               : { productCode: item.productCode };
              
//             product = await Product.findOne(searchQuery);
//           }
          
//           // If product not found, create it
//           if (!product && item.productName) {
//             product = new Product({
//               name: item.productName,
//               barcode: item.barcode || null,
//               productCode: item.productCode || null,
//               price: item.sellingPrice || item.price || 0,
//               purchasePrice: item.price || 0,
//               // Add other fields as needed
//             });
            
//             await product.save();
//           }
          
//           if (product) {
//             const quantity = parseInt(item.quantity) || 1;
//             const price = parseFloat(item.price) || 0;
//             const itemTotal = quantity * price;
            
//             processedItems.push({
//               product: product._id,
//               quantity: quantity,
//               price: price
//             });
            
//             totalAmount += itemTotal;
//           }
//         }
        
//         // Apply tax and discount
//         const taxAmount = (totalAmount * parseFloat(orderTax)) / 100;
//         const discountAmount = parseFloat(discount);
//         const finalTotal = totalAmount + taxAmount - discountAmount;
        
//         // Create purchase
//         const purchase = new Purchase({
//           supplier,
//           date: new Date(date),
//           warehouse,
//           items: processedItems,
//           totalAmount: finalTotal,
//           tax: taxAmount,
//           discount: discountAmount,
//           status,
//           paymentStatus: 'pending', // Default or can be made configurable
//           notes,
//           createdBy: req.user._id
//         });
        
//         await purchase.save();
        
//         // Clean up file
//         if (fs.existsSync(filePath)) {
//           fs.unlinkSync(filePath);
//         }
        
//         res.status(201).json({
//           success: true,
//           message: 'Purchase imported successfully',
//           data: purchase
//         });
        
//       } catch (error) {
//         // Clean up file on error
//         if (fs.existsSync(filePath)) {
//           fs.unlinkSync(filePath);
//         }
        
//         console.error('Error creating purchase from import:', error);
//         res.status(500).json({
//           success: false,
//           message: 'Server Error creating purchase from import',
//           error: error.message
//         });
//       }
//     });
//   } catch (error) {
//     console.error('Error importing purchase:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server Error during purchase import',
//       error: error.message
//     });
//   }
// };

// // Download sample import template
// exports.downloadSampleTemplate = (req, res) => {
//   try {
//     const sampleItems = [
//       {
//         productName: 'Sample Product 1',
//         barcode: 'BC12345',
//         productCode: 'PC001',
//         quantity: 10,
//         price: 25.50,
//         sellingPrice: 45.00
//       },
//       {
//         productName: 'Sample Product 2',
//         barcode: 'BC67890',
//         productCode: 'PC002',
//         quantity: 5,
//         price: 15.75,
//         sellingPrice: 29.99
//       }
//     ];
    
//     // Create Excel file
//     const workbook = xlsx.utils.book_new();
//     const worksheet = xlsx.utils.json_to_sheet(sampleItems);
//     xlsx.utils.book_append_sheet(workbook, worksheet, 'Sample');
    
//     // Save to temp directory
//     const tempDir = path.join(__dirname, '../../uploads/temp');
//     if (!fs.existsSync(tempDir)) {
//       fs.mkdirSync(tempDir, { recursive: true });
//     }
    
//     const tempFilePath = path.join(tempDir, 'purchase_import_sample.xlsx');
//     xlsx.writeFile(workbook, tempFilePath);
    
//     // Send file to client
//     res.download(tempFilePath, 'purchase_import_sample.xlsx', (err) => {
//       if (err) {
//         console.error('Error downloading template:', err);
//         res.status(500).json({
//           success: false,
//           message: 'Could not download the file'
//         });
//       }
      
//       // Delete the file after sending
//       if (fs.existsSync(tempFilePath)) {
//         fs.unlinkSync(tempFilePath);
//       }
//     });
//   } catch (error) {
//     console.error('Error generating sample file:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Error generating sample file', 
//       error: error.message 
//     });
//   }
// };

// // Helper functions for file processing
// async function processCSV(filePath) {
//   return new Promise((resolve, reject) => {
//     const results = [];
    
//     fs.createReadStream(filePath)
//       .pipe(csv())
//       .on('data', (data) => results.push(data))
//       .on('end', () => {
//         resolve(results);
//       })
//       .on('error', (error) => {
//         reject(error);
//       });
//   });
// }

// function processExcel(filePath) {
//   const workbook = xlsx.readFile(filePath);
//   const sheetName = workbook.SheetNames[0];
//   const worksheet = workbook.Sheets[sheetName];
//   return xlsx.utils.sheet_to_json(worksheet);
// }