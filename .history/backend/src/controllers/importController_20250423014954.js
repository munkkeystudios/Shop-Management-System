const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { Product, Category, Supplier } = require('../models');

//make uploads directory
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

//multer config
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function(req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

//only csv files
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
        cb(null, true);
    } else {
        cb(new Error('Only CSV files are allowed'), false);
    }
};

//multer upload instance
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 *1024* 5 }//max 5mb
}).single('file');

// file upload with error  
exports.uploadMiddleware = (req, res, next) => {
    upload(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                success: false,
                message: 'File upload error',
                error: err.message
            });
        } else if (err) {
            //unknown error
            return res.status(400).json({
                success: false, 
                message: 'File upload failed',
                error: err.message
            });
        }
        //file upload success
        next();
    });
};

//import products from csv
exports.importProducts = async (req, res) => {
    // Check if file was uploaded`
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No file uploaded'
        });
    }

    try {
        const results = [];
        const errors = [];
        let successCount = 0;
        
        //read stream for the CSV file
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                //process each row in the CSV
                for (const item of results) {
                    try {
                        //validate fields
                        if (!item.name || !item.barcode || !item.price || !item.category || !item.supplier) {
                            errors.push({
                                item,
                                error: 'Missing required fields (name, barcode, price, category, supplier)'
                            });
                            continue;
                        }

                        //parse fields and check if value correct
                        const existingProduct = await Product.findOne({ barcode: item.barcode });
                        if (existingProduct) {
                            errors.push({
                                item,
                                error: `Product with barcode ${item.barcode} already exists`
                            });
                            continue;
                        }
                        const categoryExists = await Category.findById(item.category);
                        if (!categoryExists) {
                            errors.push({
                                item,
                                error: `Category with ID ${item.category} not found`
                            });
                            continue;
                        }
                        const supplierExists = await Supplier.findById(item.supplier);
                        if (!supplierExists) {
                            errors.push({
                                item,
                                error: `Supplier with ID ${item.supplier} not found`
                            });
                            continue;
                        }
                        const price = parseFloat(item.price);
                        if (isNaN(price) ||price < 0) {
                            errors.push({
                                item,
                                error: 'Price must be a valid non-negative number'
                            });
                            continue;
                        }
                        const quantity = item.quantity ? parseInt(item.quantity) : 0;
                        if (isNaN(quantity) || quantity < 0) {
                            errors.push({
                                item,
                                error: 'Quantity must be a valid non-negative integer'
                            });
                            continue;
                        }
                        const discountRate = item.discountRate ? parseFloat(item.discountRate) : 0;
                        if (isNaN(discountRate) || discountRate < 0 || discountRate > 100) {
                            errors.push({
                                item,
                                error: 'Discount rate must be between 0 and 100'
                            });
                            continue;
                        }

                        const productData = {
                            name: item.name,
                            barcode: item.barcode,
                            description: item.description || '',
                            price: price,
                            costPrice: item.costPrice ? parseFloat(item.costPrice) : undefined,
                            quantity: quantity,
                            category: item.category,
                            supplier: item.supplier,
                            discountRate: discountRate,
                            taxRate: item.taxRate ? parseFloat(item.taxRate) : 0,
                            minStockLevel: item.minStockLevel ? parseInt(item.minStockLevel) : 5,
                            status: item.status || 'active'
                        };

                        await Product.create(productData);
                        successCount++;
                    } catch (err) {
                        errors.push({
                            item,
                            error: err.message
                        });
                    }
                }

                //delete csv
                fs.unlinkSync(req.file.path);

                res.status(200).json({//response
                    success: true,
                    message: `Imported ${successCount} out of ${results.length} products`,
                    totalProcessed: results.length,
                    successCount: successCount,
                    errorCount: errors.length,
                    errors: errors
                });
            })
            .on('error', (error) => {
                //handle csv parsing errors
                fs.unlinkSync(req.file.path);
                res.status(500).json({
                    success: false,
                    message: 'Error parsing CSV file',
                    error: error.message
                });
            });
    } catch (error) {
        // clean up file
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({//error response
            success: false,
            message: 'Import failed',
            error: error.message
        });
    }
}; 
