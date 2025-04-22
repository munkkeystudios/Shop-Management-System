
const multer = require('multer');
const csv = require('csv-parser');
const xlsx = require('xlsx'); 
const fs = require('fs');
const path = require('path');
// Add Sale model
const { Product, Category, Supplier, Sale } = require('../models'); // <-- MODIFIED

//--- Product Import Setup (Keep Existing) ---
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
const productStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        const productsUploadDir = path.join(uploadsDir, 'products'); // Specific folder for products
        if (!fs.existsSync(productsUploadDir)) {
            fs.mkdirSync(productsUploadDir, { recursive: true });
        }
        cb(null, productsUploadDir);
    },
    filename: function(req, file, cb) {
        cb(null, `product-${Date.now()}-${file.originalname}`);
    }
});
const productFileFilter = (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
        cb(null, true);
    } else {
        cb(new Error('Only CSV files are allowed for products'), false);
    }
};
const productUpload = multer({
    storage: productStorage,
    fileFilter: productFileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } // Max 5MB
}).single('file');
exports.uploadMiddleware = (req, res, next) => { // Renamed for clarity
    productUpload(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ success: false, message: 'Product file upload error', error: err.message });
        } else if (err) {
            return res.status(400).json({ success: false, message: 'Product file upload failed', error: err.message });
        }
        next();
    });
};
exports.importProducts = async (req, res) => {
    // --- Keep Existing importProducts logic ---
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    try {
        const results = [];
        const errors = [];
        let successCount = 0;
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                for (const item of results) {
                    try {
                        if (!item.name || !item.barcode || !item.price || !item.category || !item.supplier) {
                            errors.push({ item, error: 'Missing required fields (name, barcode, price, category, supplier)' }); continue;
                        }
                        const existingProduct = await Product.findOne({ barcode: item.barcode });
                        if (existingProduct) { errors.push({ item, error: `Product with barcode ${item.barcode} already exists` }); continue; }
                        const categoryExists = await Category.findById(item.category);
                        if (!categoryExists) { errors.push({ item, error: `Category with ID ${item.category} not found` }); continue; }
                        const supplierExists = await Supplier.findById(item.supplier);
                        if (!supplierExists) { errors.push({ item, error: `Supplier with ID ${item.supplier} not found` }); continue; }
                        const price = parseFloat(item.price);
                        if (isNaN(price) || price < 0) { errors.push({ item, error: 'Price must be a valid non-negative number' }); continue; }
                        const quantity = item.quantity ? parseInt(item.quantity) : 0;
                        if (isNaN(quantity) || quantity < 0) { errors.push({ item, error: 'Quantity must be a valid non-negative integer' }); continue; }
                        const discountRate = item.discountRate ? parseFloat(item.discountRate) : 0;
                        if (isNaN(discountRate) || discountRate < 0 || discountRate > 100) { errors.push({ item, error: 'Discount rate must be between 0 and 100' }); continue; }
                        const productData = {
                            name: item.name, barcode: item.barcode, description: item.description || '', price: price,
                            costPrice: item.costPrice ? parseFloat(item.costPrice) : undefined, quantity: quantity, category: item.category,
                            supplier: item.supplier, discountRate: discountRate, taxRate: item.taxRate ? parseFloat(item.taxRate) : 0,
                            minStockLevel: item.minStockLevel ? parseInt(item.minStockLevel) : 5, status: item.status || 'active'
                        };
                        await Product.create(productData);
                        successCount++;
                    } catch (err) { errors.push({ item, error: err.message }); }
                }
                fs.unlinkSync(req.file.path);
                res.status(200).json({ success: true, message: `Imported ${successCount} out of ${results.length} products`, totalProcessed: results.length, successCount: successCount, errorCount: errors.length, errors: errors });
            })
            .on('error', (error) => { fs.unlinkSync(req.file.path); res.status(500).json({ success: false, message: 'Error parsing CSV file', error: error.message }); });
    } catch (error) { if (req.file && fs.existsSync(req.file.path)) { fs.unlinkSync(req.file.path); } res.status(500).json({ success: false, message: 'Import failed', error: error.message }); }
    // --- End Existing importProducts logic ---
};
// --- End Product Import Setup ---


//--- Sale Import Setup ---
const saleStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        const salesUploadDir = path.join(uploadsDir, 'sales'); // Specific folder for sales
        if (!fs.existsSync(salesUploadDir)) {
            fs.mkdirSync(salesUploadDir, { recursive: true });
        }
        cb(null, salesUploadDir);
    },
    filename: function(req, file, cb) {
        cb(null, `sale-${Date.now()}-${file.originalname}`);
    }
});
const saleFileFilter = (req, file, cb) => {
    // Allow CSV and Excel files for sales
    const allowedTypes = /csv|xls|xlsx/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
        return cb(null, true);
    }
    cb('Error: File upload only supports CSV, XLS, XLSX format for sales!');
};
const saleUpload = multer({
    storage: saleStorage,
    fileFilter: saleFileFilter,
    limits: { fileSize: 1024 * 1024 * 10 } // Max 10MB for sales files
}).single('file');

// Middleware for Sale Upload
exports.uploadSaleMiddleware = (req, res, next) => { // <-- NEW MIDDLEWARE
    saleUpload(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ success: false, message: 'Sale file upload error', error: err.message });
        } else if (err) {
            // Handle custom filter error
            return res.status(400).json({ success: false, message: 'Sale file upload failed', error: err });
        }
        next();
    });
};

// Import Sales from CSV/Excel
exports.importSales = async (req, res) => { // <-- NEW FUNCTION
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No sale file uploaded' });
    }
    if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: 'User authentication required.' });
    }

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    let salesData = [];
    let successCount = 0;
    const errors = [];

    try {
        // Read data from file
        if (fileExt === '.csv') {
            await new Promise((resolve, reject) => {
                fs.createReadStream(filePath)
                    .pipe(csv())
                    .on('data', (data) => salesData.push(data))
                    .on('end', resolve)
                    .on('error', reject);
            });
        } else if (fileExt === '.xlsx' || fileExt === '.xls') {
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            salesData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
        } else {
            fs.unlinkSync(filePath); // Clean up unsupported file
            return res.status(400).json({ success: false, message: 'Unsupported file type' });
        }

        // Process sales data
        for (let i = 0; i < salesData.length; i++) {
            const row = salesData[i];
            const rowNum = i + 2; // Account for header row in spreadsheet

            try {
                // --- Validation ---
                if (!row.billNumber || !row.items || !row.total || !row.createdAt) {
                    errors.push({ row: rowNum, item: row, error: 'Missing required fields (billNumber, items, total, createdAt)' });
                    continue;
                }

                const billNumber = parseInt(row.billNumber);
                if (isNaN(billNumber)) {
                    errors.push({ row: rowNum, item: row, error: 'Invalid Bill Number' });
                    continue;
                }

                const existingSale = await Sale.findOne({ billNumber });
                if (existingSale) {
                    errors.push({ row: rowNum, item: row, error: `Sale with Bill Number ${billNumber} already exists` });
                    continue;
                }

                let parsedItems;
                try {
                    // Expect items in format: "PRODUCT_ID:QTY:PRICE;PRODUCT_ID:QTY:PRICE"
                    parsedItems = row.items.split(';').map(itemStr => {
                        const parts = itemStr.split(':');
                        if (parts.length !== 3) throw new Error('Invalid item format');
                        const productId = parts[0].trim();
                        const quantity = parseInt(parts[1].trim());
                        const price = parseFloat(parts[2].trim());
                        if (!productId || isNaN(quantity) || isNaN(price) || quantity <= 0 || price < 0) {
                            throw new Error('Invalid item data');
                        }
                        // Simple validation for now, deeper validation below
                        return { product: productId, quantity, price };
                    });
                } catch (e) {
                    errors.push({ row: rowNum, item: row, error: `Error parsing items: ${e.message}. Expected format "ID:QTY:PRICE;ID:QTY:PRICE"` });
                    continue;
                }

                if (parsedItems.length === 0) {
                     errors.push({ row: rowNum, item: row, error: 'Sale must contain at least one item' });
                     continue;
                }

                // Validate each item's product existence
                const validatedItems = [];
                let calculatedSubtotal = 0;
                for (const item of parsedItems) {
                    const product = await Product.findById(item.product).select('price discountRate'); // Select needed fields
                    if (!product) {
                        throw new Error(`Product with ID ${item.product} not found`);
                    }
                    // Calculate effective price and subtotal (using product's CURRENT price/discount if not provided in import, maybe adjust later)
                    // For simplicity, we use the price from the import file here.
                    const effectivePrice = item.price; // Assume price in file is the final price per item at time of sale
                    const subtotal = item.quantity * effectivePrice;
                    calculatedSubtotal += subtotal;
                    validatedItems.push({
                        product: item.product,
                        quantity: item.quantity,
                        price: item.price, // Price per item at the time of sale
                        productDiscountRate: 0, // Assume no item-specific discount unless file provides it
                        effectivePrice: effectivePrice,
                        subtotal: subtotal
                    });
                }


                const total = parseFloat(row.total);
                if (isNaN(total) || total < 0) { errors.push({ row: rowNum, item: row, error: 'Invalid Total amount' }); continue; }
                const subtotal = parseFloat(row.subtotal || calculatedSubtotal); // Use file subtotal if provided, else calculated
                if (isNaN(subtotal) || subtotal < 0) { errors.push({ row: rowNum, item: row, error: 'Invalid Subtotal amount' }); continue; }
                const discount = parseFloat(row.discount || 0);
                if (isNaN(discount) || discount < 0) { errors.push({ row: rowNum, item: row, error: 'Invalid Discount amount' }); continue; }
                const tax = parseFloat(row.tax || 0);
                if (isNaN(tax) || tax < 0) { errors.push({ row: rowNum, item: row, error: 'Invalid Tax amount' }); continue; }

                // Validate totals roughly: subtotal - discount + tax should be close to total
                 const expectedTotal = subtotal - discount + tax;
                 if (Math.abs(expectedTotal - total) > 0.01) { // Allow for small floating point differences
                      errors.push({ row: rowNum, item: row, error: `Total mismatch. Subtotal (${subtotal}) - Discount (${discount}) + Tax (${tax}) = ${expectedTotal.toFixed(2)}, but Total provided is ${total}` });
                      continue;
                 }

                const amountPaid = parseFloat(row.amountPaid || total); // Assume fully paid if not specified
                if (isNaN(amountPaid) || amountPaid < 0) { errors.push({ row: rowNum, item: row, error: 'Invalid Amount Paid' }); continue; }

                let createdAt;
                try {
                    createdAt = new Date(row.createdAt);
                    if (isNaN(createdAt.getTime())) throw new Error();
                } catch (e) {
                    errors.push({ row: rowNum, item: row, error: 'Invalid createdAt date format' });
                    continue;
                }

                const paymentMethod = row.paymentMethod || 'cash';
                const paymentStatus = row.paymentStatus || (amountPaid >= total ? 'paid' : (amountPaid > 0 ? 'partial' : 'pending'));

                // --- Create Sale Document ---
                const saleDoc = {
                    billNumber: billNumber,
                    customer: {
                        name: row.customerName || 'Walk-in Customer',
                        phone: row.customerPhone || null,
                        email: row.customerEmail || null
                    },
                    items: validatedItems,
                    subtotal: subtotal,
                    discount: discount,
                    tax: tax,
                    total: total,
                    paymentMethod: paymentMethod,
                    paymentStatus: paymentStatus,
                    amountPaid: amountPaid,
                    change: Math.max(0, amountPaid - total),
                    notes: row.notes || '',
                    createdBy: req.user._id, // User performing the import
                    createdAt: createdAt, // Use date from file
                    updatedAt: createdAt, // Set updatedAt to same as createdAt for imports
                };

                await Sale.create(saleDoc);
                successCount++;

             
            } catch (err) {
                errors.push({ row: rowNum, item: row, error: err.message || 'Unknown processing error' });
            }
        }

        // Cleanup and Respond
        fs.unlinkSync(filePath);
        res.status(200).json({
            success: true,
            message: `Imported ${successCount} out of ${salesData.length} sales records.`,
            totalProcessed: salesData.length,
            successCount: successCount,
            errorCount: errors.length,
            errors: errors
        });

    } catch (error) {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath); // Clean up file on unexpected error
        }
        console.error('Sale import general error:', error);
        res.status(500).json({
            success: false,
            message: 'Sale import failed',
            error: error.message
        });
    }
};

// Download Sample Sale Import Template
exports.downloadSampleSaleTemplate = (req, res) => { // <-- NEW FUNCTION
    try {
        const sampleData = [
            {
                billNumber: 1001,
                createdAt: new Date().toISOString(), // Example: 2023-10-27T10:30:00.000Z
                customerName: "John Doe",
                customerPhone: "123-456-7890",
                customerEmail: "john.doe@example.com",
                // Format: "PRODUCT_ID:QTY:PRICE_PER_ITEM" separated by semicolons
                items: "67f6606051c326c002d6f0b0:2:25.50;67f6606051c326c002d6f0b1:1:15.00",
                subtotal: 66.00,
                discount: 5.00,
                tax: 6.10,
                total: 67.10,
                paymentMethod: "card",
                amountPaid: 67.10,
                paymentStatus: "paid",
                notes: "VIP Customer order"
            },
            {
                billNumber: 1002,
                createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
                customerName: "Jane Smith",
                customerPhone: "",
                customerEmail: "",
                items: "67f6606051c326c002d6f0b2:5:10.00",
                subtotal: 50.00,
                discount: 0,
                tax: 5.00,
                total: 55.00,
                paymentMethod: "cash",
                amountPaid: 55.00,
                paymentStatus: "paid",
                notes: ""
            }
        ];

        const worksheet = xlsx.utils.json_to_sheet(sampleData);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, "SalesData");

        // Set headers for download
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=" + "sample_sales_import.xlsx"
        );

        // Write workbook to response buffer
        const buffer = xlsx.write(workbook, { bookType: "xlsx", type: "buffer" });
        res.send(buffer);

    } catch (error) {
        console.error('Error generating sample sale template:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating sample file',
            error: error.message
        });
    }
};

