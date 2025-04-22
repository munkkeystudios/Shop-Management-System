

// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\backend\src\controllers\brandController.js ---
// ============================================================================

const { Brand } = require('../models');
const mongoose = require('mongoose');

// Get all brands
exports.getAllBrands = async (req, res) => {
  try {
    console.log('getAllBrands called');

    // Check if Brand model is properly defined
    console.log('Brand model:', typeof Brand);
    console.log('Brand model value:', Brand);
    console.log('Brand schema:', Brand && Brand.schema ? 'Exists' : 'Not found');

    // Check if the brands collection exists in the database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in database:');
    collections.forEach(collection => {
      console.log(' - ' + collection.name);
    });

    const brandsCollectionExists = collections.some(collection => collection.name === 'brands');
    console.log('Brands collection exists (controller):', brandsCollectionExists);

    // If brands collection doesn't exist, create it
    if (!brandsCollectionExists) {
      console.log('Creating brands collection...');
      try {
        // Create a test brand to initialize the collection
        const testBrand = new Brand({
          name: 'Test Brand',
          description: 'This is a test brand created automatically',
          active: true
        });
        await testBrand.save();
        console.log('Test brand created successfully');
      } catch (err) {
        console.error('Error creating test brand:', err);
      }
    }

    // Try to find all brands
    console.log('Attempting to find brands...');
    const brands = await Brand.find({}).sort({ name: 1 });
    console.log('Brands found:', brands.length);
    console.log('Brands data:', JSON.stringify(brands));

    res.status(200).json({
      success: true,
      count: brands.length,
      data: brands
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get brand by ID
exports.getBrandById = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    res.status(200).json({
      success: true,
      data: brand
    });
  } catch (error) {
    console.error('Error fetching brand:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Create new brand
exports.createBrand = async (req, res) => {
  try {
    const { name, description, active } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a brand name'
      });
    }

    // Check if brand with same name exists
    const existingBrand = await Brand.findOne({ name });

    if (existingBrand) {
      return res.status(400).json({
        success: false,
        message: 'A brand with this name already exists'
      });
    }

    const brand = await Brand.create({
      name,
      description,
      active
    });

    res.status(201).json({
      success: true,
      message: 'Brand created successfully',
      data: brand
    });
  } catch (error) {
    console.error('Error creating brand:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Update brand
exports.updateBrand = async (req, res) => {
  try {
    const { name, description, active } = req.body;

    let brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    // Check if name exists when updating name
    if (name && name !== brand.name) {
      const existingBrand = await Brand.findOne({ name });

      if (existingBrand) {
        return res.status(400).json({
          success: false,
          message: 'A brand with this name already exists'
        });
      }
    }

    // Update brand
    brand = await Brand.findByIdAndUpdate(
      req.params.id,
      {
        name: name || brand.name,
        description: description !== undefined ? description : brand.description,
        active: active !== undefined ? active : brand.active
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Brand updated successfully',
      data: brand
    });
  } catch (error) {
    console.error('Error updating brand:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Delete brand
exports.deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    await Brand.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Brand deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting brand:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// --- File End: brandController.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\backend\src\controllers\categoryController.js ---
// ============================================================================

const { Category } = require('../models');

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

//get a category by id
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

//create new category
exports.createCategory = async (req, res) => {
  try {
    const { name, description, active } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a category name'
      });
    }
    
    //if a cateory with same name exists give error
    const existingCategory = await Category.findOne({ name });
    
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'A category with this name already exists'
      });
    }
    
    const category = await Category.create({
      name,
      description,
      active
    });
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

//update category's details
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, active } = req.body;
    
    let category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    //if chaging name, check if same name exists
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ name });
      
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'A category with this name already exists'
        });
      }
    }
    
    //update
    category = await Category.findByIdAndUpdate(
      req.params.id,
      { 
        name: name || category.name,
        description: description !== undefined ? description : category.description,
        active: active !== undefined ? active : category.active
      },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

//deleting a category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    await Category.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
}; 

// --- File End: categoryController.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\backend\src\controllers\importController.js ---
// ============================================================================

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

// --- File End: importController.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\backend\src\controllers\productController.js ---
// ============================================================================

const { Product, Category, Supplier } = require('../models');

//gt all products
exports.getAllProducts = async (req, res) => {
  try {
    //parameters for iltering
    const { 
      category, 
      supplier, 
      status, 
      minPrice, 
      maxPrice, 
      inStock, 
      sortBy = 'createdAt', 
      order = 'desc',
      limit = 50,
      page = 1
    } = req.query;
    
    const query = {};
    
    //use filters if provided
    if (category) query.category = category;
    if (supplier) query.supplier = supplier;
    if (status) query.status = status;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    if (inStock === 'true') query.quantity = { $gt: 0 };
    if (inStock === 'false') query.quantity = { $lte: 0 };
    
    //spread onto different pages
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    //excute query
    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('supplier', 'name')
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    //total count of pages
    const total = await Product.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

//search product by its details
exports.searchProducts = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search query'
      });
    }
    
    //using text index or regex for partial matches
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { barcode: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    })
    .populate('category', 'name')
    .populate('supplier', 'name')
    .limit(20);
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

//get product by id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('supplier', 'name');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

//create new product by giving all details
exports.createProduct = async (req, res) => {
  try {
    const { 
      name, 
      barcode, 
      description, 
      price, 
      quantity, 
      category, 
      supplier, 
      images, 
      status,
      costPrice,
      taxRate,
      minStockLevel,
      discountRate
    } = req.body;
    
    //make sure these fields are always provided
    if (!name || !barcode || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, barcode, price, category'
      });
    }
    
    //make sure no pther product with same barcode
    const existingProduct = await Product.findOne({ barcode });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'A product with this barcode already exists'
      });
    }
    
    //make sure that the selected catgory exits
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    //same for supplier check if it exists
    const supplierExists = await Supplier.findById(supplier);
    if (!supplierExists) {
      return res.status(400).json({
        success: false,
        message: 'Supplier not found'
      });
    }
    
    //create a product
    const product = await Product.create({
      name,
      barcode,
      description,
      price,
      quantity,
      category,
      supplier,
      images,
      status,
      costPrice,
      taxRate,
      minStockLevel,
      discountRate
    });
    
    await product.populate('category', 'name');
    await product.populate('supplier', 'name');
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

//update a product with thes enew details
exports.updateProduct = async (req, res) => {
  try {
    const { 
      name, 
      barcode, 
      description, 
      price, 
      quantity, 
      category, 
      supplier, 
      images, 
      status,
      costPrice,
      taxRate,
      minStockLevel,
      discountRate
    } = req.body;
    
    //first find the product
    let product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    //validate discout rate
    if (discountRate !== undefined && (discountRate < 0 || discountRate > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Discount rate must be between 0 and 100'
      });
    }
    
    //check if the barcode being changed isn't already being used
    if (barcode && barcode !== product.barcode) {
      const existingProduct = await Product.findOne({ barcode });
      if (existingProduct && existingProduct._id.toString() !== req.params.id) {
        return res.status(400).json({
          success: false,
          message: 'A product with this barcode already exists'
        });
      }
    }
    
    //verrify category existance
    if (category && category !== product.category.toString()) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: 'Category not found'
        });
      }
    }
    
    //verify supplier existance
    if (supplier && supplier !== product.supplier.toString()) {
      const supplierExists = await Supplier.findById(supplier);
      if (!supplierExists) {
        return res.status(400).json({
          success: false,
          message: 'Supplier not found'
        });
      }
    }
    
    //update these details if provided
    const updateData = {
      name: name !== undefined ? name : product.name,
      barcode: barcode !== undefined ? barcode : product.barcode,
      description: description !== undefined ? description : product.description,
      price: price !== undefined ? price : product.price,
      category: category !== undefined ? category : product.category,
      supplier: supplier !== undefined ? supplier : product.supplier,
      images: images !== undefined ? images : product.images,
      status: status !== undefined ? status : product.status,
      costPrice: costPrice !== undefined ? costPrice : product.costPrice,
      taxRate: taxRate !== undefined ? taxRate : product.taxRate,
      minStockLevel: minStockLevel !== undefined ? minStockLevel : product.minStockLevel,
      discountRate: discountRate !== undefined ? discountRate : product.discountRate
    };
    
    //update laststocked if quantity changed
    if (quantity !== undefined && quantity !== product.quantity) {
      updateData.quantity = quantity;
      updateData.lastStocked = Date.now();
    }
    
    //use above data to update it
    product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('category', 'name')
    .populate('supplier', 'name');
    
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

//delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    await Product.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

//only update the stock of a product
exports.updateStock = async (req, res) => {
  try {
    const { quantity } = req.body;
    
    if (quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide quantity'
      });
    }
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // chage stoc and last stocked date (maybe only change last stocked when quantity increased?)
    product.quantity = quantity;
    product.lastStocked = Date.now();
    
    //automatic status update
    if (quantity <= 0) {
      product.status = 'out_of_stock';
    } else if (product.status === 'out_of_stock') {
      product.status = 'active';
    }
    
    await product.save();
    
    res.status(200).json({
      success: true,
      message: 'Stock updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

//get products low on stock
exports.getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({
      $expr: { $lte: ['$quantity', '$minStockLevel'] },
      status: { $ne: 'discontinued' }
    })
    .populate('category', 'name')
    .populate('supplier', 'name')
    .sort({ quantity: 1 });
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
}; 

// --- File End: productController.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\backend\src\controllers\purchaseController.js ---
// ============================================================================

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

// --- File End: purchaseController.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\backend\src\controllers\saleController.js ---
// ============================================================================


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

// --- File End: saleController.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\backend\src\controllers\supplierController.js ---
// ============================================================================

const { Supplier } = require('../models');

exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({}).sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers
    });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    res.status(200).json({
      success: true,
      data: supplier
    });
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

//create a new supplier
exports.createSupplier = async (req, res) => {
  try {
    const { name, contactPerson, email, phone, address, active, notes } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a supplier name'
      });
    }

    //matching supplier name
    const existingSupplier = await Supplier.findOne({ name });

    if (existingSupplier) {
      return res.status(400).json({
        success: false,
        message: 'A supplier with this name already exists'
      });
    }

    const supplier = await Supplier.create({
      name,
      contactPerson,
      email,
      phone,
      address,
      active,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: supplier
    });
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

//update a supplier
exports.updateSupplier = async (req, res) => {
  try {
    const { name, contactPerson, email, phone, address, active, notes } = req.body;

    //find supplier by id
    let supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    //check if name duplicate
    if (name && name !== supplier.name) {
      const existingSupplier = await Supplier.findOne({ name });

      if (existingSupplier) {
        return res.status(400).json({
          success: false,
          message: 'A supplier with this name already exists'
        });
      }
    }

    //update supplier
    supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      {
        name: name || supplier.name,
        contactPerson: contactPerson !== undefined ? contactPerson : supplier.contactPerson,
        email: email !== undefined ? email : supplier.email,
        phone: phone !== undefined ? phone : supplier.phone,
        address: address !== undefined ? address : supplier.address,
        active: active !== undefined ? active : supplier.active,
        notes: notes !== undefined ? notes : supplier.notes
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Supplier updated successfully',
      data: supplier
    });
  } catch (error) {
    console.error('Error updating supplier:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

//delete a supplier
exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    await Supplier.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
}; 

// --- File End: supplierController.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\backend\src\controllers\userController.js ---
// ============================================================================




const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required"
      });
    }

    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
      if (!user.active) {
         return res.status(403).json({
            success: false,
            message: "Account is inactive. Please contact an administrator."
         });
      }

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.warn('Warning: JWT_SECRET environment variable not set. Using insecure default value.');
      }

      const token = jwt.sign({
        userId: user._id,
        username: user.username,
        role: user.role
      }, jwtSecret || 'your-secret-key-for-jwt-tokens', { expiresIn: '24h' });

      res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          username: user.username,
          role: user.role,
          name: user.name // Include name in login response
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid username or password"
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error during login",
      error: error.message
    });
  }
};

exports.adminCreateUser = async (req, res) => {
    try {
        const { username, password, role, active, name, phone } = req.body;

        if (!username || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Username, password, and role are required."
            });
        }

        if (!['manager', 'cashier'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role specified. Can only create 'manager' or 'cashier'."
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long."
            });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Username already exists."
            });
        }

        const user = await User.create({
            username,
            password,
            role,
            active: active !== undefined ? active : true,
            name,
            phone
        });

         const userResponse = user.toObject();
         delete userResponse.password;

        res.status(201).json({
            success: true,
            message: "User created successfully by admin.",
            data: userResponse
        });

    } catch (error) {
        console.error("Admin create user error:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({
            success: false,
            message: "Error creating user",
            error: error.message
        });
    }
};


exports.getAllUsers = async (req, res) => {
  try {

    const users = await User.find({}).select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error fetching users',
      error: error.message
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
     if (!req.user || !req.user._id) {
         return res.status(401).json({ success: false, message: 'Authentication required.' });
     }
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error fetching profile',
      error: error.message
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, password, role, active, name, phone } = req.body;

    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (role && role !== user.role) {
        if (!['manager', 'cashier'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role specified. Can only assign 'manager' or 'cashier'."
            });
        }
        user.role = role;
    }

     if (active !== undefined && active !== user.active) {
         user.active = active;
    }


    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser && existingUser._id.toString() !== userId) {
        return res.status(400).json({
          success: false,
          message: 'Username already exists'
        });
      }
      user.username = username;
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;


    if (password) {
      if (password.length < 6) {
         return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
      }
      user.password = password;
    }

    const updatedUser = await user.save();

    const userResponse = updatedUser.toObject();
    delete userResponse.password;


    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: error.message });
    }
     if (error.code === 11000) {
         return res.status(400).json({ success: false, message: 'Username already exists.' });
     }
    res.status(500).json({
      success: false,
      message: 'Server Error updating user',
      error: error.message
    });
  }
};


exports.updateMyPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Current and new passwords are required.' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
        }

        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: 'Authentication required.' });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
             return res.status(404).json({ success: false, message: 'User not found.' });
        }

        if (!(await user.matchPassword(currentPassword))) {
            return res.status(401).json({ success: false, message: 'Incorrect current password.' });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ success: true, message: 'Password updated successfully' });

    } catch (error) {
        console.error('Error updating own password:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error updating password',
            error: error.message
        });
    }
};


exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;


    if (req.user._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
     if (user.role === 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Cannot delete an admin account.'
        });
    }


    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error when deleting user',
      error: error.message
    });
  }
};

exports.exportUsers = async (req, res) => {
  try {

    const { format = 'csv' } = req.query;

    const users = await User.find({}).select('-password').lean();

    if (format.toLowerCase() === 'csv') {
      if (users.length === 0) {
        return res.status(200).send('No user data to export.');
      }

      const { Parser } = require('json2csv');

      const fields = ['_id', 'username', 'role', 'name', 'phone', 'active', 'createdAt', 'updatedAt'];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(users);

      res.header('Content-Type', 'text/csv');
      res.attachment('users.csv');
      res.status(200).send(csv);

    } else if (format.toLowerCase() === 'pdf') {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 50, layout: 'landscape' });

      res.header('Content-Type', 'application/pdf');
      res.attachment('users.pdf');
      doc.pipe(res);

      doc.fontSize(18).text('User Report', { align: 'center' }).moveDown();

       if (users.length === 0) {
         doc.fontSize(12).text('No user data to export.');
         doc.end();
         return;
      }

      const tableTop = doc.y;
      const headers = ['ID', 'Username', 'Name', 'Phone', 'Role', 'Active', 'Created At'];
      const colWidths = [120, 100, 120, 100, 80, 50, 90];
      let x = doc.page.margins.left;

      headers.forEach((header, i) => {
        doc.fontSize(9).text(header, x, tableTop, { width: colWidths[i], align: 'left', underline: true });
        x += colWidths[i];
      });

      let y = tableTop + 20;
      users.forEach(user => {
        x = doc.page.margins.left;
        const row = [
          user._id.toString(),
          user.username,
          user.name || '',
          user.phone || '',
          user.role,
          user.active ? 'Yes' : 'No',
          user.createdAt.toDateString()
        ];

        row.forEach((cell, i) => {
          doc.fontSize(8).text(cell, x, y, { width: colWidths[i], align: 'left' });
          x += colWidths[i];
        });

        y += 20;
        if (y > doc.page.height - doc.page.margins.bottom - 20) {
          doc.addPage({layout: 'landscape'});
          y = doc.page.margins.top;
           x = doc.page.margins.left;
           headers.forEach((header, i) => {
             doc.fontSize(9).text(header, x, y, { width: colWidths[i], align: 'left', underline: true });
             x += colWidths[i];
           });
           y += 20;
        }
      });

      doc.end();

    } else {
      res.status(400).json({ success: false, message: "Invalid export format specified. Use 'csv' or 'pdf'." });
    }

  } catch (error) {
    console.error('Error exporting users:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error exporting users',
      error: error.message
    });
  }
};



// --- File End: userController.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\backend\src\middleware\auth.js ---
// ============================================================================

const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
    try {
        // TEMPORARY: Skip authentication for testing
        // Create a mock admin user
        req.user = {
            _id: '123456789012345678901234',
            username: 'admin',
            role: 'admin'
        };
        return next();

        // Original authentication code below
        /*
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please provide a token.'
            });
        }

        const token = authHeader.split(' ')[1];

        // Use environment variable with fallback, but warn if using fallback
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.warn('Warning: JWT_SECRET environment variable not set. Using insecure default value.');
        }

        const decoded = jwt.verify(token, jwtSecret || 'your-secret-key-for-jwt-tokens');

        const user = await User.findById(decoded.userId || decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found or invalid token.'
            });
        }

        // Attach the full user object to the request for controllers to use
        req.user = user;
        next();
        */
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
            error: error.message
        });
    }
};

module.exports = auth;

// --- File End: auth.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\backend\src\middleware\permissions.js ---
// ============================================================================




const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access denied: Admin privileges required' });
    }
};

const isManager = (req, res, next) => {
    if (req.user && (req.user.role === 'manager' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access denied: Manager or Admin privileges required' });
    }
};

const isCashier = (req, res, next) => {
    if (req.user && (req.user.role === 'cashier' || req.user.role === 'manager' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access denied: Authenticated employee access required' });
    }
};


module.exports = {
    isAdmin,
    isManager,
    isCashier
};



// --- File End: permissions.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\backend\src\models\brand.js ---
// ============================================================================

const mongoose = require('mongoose');

const BrandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // to add createdAt and updatedAt
});

// Add indexes to improve query performance
BrandSchema.index({ name: 'text' });

let Brand;
try {
  // Explicitly use lowercase 'brands' collection
  Brand = mongoose.models.Brand || mongoose.model('Brand', BrandSchema, 'brands');
  console.log('Brand model created with collection: brands');
} catch (error) {
  console.error(`Brand Model Creation Error: ${error.message}`);
  Brand = mongoose.model('Brand', BrandSchema, 'brands');
}

module.exports = Brand;

// --- File End: brand.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\backend\src\models\category.js ---
// ============================================================================

const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true //to add createdAt and updatedAt
});

let Category;
try {
  Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
} catch (error) {
  Category = mongoose.model('Category', CategorySchema);
}

module.exports = Category; 

// --- File End: category.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\backend\src\models\index.js ---
// ============================================================================


const mongoose = require('mongoose');
const Product = require('./product');
const Category = require('./category');
const Supplier = require('./supplier');
const User = require('./user');
const Sale = require('./sale');
const Purchase = require('./purchase');
const Brand = require('./brand');

// This file just exports all models
// MongoDB connection is now handled in server.js

module.exports = {
  Product,
  Category,
  Supplier,
  User,
  Sale,
  Purchase,
  Brand
};


// --- File End: index.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\backend\src\models\product.js ---
// ============================================================================

const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  barcode: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discountRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
    validate: {
      validator: function(v) {
        return v >= 0 && v <= 100;
      },
      message: 'Discount rate must be between 0 and 100'
    }
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  lastStocked: {
    type: Date,
    default: Date.now
  },
  images: {
    type: [String], //array of img urls or paths
    default: []
  },
  status: {
    type: String,
    enum: ['active', 'discontinued', 'out_of_stock'],
    default: 'active'
  },
  costPrice: {
    type: Number,
    min: 0
  },
  taxRate: {
    type: Number,
    default: 0,
    min: 0
  },
  minStockLevel: {
    type: Number,
    default: 5,
    min: 0
  }
}, {
  timestamps: true //to automatically add createdat and updatedat
});

ProductSchema.virtual('discountedPrice').get(function() {
  if (!this.discountRate || this.discountRate === 0) {
    return this.price;
  }
  const discountAmount = (this.price * this.discountRate) / 100;
  return parseFloat((this.price - discountAmount).toFixed(2));
});

ProductSchema.index({ name: 'text', barcode: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ supplier: 1 });
ProductSchema.index({ status: 1 });

//checks if product is low on stock
ProductSchema.virtual('isLowStock').get(function() {
  return this.quantity <= this.minStockLevel;
});

ProductSchema.pre('save', function(next) {
  next();
});

let Product;
try {
  Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
} catch (error) {
  Product = mongoose.model('Product', ProductSchema);
}

module.exports = Product; 

// --- File End: product.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\backend\src\models\purchase.js ---
// ============================================================================

// const mongoose = require('mongoose');

// const PurchaseItemSchema = new mongoose.Schema({
//   product: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Product',
//     required: true
//   },
//   quantity: {
//     type: Number,
//     required: true,
//     min: 1
//   },
//   price: { 
//     type: Number,
//     required: true,
//     min: 0
//   },
// }, { _id: false }); 

// const PurchaseSchema = new mongoose.Schema({
//   supplier: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Supplier',
//     required: true
//   },
//   purchaseDate: {
//     type: Date,
//     default: Date.now,
//     required: true
//   },
//   items: [PurchaseItemSchema],
//   totalAmount: {
//     type: Number,
//     required: true,
//     min: 0
//   },
//   paymentStatus: {
//     type: String,
//     enum: ['paid', 'pending', 'partial'],
//     default: 'pending'
//   },
//   notes: String,
//   createdBy: { 
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'users', 
//     required: true
//   }
// }, {
//   timestamps: true 
// });


// PurchaseSchema.index({ supplier: 1 });
// PurchaseSchema.index({ purchaseDate: -1 });
// PurchaseSchema.index({ createdBy: 1 });

// let Purchase;
// try {
  
//   Purchase = mongoose.models.Purchase || mongoose.model('Purchase', PurchaseSchema);
// } catch (error) {
//   console.error(`Purchase Model Creation Error: ${error.message}`);
//   Purchase = mongoose.model('Purchase', PurchaseSchema);
// }

// module.exports = Purchase;


// Modifications to add to your existing Purchase model if needed
// You can incorporate these changes into your existing model

const mongoose = require('mongoose');

const PurchaseItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  // Added for consistency with import UI
  subtotal: {
    type: Number,
    get: function() {
      return this.price * this.quantity;
    }
  }
}, { _id: false, toJSON: { getters: true } });

const PurchaseSchema = new mongoose.Schema({
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  // Renamed from purchaseDate to match the import UI
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  // Optional - matches the UI but not in your current model
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
  },
  items: [PurchaseItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  // Optional fields to match the UI
  tax: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  // For consistency with your UI
  status: {
    type: String,
    enum: ['received', 'pending', 'ordered', 'cancelled'],
    default: 'pending'
  },
  // Existing fields
  paymentStatus: {
    type: String,
    enum: ['paid', 'pending', 'partial'],
    default: 'pending'
  },
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  }
}, {
  timestamps: true
});

// Keep your existing indexes
PurchaseSchema.index({ supplier: 1 });
PurchaseSchema.index({ date: -1 });
PurchaseSchema.index({ createdBy: 1 });

// Optional - Add new index for warehouse if you add it
PurchaseSchema.index({ warehouse: 1 });

let Purchase;
try {
  Purchase = mongoose.models.Purchase || mongoose.model('Purchase', PurchaseSchema);
} catch (error) {
  console.error(`Purchase Model Creation Error: ${error.message}`);
  Purchase = mongoose.model('Purchase', PurchaseSchema);
}

module.exports = Purchase;

// --- File End: purchase.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\backend\src\models\sale.js ---
// ============================================================================

const mongoose = require('mongoose');

const SaleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  productDiscountRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  effectivePrice: {
    type: Number,
    required: true,
    min: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  }
});

const SaleSchema = new mongoose.Schema({
  billNumber: {
    type: Number,
    required: true,
    unique: true
  },
  customer: {
    name: {
      type: String,
      default: 'Walk-in Customer'
    },
    phone: String,
    email: String
  },
  items: [SaleItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'mobile_payment', 'credit'],
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'pending', 'partial'],
    default: 'paid'
  },
  amountPaid: {
    type: Number,
    default: 0,
    min: 0
  },
  change: {
    type: Number,
    default: 0,
    min: 0
  },
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  }
}, {
  timestamps: true
});

//indexing to speed up queries
SaleSchema.index({ billNumber: 1 });
SaleSchema.index({ createdAt: -1 });
SaleSchema.index({ createdBy: 1 });
SaleSchema.index({ 'customer.name': 'text', 'customer.phone': 'text' });

let Sale;
try {
  Sale = mongoose.models.Sale || mongoose.model('Sale', SaleSchema);
} catch (error) {
  console.error(`Model Creation Error: ${error.message}`);
  Sale = mongoose.model('Sale', SaleSchema);
}

module.exports = Sale; 

// --- File End: sale.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\backend\src\models\supplier.js ---
// ============================================================================

const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  contactPerson: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

let Supplier;
try {
  Supplier = mongoose.models.Supplier || mongoose.model('Supplier', SupplierSchema);
} catch (error) {
  Supplier = mongoose.model('Supplier', SupplierSchema);
}

module.exports = Supplier; 

// --- File End: supplier.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\backend\src\models\user.js ---
// ============================================================================


const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required.'],
    trim: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Password is required.'],
    minlength: [6, 'Password must be at least 6 characters long.']
  },
  role: {
    type: String,
    enum: {
        values: ['admin', 'manager', 'cashier'], // Updated roles
        message: '{VALUE} is not a supported role.'
    },
    default: 'cashier'
  },
  active: {
    type: Boolean,
    default: true
  },
  name: {
     type: String,
     trim: true,
  },
  phone: {
     type: String,
     trim: true,
  }
}, {
  timestamps: true
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.error('Error hashing password:', error);
    next(error);
  }
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
   try {
      return await bcrypt.compare(enteredPassword, this.password);
   } catch (error) {
     console.error("Error comparing password:", error);
     return false;
   }
};


let User;
try {
  User = mongoose.models.users || mongoose.model("users", UserSchema);
} catch (error) {
  console.error(`User Model Creation Error: ${error.message}`);
  User = mongoose.model("users", UserSchema);
}

module.exports = User;




// --- File End: user.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\backend\src\routes\api.js ---
// ============================================================================



const express = require('express');
const router = express.Router();

// Controller Imports
const categoryController = require('../controllers/categoryController');
const supplierController = require('../controllers/supplierController');
const productController = require('../controllers/productController');
const userController = require('../controllers/userController');
const saleController = require('../controllers/saleController');
const importController = require('../controllers/importController');
const purchaseController = require('../controllers/purchaseController');
const brandController = require('../controllers/brandController');

// Middleware Imports
const auth = require('../middleware/auth');
const { isAdmin, isManager, isCashier } = require('../middleware/permissions');

// --- Public Routes ---
router.post('/login', userController.login);
// router.post('/signup', userController.register); // Keep commented out

// --- Apply Auth Middleware to all subsequent routes ---
router.use(auth);

// --- Authenticated Routes (Minimum Role: Cashier) ---

// User profile and password update (Self)
router.get('/users/profile', userController.getProfile); // Any authenticated user
router.put('/users/me/password', userController.updateMyPassword); // Any authenticated user

// General Read Operations
router.get('/categories', isCashier, categoryController.getAllCategories);
router.get('/categories/:id', isCashier, categoryController.getCategoryById);
router.get('/suppliers', isCashier, supplierController.getAllSuppliers);
router.get('/suppliers/:id', isCashier, supplierController.getSupplierById);
router.get('/products', isCashier, productController.getAllProducts);
router.get('/products/search', isCashier, productController.searchProducts);
router.get('/products/low-stock', isCashier, productController.getLowStockProducts);
router.get('/products/:id', isCashier, productController.getProductById); // Product :id is okay here

// Specific Sales Routes (BEFORE Generic /sales/:id)
router.get('/sales/last-bill-number', isCashier, saleController.getLastBillNumber);

// Purchase Read Operations
router.get('/purchases', isCashier, purchaseController.getAllPurchases); // Base read access
router.get('/purchases/:id', isCashier, purchaseController.getPurchaseById); // Purchase :id is okay here

// Brand Read Operations
router.get('/brands', isCashier, brandController.getAllBrands); // Base read access
router.get('/brands/:id', isCashier, brandController.getBrandById); // Brand :id is okay here

// Sales Operations
router.post('/sales', isCashier, saleController.createSale);
router.put('/sales/:id/payment', isCashier, saleController.updatePaymentStatus); // This uses :id but targets /payment specifically

// --- Manager Level Routes (Minimum Role: Manager) ---

// Product Management
router.post('/products', isManager, productController.createProduct);
router.put('/products/:id', isManager, productController.updateProduct);
router.delete('/products/:id', isManager, productController.deleteProduct);
router.patch('/products/:id/stock', isManager, productController.updateStock);

// Category Management
router.post('/categories', isManager, categoryController.createCategory);
router.put('/categories/:id', isManager, categoryController.updateCategory);
router.delete('/categories/:id', isManager, categoryController.deleteCategory);

// Supplier Management
router.post('/suppliers', isManager, supplierController.createSupplier);
router.put('/suppliers/:id', isManager, supplierController.updateSupplier);
router.delete('/suppliers/:id', isManager, supplierController.deleteSupplier);

// Brand Management
router.post('/brands', isManager, brandController.createBrand);
router.put('/brands/:id', isManager, brandController.updateBrand);
router.delete('/brands/:id', isManager, brandController.deleteBrand);

// Purchase Management
router.post('/purchases', isManager, purchaseController.createPurchase);
router.get('/purchases/export', isManager, purchaseController.exportPurchases); // Specific purchase route

// Reporting & Exports (Specific Sales Routes BEFORE Generic /sales/:id)
router.get('/sales', isManager, saleController.getSales); // Manager+ can view all sales list
router.get('/sales/stats', isManager, saleController.getSalesStats); // Specific route
router.get('/sales/export', isManager, saleController.exportSales); // Specific route

// Import
router.post('/import/products', isManager, importController.uploadMiddleware, importController.importProducts);

// --- Admin Only Routes (Role: Admin) ---

// User Management
router.get('/users', isAdmin, userController.getAllUsers);
router.post('/users', isAdmin, userController.adminCreateUser);
router.put('/users/:userId', isAdmin, userController.updateUser); // Admin updates any user
router.delete('/users/:userId', isAdmin, userController.deleteUser);
router.get('/users/export', isAdmin, userController.exportUsers); // Specific user route

// --- Generic :id routes (Must come AFTER more specific routes for the same resource) ---
router.get('/sales/:id', isCashier, saleController.getSaleById); // Generic sales :id route is placed last for /sales path

// --- Test Route ---
router.get('/test', (req, res) => { // Doesn't need specific role after auth
  res.status(200).json({ success: true, message: 'Test route works!' });
});

module.exports = router;



// --- File End: api.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\backend\src\server.js ---
// ============================================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const apiRoutes = require('./routes/api');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Check for MongoDB URI
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
    console.warn('Warning: MONGODB_URI environment variable not set. Using default connection string.');
}

// Connect to MongoDB
mongoose.connect(mongoURI || 'mongodb://localhost:27017/shop-management', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
})
    .then(() => {
        console.log('Connected to MongoDB');

        // List all collections in the database
        mongoose.connection.db.listCollections().toArray(function(err, collections) {
            if (err) {
                console.error('Error listing collections:', err);
                return;
            }

            console.log('Collections in database:');
            collections.forEach(collection => {
                console.log(' - ' + collection.name);
            });

            // Check if brands collection exists
            const brandsCollectionExists = collections.some(collection => collection.name === 'brands');
            console.log('Brands collection exists:', brandsCollectionExists);

            // If brands collection doesn't exist, create a test brand
            if (!brandsCollectionExists) {
                console.log('Creating test brand...');
                const Brand = require('./models/brand');
                Brand.create({
                    name: 'Test Brand',
                    description: 'This is a test brand created automatically',
                    active: true
                })
                .then(brand => console.log('Test brand created:', brand))
                .catch(err => console.error('Error creating test brand:', err));
            }
        });
    })
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// --- File End: server.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\App.js ---
// ============================================================================

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// eventually make it so all this import components/pages comes in 1 line
import MainDashboard from "./pages/main_dashboard";
import AllProducts from "./pages/all_products";
import Inventory from "./pages/inventory";
import Reports from "./pages/reports";
import Pos from "./pages/pos";
import Login from "./pages/Login";
import CreateUser from "./pages/create_user";
import CategoryPage from "./pages/categories";
import CreateProducts from "./pages/create_products";
import AllUsers from "./pages/all_users";
import  Brands  from "./pages/brands";
import { Frame } from "./pages/supplier";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { Frame as Sales } from "./pages/sales";
import SalesReport from "./pages/sales-report";
import ImportPurchase from "./pages/ImportPurchase";
import EmployeeManagement from "./pages/EmployeeManagement";




function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <MainDashboard />
              </ProtectedRoute>
            } />
            <Route path="/all_products" element={
              <ProtectedRoute>
                <AllProducts />
              </ProtectedRoute>
            } />
            <Route path="/inventory" element={
              <ProtectedRoute>
                <Inventory />
              </ProtectedRoute>
            } />
            <Route path="/categories" element={
              <ProtectedRoute>
                <CategoryPage />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="/create_products" element={
              <ProtectedRoute>
                <CreateProducts />
              </ProtectedRoute>
            } />
            <Route path="/pos" element={
              <ProtectedRoute>
                <Pos />
              </ProtectedRoute>
            } />
            <Route path="/all_users" element={
              <ProtectedRoute>
                <AllUsers />
              </ProtectedRoute>
            } />
            <Route path="/brands" element={
              <ProtectedRoute>
                <Brands />
              </ProtectedRoute>
            } />
            <Route path="/supplier" element={
              <ProtectedRoute>
                <Frame />
              </ProtectedRoute>
            } />
            <Route path="/create-user" element={
              <ProtectedRoute>
                <CreateUser />
              </ProtectedRoute>
            } />
            <Route path="/sales" element={
              <ProtectedRoute>
                <Sales />
              </ProtectedRoute>
            } />
            <Route path="/sales-report" element={
              <ProtectedRoute>
                <SalesReport />
              </ProtectedRoute>
            } />
            <Route path="/import_purchases" element={
              <ProtectedRoute>
                <ImportPurchase />
              </ProtectedRoute>
            } />

            <Route path="/employee-management" element={ <ProtectedRoute requiredRole="admin"><EmployeeManagement /></ProtectedRoute> } />  

            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;


// --- File End: App.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\App.test.js ---
// ============================================================================

import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});


// --- File End: App.test.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\components\AISalesInsights.js ---
// ============================================================================

import React, { useState, useEffect } from 'react';
import { FaRobot, FaLightbulb, FaChartLine, FaExclamationTriangle } from 'react-icons/fa';

const AISalesInsights = ({ sales, salesStats }) => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only generate insights if we have data
    if (sales && sales.length > 0 && salesStats) {
      generateInsights();
    } else {
      setInsights([]);
      setLoading(false);
    }
  }, [sales, salesStats]);

  const generateInsights = () => {
    setLoading(true);

    // This would ideally be an API call to a backend AI service
    // For now, we'll simulate it with some business logic

    setTimeout(() => {
      const generatedInsights = [];

      // Insight 1: Overall sales performance
      const totalSales = salesStats.overall.totalSalesValue;
      const totalTransactions = salesStats.overall.totalTransactions;

      if (totalTransactions > 0) {
        let performanceInsight = {
          id: 1,
          type: 'performance',
          icon: <FaChartLine />,
          title: 'Sales Performance',
          content: `Total sales of $${totalSales.toFixed(2)} across ${totalTransactions} transactions, with an average sale value of $${salesStats.overall.averageSaleValue.toFixed(2)}.`
        };

        // Add recommendation based on average sale value
        if (salesStats.overall.averageSaleValue < 50) {
          performanceInsight.content += ' Consider implementing upselling strategies to increase average transaction value.';
        } else if (salesStats.overall.averageSaleValue > 200) {
          performanceInsight.content += ' Your high average transaction value indicates successful premium product sales or bundling.';
        }

        generatedInsights.push(performanceInsight);
      }

      // Insight 2: Payment method analysis
      if (salesStats.byPaymentMethod && salesStats.byPaymentMethod.length > 0) {
        // Find most popular payment method
        const sortedMethods = [...salesStats.byPaymentMethod].sort((a, b) => b.count - a.count);
        const topMethod = sortedMethods[0];

        if (topMethod) {
          const percentageUsed = (topMethod.count / totalTransactions * 100).toFixed(1);

          let paymentInsight = {
            id: 2,
            type: 'payment',
            icon: <FaLightbulb />,
            title: 'Payment Preferences',
            content: `${topMethod._id.charAt(0).toUpperCase() + topMethod._id.slice(1)} is your customers\' preferred payment method (${percentageUsed}% of transactions).`
          };

          // Add recommendation if one method is heavily dominant
          if (percentageUsed > 80) {
            paymentInsight.content += ' Consider promoting alternative payment methods to provide more options for customers.';
          } else if (salesStats.byPaymentMethod.length === 1) {
            paymentInsight.content += ' Consider adding more payment methods to accommodate different customer preferences.';
          }

          generatedInsights.push(paymentInsight);
        }
      }

      // Insight 3: Sales trend analysis
      if (sales.length >= 5) {
        // Group sales by date
        const salesByDate = {};
        sales.forEach(sale => {
          const date = new Date(sale.createdAt).toLocaleDateString();
          if (!salesByDate[date]) {
            salesByDate[date] = 0;
          }
          salesByDate[date] += sale.total;
        });

        // Convert to array and sort by date
        const dateEntries = Object.entries(salesByDate).sort((a, b) =>
          new Date(a[0]) - new Date(b[0])
        );

        if (dateEntries.length >= 3) {
          // Check if sales are trending up or down
          const recentDays = dateEntries.slice(-3);
          const firstDay = recentDays[0][1];
          const lastDay = recentDays[recentDays.length - 1][1];

          const trendPercentage = ((lastDay - firstDay) / firstDay * 100).toFixed(1);

          let trendInsight = {
            id: 3,
            type: trendPercentage >= 0 ? 'positive' : 'warning',
            icon: trendPercentage >= 0 ? <FaChartLine /> : <FaExclamationTriangle />,
            title: 'Recent Sales Trend',
            content: trendPercentage >= 0
              ? `Sales are trending upward with a ${trendPercentage}% increase over the last few days.`
              : `Sales are trending downward with a ${Math.abs(trendPercentage)}% decrease over the last few days.`
          };

          // Add recommendation based on trend
          if (trendPercentage < 0) {
            trendInsight.content += ' Consider running a promotion or marketing campaign to boost sales.';
          } else if (trendPercentage > 20) {
            trendInsight.content += ' Analyze what\'s driving this growth to replicate success in other areas.';
          }

          generatedInsights.push(trendInsight);
        }
      }

      // Insight 4: Discount analysis
      if (salesStats.overall.totalDiscountValue > 0) {
        const discountPercentage = (salesStats.overall.totalDiscountValue / salesStats.overall.totalSalesValue * 100).toFixed(1);

        let discountInsight = {
          id: 4,
          type: parseFloat(discountPercentage) > 15 ? 'warning' : 'info',
          icon: <FaLightbulb />,
          title: 'Discount Analysis',
          content: `Discounts account for ${discountPercentage}% of your total sales value.`
        };

        // Add recommendation based on discount percentage
        if (parseFloat(discountPercentage) > 15) {
          discountInsight.content += ' Your discount percentage is relatively high. Consider reviewing your pricing strategy or discount policies.';
        } else if (parseFloat(discountPercentage) < 5) {
          discountInsight.content += ' Your low discount rate suggests strong pricing power or premium positioning.';
        }

        generatedInsights.push(discountInsight);
      }

      setInsights(generatedInsights);
      setLoading(false);
    }, 1000); // Simulate API delay
  };

  if (loading) {
    return (
      <div className="ai-insights-container">
        <div className="ai-insights-header">
          <FaRobot className="ai-insights-icon" />
          <h3>AI Sales Insights</h3>
        </div>
        <div className="ai-insights-loading">
          <div className="ai-insights-spinner"></div>
          <p>Analyzing your sales data...</p>
        </div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="ai-insights-container">
        <div className="ai-insights-header">
          <FaRobot className="ai-insights-icon" />
          <h3>AI Sales Insights</h3>
        </div>
        <div className="ai-insights-empty">
          <p>Not enough data to generate insights. Try selecting a different date range with more sales data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-insights-container">
      <div className="ai-insights-header">
        <FaRobot className="ai-insights-icon" />
        <h3>AI Sales Insights</h3>
      </div>
      <div className="ai-insights-list">
        {insights.map(insight => (
          <div key={insight.id} className={`ai-insight-card ${insight.type}`}>
            <div className="ai-insight-icon">{insight.icon}</div>
            <div className="ai-insight-content">
              <h4>{insight.title}</h4>
              <p>{insight.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AISalesInsights;


// --- File End: AISalesInsights.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\components\Alerts.js ---
// ============================================================================

import React from "react";

const Alerts = ({ alerts }) => {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-md w-full">
      <h2 className="text-lg font-semibold mb-3">Alerts</h2>
      <ul>
        {alerts.length > 0 ? (
          alerts.map((alert, index) => (
            <li
              key={index}
              className="p-2 mb-2 border rounded-md bg-red-50 border-red-400 text-red-700"
            >
              {alert.message} <span className="text-sm text-gray-500">({alert.timeAgo})</span>
            </li>
          ))
        ) : (
          <p className="text-gray-500">No new alerts.</p>
        )}
      </ul>
    </div>
  );
};

export default Alerts;


// --- File End: Alerts.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\components\Layout.js ---
// ============================================================================

import React from 'react';
import Sidebar from './sidebar';
import TopBar from './TopBar';
import './Layout.css';

const Layout = ({ children, title }) => {
  return (
    <div className="layout-container">
      <Sidebar />
      <div className="layout-content">
        <TopBar title={title} />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;


// --- File End: Layout.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\components\OverviewCard.js ---
// ============================================================================

// src/components/OverviewCard.js
import React from "react";

const OverviewCard = ({ title, value, color }) => {
  const colors = {
    yellow: "bg-yellow-100",
    purple: "bg-purple-100",
    green: "bg-green-100",
    red: "bg-red-100",
  };
  return (
    <div className={`${colors[color]} p-4 rounded-lg shadow`}>
      <h3 className="text-gray-700 font-semibold">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

export default OverviewCard;


// --- File End: OverviewCard.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\components\PaymentsReceived.js ---
// ============================================================================

// src/components/PaymentsReceived.js
import React from "react";

const PaymentsReceived = ({ payments = [] }) => {
  return (
    <div>
      <h2>Payments Received</h2>
      {payments.length > 0 ? (
        payments.map((payment, index) => (
          <div key={index}>{payment.amount}</div>
        ))
      ) : (
        <p>No payments received</p>
      )}
    </div>
  );
};


export default PaymentsReceived;


// --- File End: PaymentsReceived.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\components\ProductLabel.js ---
// ============================================================================

import React, { useRef } from 'react';
import { FaPrint } from 'react-icons/fa';
import './ProductLabel.css';

const ProductLabel = ({ product, onClose }) => {
  const labelRef = useRef(null);

  const handlePrint = () => {
    const printContent = document.getElementById('product-label-content');
    const windowUrl = 'about:blank';
    const uniqueName = new Date().getTime();
    const windowName = `Print_${uniqueName}`;
    const printWindow = window.open(windowUrl, windowName, 'height=600,width=800');

    printWindow.document.write('<html><head><title>Product Label</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
      }
      .print-container {
        width: 204px;
        height: 183px;
        border: 1px solid #ccc;
        padding: 10px;
        box-sizing: border-box;
        margin: 20px auto;
        page-break-inside: avoid;
      }
      .product-name {
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 15px;
        margin-top: 10px;
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .product-price {
        font-size: 16px;
        font-weight: bold;
        text-align: center;
        margin: 5px 0;
      }
      .barcode-container {
        text-align: center;
        margin: 15px 0 10px;
      }
      .barcode-container img {
        max-width: 100%;
        height: 60px;
      }

      @media print {
        body {
          margin: 0;
          padding: 0;
        }
        .print-container {
          margin: 0;
          border: none;
        }
      }
    `);
    printWindow.document.write('</style></head><body>');

    // Create multiple copies if needed (for now just one)
    printWindow.document.write('<div class="print-container">');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.write('</div>');

    printWindow.document.write('</body></html>');
    printWindow.document.close();

    // Wait for the content to load before printing
    printWindow.onload = function() {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  return (
    <div className="product-label-overlay" onClick={onClose}>
      <div className="product-label-container" onClick={(e) => e.stopPropagation()}>
        <div className="product-label-header">
          <h3>Product Label</h3>
          <button className="product-label-close" onClick={onClose}>×</button>
        </div>

        <div className="product-label-content-wrapper">
          <div id="product-label-content" ref={labelRef} className="product-label-content">
            <div className="product-name">{product.name}</div>
            <div className="product-price">${product.price?.toFixed(2) || '0.00'}</div>
            <div className="barcode-container">
              <img
                src={`https://barcodeapi.org/api/code128/${product.barcode || '000000000000'}`}
                alt="Barcode"
              />
            </div>
          </div>
        </div>

        <div className="product-label-actions">
          <button className="product-label-print-btn" onClick={handlePrint}>
            <FaPrint /> Print Label
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductLabel;


// --- File End: ProductLabel.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\components\ProtectedRoute.js ---
// ============================================================================

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  // Render the protected component if authenticated
  return children;
};

export default ProtectedRoute; 

// --- File End: ProtectedRoute.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\components\SalesChart.js ---
// ============================================================================

// // src/components/SalesChart.js
// import React from "react";
// import { Bar } from "react-chartjs-2";

// const SalesChart = ({ data }) => {
//   const chartData = {
//     labels: data.map((d) => d.month),
//     datasets: [
//       {
//         label: "Sales",
//         data: data.map((d) => d.sales),
//         backgroundColor: "rgba(54, 162, 235, 0.6)",
//       },
//     ],
//   };

//   return <Bar data={chartData} />;
// };

// export default SalesChart;

import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const data = [
  { month: "Jan", sales: 40 },
  { month: "Feb", sales: 50 },
  { month: "Mar", sales: 60 },
  { month: "Apr", sales: 30 },
  { month: "May", sales: 90 },
  { month: "Jun", sales: 40 },
];

const SalesChart = () => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Sales Report</h3>
      <BarChart width={600} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="sales" fill="#8884d8" />
      </BarChart>
    </div>
  );
};

export default SalesChart;


// --- File End: SalesChart.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\components\SalesCharts.js ---
// ============================================================================

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

// Chart options
const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Sales by Date',
      font: {
        size: 16
      }
    },
  },
};

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
    },
    title: {
      display: true,
      text: 'Sales by Payment Method',
      font: {
        size: 16
      }
    },
  },
};

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Sales Trend',
      font: {
        size: 16
      }
    },
  },
};

// Helper function to group sales by date
const groupSalesByDate = (sales) => {
  const groupedSales = {};

  sales.forEach(sale => {
    const date = new Date(sale.createdAt).toLocaleDateString();
    if (!groupedSales[date]) {
      groupedSales[date] = 0;
    }
    groupedSales[date] += sale.total;
  });

  // Sort dates
  const sortedDates = Object.keys(groupedSales).sort((a, b) => new Date(a) - new Date(b));

  return {
    labels: sortedDates,
    data: sortedDates.map(date => groupedSales[date])
  };
};

// Helper function to prepare payment method data
const preparePaymentMethodData = (paymentMethodStats) => {
  const labels = paymentMethodStats.map(method =>
    method._id.charAt(0).toUpperCase() + method._id.slice(1)
  );

  const data = paymentMethodStats.map(method => method.totalValue);

  // Generate colors
  const backgroundColors = [
    'rgba(54, 162, 235, 0.6)',
    'rgba(255, 99, 132, 0.6)',
    'rgba(75, 192, 192, 0.6)',
    'rgba(255, 206, 86, 0.6)',
    'rgba(153, 102, 255, 0.6)',
    'rgba(255, 159, 64, 0.6)',
  ];

  return {
    labels,
    data,
    backgroundColors
  };
};

// Helper function to prepare sales trend data
const prepareSalesTrendData = (sales) => {
  // Group sales by date
  const salesByDate = groupSalesByDate(sales);

  // Calculate 7-day moving average
  const movingAverage = [];
  const windowSize = Math.min(7, salesByDate.data.length);

  for (let i = 0; i < salesByDate.data.length; i++) {
    let sum = 0;
    let count = 0;

    for (let j = Math.max(0, i - windowSize + 1); j <= i; j++) {
      sum += salesByDate.data[j];
      count++;
    }

    movingAverage.push(sum / count);
  }

  return {
    labels: salesByDate.labels,
    salesData: salesByDate.data,
    trendData: movingAverage
  };
};

export const SalesBarChart = ({ sales }) => {
  const salesByDate = sales && sales.length > 0 ? groupSalesByDate(sales) : { labels: [], data: [] };

  const data = {
    labels: salesByDate.labels,
    datasets: [
      {
        label: 'Sales Amount',
        data: salesByDate.data,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  return (
    <div className="chart-container">
      {sales && sales.length > 0 ? (
        <Bar options={barOptions} data={data} />
      ) : (
        <div className="no-data-message">No sales data available for chart</div>
      )}
    </div>
  );
};

export const PaymentMethodPieChart = ({ paymentMethodStats }) => {
  const hasData = paymentMethodStats && paymentMethodStats.length > 0;
  const { labels, data, backgroundColors } = hasData ?
    preparePaymentMethodData(paymentMethodStats) :
    { labels: [], data: [], backgroundColors: [] };

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Sales Amount',
        data,
        backgroundColor: backgroundColors,
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="chart-container">
      {hasData ? (
        <Pie options={pieOptions} data={chartData} />
      ) : (
        <div className="no-data-message">No payment method data available for chart</div>
      )}
    </div>
  );
};

export const SalesTrendLineChart = ({ sales }) => {
  const hasData = sales && sales.length > 0;
  const { labels, salesData, trendData } = hasData ?
    prepareSalesTrendData(sales) :
    { labels: [], salesData: [], trendData: [] };

  const data = {
    labels,
    datasets: [
      {
        label: 'Daily Sales',
        data: salesData,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        pointRadius: 3,
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
      },
      {
        label: 'Trend (7-day avg)',
        data: trendData,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderDash: [5, 5],
        pointRadius: 0,
      },
    ],
  };

  return (
    <div className="chart-container">
      {hasData ? (
        <Line options={lineOptions} data={data} />
      ) : (
        <div className="no-data-message">No sales data available for trend chart</div>
      )}
    </div>
  );
};


// --- File End: SalesCharts.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\components\StockAlerts.js ---
// ============================================================================

// // src/components/StockAlerts.js
// import React from "react";

// const StockAlerts = ({ products }) => {
//   return (
//     <div className="p-4 bg-white shadow rounded-lg">
//       <h3 className="text-lg font-semibold mb-3">Stock Alerts</h3>
//       <ul>
//         {products.map((product, index) => (
//           <li key={index} className="text-red-500">
//             ⚠️ {product.name} is running low
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default StockAlerts;

import React from "react";

const StockAlerts = ({ alerts = [] }) => {
  if (!alerts || !Array.isArray(alerts)) {
    return <p>No stock alerts available.</p>;
  }

  return (
    <div>
      {alerts.map((alert, index) => (
        <div key={index}>
          <p>{alert.message}</p>
          <small>{alert.timeAgo}</small>
        </div>
      ))}
    </div>
  );
};

export default StockAlerts;


// --- File End: StockAlerts.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\components\TopBar.js ---
// ============================================================================

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaUser } from 'react-icons/fa';
import { RiShoppingBag4Line } from 'react-icons/ri';
import './TopBar.css';

const TopBar = ({ title, showBackButton = false }) => {
  const location = useLocation();

  // Get user info from localStorage
  const userInfo = JSON.parse(localStorage.getItem('user')) || { username: 'User' };

  return (
    <div className="topbar-container">
      <div className="topbar-left">
        <span className="topbar-title">{title}</span>
      </div>

      <div className="topbar-center">
        {/* Center section is now empty */}
      </div>

      <div className="topbar-right">
        <Link to="/pos" className="topbar-pos-button">
          POS <RiShoppingBag4Line className="pos-icon" />
        </Link>

        <div className="topbar-language-selector">
          <select className="topbar-language-select">
            <option value="en">En</option>
            <option value="es">Es</option>
            <option value="fr">Fr</option>
          </select>
        </div>

        <div className="topbar-user-profile">
          <div className="topbar-user-avatar">
            {userInfo.username.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;


// --- File End: TopBar.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\components\TopSellingProducts.js ---
// ============================================================================

// // src/components/TopSellingProducts.js
// import React from "react";

// const TopSellingProducts = ({ products }) => {
//   return (
//     <div className="p-4 bg-white shadow rounded-lg">
//       <h3 className="text-lg font-semibold mb-3">Top Selling Products</h3>
//       <table className="w-full border-collapse">
//         <thead>
//           <tr className="bg-gray-200">
//             <th className="p-2">SKU</th>
//             <th className="p-2">Sales</th>
//             <th className="p-2">Revenue</th>
//           </tr>
//         </thead>
//         <tbody>
//           {products.map((product) => (
//             <tr key={product.sku} className="border-t">
//               <td className="p-2">{product.sku}</td>
//               <td className="p-2">{product.sales}</td>
//               <td className="p-2">${product.revenue}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default TopSellingProducts;

import React from "react";

const products = [
  { rank: 1, sku: "SKU001", sales: 500, revenue: "$50,000", lastSold: "29-Dec-2024" },
  { rank: 2, sku: "SKU002", sales: 400, revenue: "$40,000", lastSold: "28-Dec-2024" },
];

const TopSellingProducts = () => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Rank</th>
            <th className="text-left p-2">SKU</th>
            <th className="text-left p-2">Sales</th>
            <th className="text-left p-2">Revenue</th>
            <th className="text-left p-2">Last Sold</th>
          </tr>
        </thead>
        <tbody>
          {products.map((item, index) => (
            <tr key={index} className="border-b">
              <td className="p-2">{item.rank}</td>
              <td className="p-2">{item.sku}</td>
              <td className="p-2">{item.sales}</td>
              <td className="p-2">{item.revenue}</td>
              <td className="p-2">{item.lastSold}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopSellingProducts;



// --- File End: TopSellingProducts.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\components\pos\BillTab.js ---
// ============================================================================

import { Tabs, Tab } from 'react-bootstrap';

function BillTab({ billNumber }) {
  return (
    <Tabs defaultActiveKey={`#${billNumber}`} id="bill-tab">
      <Tab eventKey={`#${billNumber}`} title={`#${billNumber}`}>
      </Tab>
    </Tabs>
  );
}

export default BillTab;


// --- File End: BillTab.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\components\pos\CartTable.js ---
// ============================================================================

import React from 'react';
import { Table } from 'react-bootstrap';
import { FiTrash2 } from 'react-icons/fi';
import QuantityButton from './quantitybutton.js';

const CartTable = ({ cartItems, handleQuantityChange, handleRemoveItem }) => {
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th width="300">Product</th>
          <th width="120">Price</th>
          <th width="120">Discount</th>
          <th width="120">Price After Discount</th>
          <th width="100">Qty</th>
          <th width="120">Subtotal</th>
          <th width="60">Action</th>
        </tr>
      </thead>
      <tbody>
        {cartItems.map(item => {
          const discountedPrice = item.price * (1 - item.discount / 100);
          
          return (
            <tr key={item.id}>
              <td>
                <div className="product-container">
                  <div className="product-image">{item.image}</div>
                  <div className="product-info">
                    <div className="product-name">{item.name}</div>
                    <small className="product-id">ID: {item.id}</small>
                  </div>
                </div>
              </td>
              <td>${item.price.toFixed(2)}</td>
              <td>{item.discount > 0 ? `${item.discount}%` : '-'}</td>
              <td>${discountedPrice.toFixed(2)}</td>
              <td>
                <div className="quantity-container">
                  <QuantityButton
                    key={item.id}
                    item={item}
                    handleQuantityChange={handleQuantityChange}
                  />
                </div>
              </td>
              <td>${item.subtotal.toFixed(2)}</td>
              <td>
                <FiTrash2
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleRemoveItem(item.id)}
                />
              </td>
            </tr>
          );
        })}
        {cartItems.length === 0 && (
          <tr>
            <td colSpan="7" className="empty-cart">No products added yet</td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

export default CartTable;

// --- File End: CartTable.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\components\pos\CreateBillButton.js ---
// ============================================================================

import React from 'react';
import { Button } from 'react-bootstrap';

const CreateBillButton = () => {
  return (
    <Button
      style={{ backgroundColor: '#357EC7', borderColor: '#357EC7', fontSize: '14px' }}
    >
      Create New Bill
    </Button>
  );
};

export default CreateBillButton;


// --- File End: CreateBillButton.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\components\pos\PayButton.js ---
// ============================================================================

import { useState } from 'react';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { generateReceipt } from './generateReceipt';
import { salesAPI } from '../../services/api'; // Use the salesAPI for creating a sale

// the content of the Modal is mostly bootstrap because i plan on changing it in the future.

const PayButton = ({ cartItems, totalPayable, totalQuantity, billNumber, updateBillNumber }) => {
  const [show, setShow] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // default is always cash

  // global sales tax
  const GST = 0.10;
  const endPayment = Number((totalPayable + GST * totalPayable).toFixed(2));

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handlePrintReceipt = async () => {
    try {
      // Prepare the sale data
      const saleData = {
        billNumber: billNumber, 
        customerName: 'Walk in Customer',
        customerPhone: 'N/A',
        items: cartItems.map((item) => {
          const discountRate = item.discount || 0; // Default discount is 0 if not provided
          const effectivePrice = item.price * (1 - discountRate / 100); // Calculate effective price

          return {
            product: item.id, // Use the product ID
            quantity: item.quantity,
            price: item.price, // Include the price of the item
            effectivePrice: Number(effectivePrice.toFixed(2)), // Include the effective price
            subtotal: item.subtotal, // Include the subtotal of the item
          };
        }),
        subtotal: totalPayable,
        discount: 0,
        tax: Number((GST * totalPayable).toFixed(2)),
        total: endPayment,
        paymentMethod,
        amountPaid: endPayment,
        change: 0,
        notes: 'Thank you for your purchase!',
      };

      // Create the sale via the API
      const response = await salesAPI.create(saleData);
      console.log('Sale created successfully:', response.data);

      // Update the billNumber for the next transaction
      updateBillNumber(billNumber + 1); // Increment the billNumber

      // Generate the receipt
      generateReceipt({
        ...saleData,
        items: cartItems.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          amount: item.subtotal,
        })),
        date: new Date(),
      });

      handleClose();
    } catch (error) {
      console.error('Error during checkout:', error.response?.data?.message || error.message);
    }
  };

  return (
    <>
      <Button variant="success" onClick={handleShow}>
        Pay now
      </Button>

      <Modal show={show} onHide={() => { setPaymentMethod('cash'); handleClose(); }} centered>
        <Modal.Header closeButton>
          <Modal.Title>Complete Transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-4">
            <h5>Choose Payment Method</h5>
            <Form>
              <Form.Group>
                <Form.Check
                  type="radio"
                  name="paymentMethod"
                  id="cashPayment"
                  label="Cash Payment"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <Form.Check
                  type="radio"
                  name="paymentMethod"
                  id="cardDebit"
                  label="Card/Debit"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
              </Form.Group>
            </Form>
          </div>

          {paymentMethod === 'card' && (
            <div className="mb-4">
              <h5>Invoice Number</h5>
              <Form.Control type="text" placeholder="Enter Invoice Number" />
            </div>
          )}

          <div className="order-details mb-4">
            <h5>Order Details</h5>
            <Row className="mb-2">
              <Col>Total Products</Col>
              <Col className="text-end">{totalQuantity}</Col>
            </Row>
            <Row className="mb-2">
              <Col>GST</Col>
              <Col className="text-end">10%</Col>
            </Row>
            <Row className="mb-2">
              <Col>Discount</Col>
              <Col className="text-end">0</Col>
            </Row>
            <Row className="mb-2 fw-bold">
              <Col>Total Payable</Col>
              <Col className="text-end">${totalPayable}</Col>
            </Row>
          </div>

          <div className="bg-light p-3 rounded d-flex justify-content-between align-items-center">
            <h5 className="m-0 text-success">Total Payable: ${endPayment}</h5>
            <Button variant="success" onClick={handlePrintReceipt}>
              Print Receipt
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default PayButton;


// --- File End: PayButton.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\components\pos\SalesTable.js ---
// ============================================================================

import { Card, Table } from 'react-bootstrap';

function SalesTable() {
  return (

    <Table bordered hover>
      <thead>
        <tr>
          <th>Bill No</th>
          <th>Status</th>
          <th>Total Bill</th>
        </tr>
      </thead>
      <tbody>
        {/* TODO: Add values */}
      </tbody>
    </Table>
  );
}

export default SalesTable;


// --- File End: SalesTable.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\components\pos\generateReceipt.js ---
// ============================================================================

// the reciept genertaion function

// receiptGenerator.js
/**
 * Generates a receipt text and triggers download as a .txt file
 * @param {Object} transactionData - Data for the receipt
 */
export const generateReceipt = (transactionData) => {
  // Destructure transaction data with defaults
  const {
    billNumber = 0,
    tokenType = 'Credit',
    customerName = 'Walk in Customer',
    warehouse = 'WH Multan',
    items = [],
    subtotal = 0,
    discount = 0,
    tax = 0, // Replaced gst with tax
    total = 0,
    paymentMethod = 'Cash Payment',
    received = 0,
    returned = 0,
    date = new Date()
  } = transactionData;

  // Format date
  const formattedDate = date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  // Create the receipt header
  let receiptText = `
                        POS
    ${formattedDate}
    
    ------- Receipt# -------
           ${billNumber}
    -------------------------
    
    Customer Name             ${customerName}
    Warehouse                 ${warehouse}
    
    Item                Price  Qty  Amount
    ----------------------------------------
  `;

  // Add items
  items.forEach(item => {
    // Pad strings to create alignment
    const itemName = item.name.padEnd(20, ' ').substring(0, 20);
    const price = item.price.toString().padStart(5, ' ');
    const qty = item.quantity.toString().padStart(3, ' ');
    const amount = item.amount.toString().padStart(7, ' ');

    receiptText += `  ${itemName} ${price}  ${qty}  ${amount}\n`;
  });

  // Add summary
  receiptText += `
    ----------------------------------------
    Subtotal                         ${subtotal.toString().padStart(7, ' ')}
    Discount                         ${discount.toString().padStart(7, ' ')}
    Tax                              ${tax.toString().padStart(7, ' ')}  
    
    Total                            ${total.toString().padStart(7, ' ')}
    
    ${paymentMethod}
    
    Received                         ${received.toString().padStart(7, ' ')}
    Total Payable                    ${total.toString().padStart(7, ' ')}
    Returned                         ${returned.toString().padStart(7, ' ')}
    
    Thanks for fueling our passion. Drop by again, if
    your wallet isn't still hurting. You're always
    welcome here!
    
                        POS
  `;

  // Create a Blob with the text content
  const blob = new Blob([receiptText], { type: 'text/plain' });

  // Create a temporary download link, for browser security reasons, i can only directly download to downloads section.
  // TODO: explore some libraries that you let you overlook this, or store a path in browser.
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Receipt_${billNumber}_${date.getTime()}.txt`;

  // Trigger download
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// --- File End: generateReceipt.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\components\pos\quantitybutton.js ---
// ============================================================================

import React from 'react';
import { Button, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { IoChevronDown, IoChevronUp } from "react-icons/io5";

const QuantityButton = ({ item, handleQuantityChange }) => {

  // Check if item exists before proceeding
  if (!item) {
    return null; 
  }

  const increment = () => {
    if (handleQuantityChange) {
      handleQuantityChange(item.id, item.quantity + 1);
    }
  };
  
  const decrement = () => {
    if (item.quantity > 1 && handleQuantityChange) {
      handleQuantityChange(item.id, item.quantity - 1);
    }
  };
  

  // Format the count to always have 2 digits
  const formattedCount = item.quantity.toString().padStart(2, '0');
  
  return (
    <div style={{ display: 'inline-block' }}>
      <div 
        style={{ 
          display: 'flex',
          alignItems: 'center',
          //TODO: border should be EAECF0
          border: '1px solid #000000', 
          borderRadius: '4px',
          overflow: 'hidden',
          width: '85px'
        }}
      >
        <span 
          style={{ 
            padding: '5px 5px',
            fontSize: '14px',
            flexGrow: 1,
            textAlign: 'center'
          }}
        >
          {formattedCount}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', borderLeft: '1px solid #EAECF0' }}>
          <button 
            onClick={increment}
            style={{ 
              border: 'none',
              background: 'none',
              padding: '2px 4px',
              cursor: 'pointer',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <IoChevronUp size={16} />
          </button>
          <div style={{ borderTop: '1px solid #EAECF0', width: '100%' }}></div>
          <button 
            onClick={decrement}
            style={{ 
              border: 'none',
              background: 'none',
              padding: '2px 4px',
              cursor: 'pointer',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <IoChevronDown size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuantityButton;

// --- File End: quantitybutton.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\components\sidebar.js ---
// ============================================================================

import React, { useState, useEffect } from 'react'; // Kept useEffect from File 1
import { Nav } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImage from '../images/logo-small.png';
import { RiShoppingBag4Line } from "react-icons/ri";
import { LuPackage, LuPackagePlus, LuPackageSearch } from "react-icons/lu";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { FiUsers, FiUserPlus } from "react-icons/fi"; // Kept FiUserPlus from File 1
import { BsCartCheck } from "react-icons/bs";
import { TbReportMoney } from "react-icons/tb";
import { jwtDecode } from 'jwt-decode'; // Kept jwtDecode from File 1

// sidebar layout: (Identical in both)
const SideBar = ({ children }) => {
    return (
        <Nav className="flex-column" style={{
            width: '270px',
            height: '100vh',
            backgroundColor: '#ffffff',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.05)',
            borderRight: '1px solid #e6e6ff',
            overflow: 'auto'
        }}>
            {children}
        </Nav>
    );
};

// dropdown component that allows collapsing (Using File 1's version with useEffect for better UX)
// takes in title and children
const SideBarDropdown = ({ title, children, isActive }) => {
    const [isOpen, setIsOpen] = useState(isActive); // Initialize based on isActive

    // Update isOpen state if isActive prop changes
    useEffect(() => {
        setIsOpen(isActive);
    }, [isActive]);

    return (
        <div className="text">
            <Nav.Item
                onClick={() => setIsOpen(!isOpen)}
                className="sidebar-dropdown-title"
                style={{
                    cursor: 'pointer',
                    padding: '12px 16px',
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: isActive ? '#357EC7' : '#505050',
                    backgroundColor: isActive ? '#f0f7ff' : 'transparent',
                    margin: '2px 8px',
                    borderRadius: '4px'
                }}
            >
                {title}
                <span style={{ fontSize: '10px' }}>{isOpen ? '▲' : '▼'}</span>
            </Nav.Item>

            {isOpen && (
                <div className="sidebar-dropdown-content" style={{
                    paddingLeft: '12px'
                }}>
                    {children}
                </div>
            )}
        </div>
    );
};


// properties for each item in sidebar (Identical in both)
const SideBarItem = ({ title, onClick, isActive }) => {
    return (
        <Nav.Item
            onClick={onClick}
            className="sidebar-item"
            style={{
                cursor: 'pointer',
                padding: '10px 12px',
                textAlign: 'left',
                fontSize: '14px',
                color: isActive ? '#357EC7' : '#505050',
                backgroundColor: isActive ? '#f0f7ff' : 'transparent',
                borderRadius: '4px',
                margin: '2px 8px'
            }}
        >
            {title}
        </Nav.Item>
    );
};

// attach Dropdown and item to sidebar component (Identical in both)
SideBar.Dropdown = SideBarDropdown;
SideBar.Item = SideBarItem;

// main default sidebar function (Merging logic from both, prioritizing File 1's role structure)
function ToolsSidebar() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // --- From File 1: Role-based logic ---
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUserRole(decodedToken.role);
            } catch (error) {
                console.error("Failed to decode token:", error);
                logout(); // Log out if token is invalid
                navigate('/login');
            }
        } else {
             logout(); // Ensure logout state if no token
             // No navigation needed here, ProtectedRoute handles it
        }
    }, [location, logout, navigate]); // Re-check on location change

    // Role Check Helpers (From File 1)
    const isCashierOrHigher = userRole === 'cashier' || userRole === 'manager' || userRole === 'admin';
    const isManagerOrHigher = userRole === 'manager' || userRole === 'admin';
    const isAdmin = userRole === 'admin';
    // --- End File 1 Logic ---

    const isPathActive = (path) => location.pathname === path;
    // Updated isGroupActive to include paths from both versions as needed
    const isGroupActive = (paths) => paths.some(path => location.pathname.includes(path));

    const handleItemClick = (item) => {
        console.log(`Clicked: ${item}`);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <SideBar>
            {/* Logo Section (Identical) */}
            <div className="sidebar-logo-container" style={{
                display: 'flex',
                alignItems: 'center',
                padding: '20px 20px',
                borderBottom: '1px solid #e6e6ff'
            }}>
                <img
                    src={logoImage}
                    alt="Logo"
                    className="sidebar-logo"
                    style={{
                        width: '32px',
                        height: '32px',
                        marginRight: '10px'
                    }}
                />
                <span className="sidebar-title" style={{
                    fontWeight: '600',
                    fontSize: '22px',
                    color: '#333'
                }}>FinTrack</span>
            </div>

            <div style={{ padding: '10px 0' }}>
                {/* Dashboard (Cashier+) - From File 1 */}
                {isCashierOrHigher && (
                    <Nav.Item className="sidebar-nav-item" style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: isPathActive('/dashboard') ? '#357EC7' : '#505050',
                        backgroundColor: isPathActive('/dashboard') ? '#f0f7ff' : 'transparent',
                        margin: '2px 8px',
                        borderRadius: '4px'
                    }}>
                        <Link to="/dashboard" className="sidebar-link" style={{
                            textDecoration: 'none',
                            color: 'inherit',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <RiShoppingBag4Line size={16} /> Dashboard
                        </Link>
                    </Nav.Item>
                )}

                {/* Products Dropdown (Cashier+) - Merged */}
                 {isCashierOrHigher && (
                    <SideBarDropdown
                        // Updated paths for isActive check based on merged content
                        isActive={isGroupActive(['/all_products', '/create_products', '/inventory', '/categories', '/brands'])}
                        title={
                            <div className="sidebar-link" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <LuPackage size={16}/> Products
                            </div>
                        }>
                        {/* All Products (Cashier+) - From File 1 */}
                        <Link to="/all_products" className="sidebar-link" style={{
                            textDecoration: 'none',
                            color: 'inherit'
                        }}>
                            <SideBarItem
                                isActive={isPathActive('/all_products')}
                                title={
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}>
                                        <LuPackage size={16} /> All Products
                                    </div>
                                }
                                onClick={() => handleItemClick("All Products")}
                            />
                        </Link>
                        {/* Create Product (Manager+) - From File 1 */}
                        {isManagerOrHigher && (
                            <Link to="/create_products" className="sidebar-link" style={{
                                textDecoration: 'none',
                                color: 'inherit'
                            }}>
                                <SideBarItem
                                    isActive={isPathActive('/create_products')}
                                    title={
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px'
                                        }}>
                                            <LuPackagePlus size={16} /> Create Product
                                        </div>
                                    }
                                    onClick={() => handleItemClick("Create Product")}
                                />
                            </Link>
                        )}
                         {/* Inventory (Cashier+) - From File 1 */}
                        <Link to="/inventory" className="sidebar-link" style={{
                            textDecoration: 'none',
                            color: 'inherit'
                        }}>
                            <SideBarItem
                                isActive={isPathActive('/inventory')}
                                title={
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}>
                                        <LuPackageSearch size={16} /> Inventory
                                    </div>
                                }
                                onClick={() => handleItemClick("Inventory")}
                            />
                        </Link>
                        {/* Categories (Manager+) - From File 1 */}
                        {isManagerOrHigher && (
                            <Link to="/categories" className="sidebar-link" style={{
                                textDecoration: 'none',
                                color: 'inherit'
                            }}>
                                <SideBarItem
                                    isActive={isPathActive('/categories')}
                                    title={
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px'
                                        }}>
                                            <LuPackageSearch size={16} /> Categories
                                        </div>
                                    }
                                    onClick={() => handleItemClick("Categories")}
                                />
                            </Link>
                        )}
                        {/* Brands (Manager+) - Added from File 2, assumed Manager+ role */}
                         {isManagerOrHigher && (
                            <Link to="/brands" className="sidebar-link" style={{
                                textDecoration: 'none',
                                color: 'inherit'
                            }}>
                                <SideBarItem
                                    isActive={isPathActive('/brands')}
                                    title={
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px'
                                        }}>
                                            {/* Using same icon as Categories, change if needed */}
                                            <LuPackageSearch size={16} /> Brands
                                        </div>
                                    }
                                    onClick={() => handleItemClick("Brands")}
                                />
                            </Link>
                         )}
                    </SideBarDropdown>
                 )}

                {}
                {isAdmin && (
                    <SideBarDropdown
                        isActive={isGroupActive(['/employee-management', '/create-user'])}
                        title={
                            <div className="sidebar-link" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <FiUsers size={16} /> Employee Management
                            </div>
                        }>
                        <Link to="/employee-management" className="sidebar-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <SideBarItem
                                isActive={isPathActive('/employee-management')}
                                title={<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><FiUsers size={16} /> Manage Employees</div>}
                                onClick={() => handleItemClick("Manage Employees")}
                            />
                        </Link>
                        <Link to="/create-user" className="sidebar-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <SideBarItem
                                isActive={isPathActive('/create-user')}
                                title={<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><FiUserPlus size={16} /> Create Employee</div>}
                                onClick={() => handleItemClick("Create Employee")}
                            />
                        </Link>
                    </SideBarDropdown>
                )}

                {/* Purchases Dropdown (Manager+) - Merged (using File 2's items and File 1's role check) */}
                {isManagerOrHigher && (
                    <SideBarDropdown
                        // Updated paths for isActive check based on merged content
                        isActive={isGroupActive([
                            '/supplier',
                            '/all_purchases',
                            '/create_purchases',
                            '/import_purchases'
                            // Removed '/purchases' unless it's a specific overview page not listed
                        ])}
                        title={
                            <div className="sidebar-link" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <BsCartCheck size={16}/> Purchases
                            </div>
                        }>
                         {/* Suppliers (Manager+) */}
                        <Link to="/supplier" className="sidebar-link" style={{
                            textDecoration: 'none',
                            color: 'inherit'
                        }}>
                            <SideBarItem
                                isActive={isPathActive('/supplier')}
                                title={
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}>
                                        <BsCartCheck size={16} /> Suppliers
                                    </div>
                                }
                                onClick={() => handleItemClick("Suppliers")}
                            />
                        </Link>
                        {/* All Purchases (Manager+) - From File 2 */}
                         <Link to="/all_purchases" className="sidebar-link" style={{
                             textDecoration: 'none',
                             color: 'inherit'
                         }}>
                             <SideBarItem
                                 isActive={isPathActive('/all_purchases')}
                                 title={
                                     <div style={{
                                         display: 'flex',
                                         alignItems: 'center',
                                         gap: '12px'
                                     }}>
                                         <BsCartCheck size={16} /> All Purchases
                                     </div>
                                 }
                                 onClick={() => handleItemClick("All Purchases")}
                             />
                         </Link>
                        {/* Create Purchase (Manager+) - From File 2 */}
                         <Link to="/create_purchases" className="sidebar-link" style={{
                             textDecoration: 'none',
                             color: 'inherit'
                         }}>
                             <SideBarItem
                                 isActive={isPathActive('/create_purchases')}
                                 title={
                                     <div style={{
                                         display: 'flex',
                                         alignItems: 'center',
                                         gap: '12px'
                                     }}>
                                         <BsCartCheck size={16} /> Create Purchase
                                     </div>
                                 }
                                 onClick={() => handleItemClick("Create Purchase")}
                             />
                         </Link>
                        {/* Import Purchases (Manager+) - From File 2 */}
                         <Link to="/import_purchases" className="sidebar-link" style={{
                             textDecoration: 'none',
                             color: 'inherit'
                         }}>
                             <SideBarItem
                                 isActive={isPathActive('/import_purchases')}
                                 title={
                                     <div style={{
                                         display: 'flex',
                                         alignItems: 'center',
                                         gap: '12px'
                                     }}>
                                         <BsCartCheck size={16} /> Import Purchases
                                     </div>
                                 }
                                 onClick={() => handleItemClick("Import Purchases")}
                             />
                         </Link>
                    </SideBarDropdown>
                )}

                {/* Sales Link (Manager+) - From File 1 */}
                {isManagerOrHigher && (
                    <Nav.Item className="sidebar-nav-item" style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: isPathActive('/sales') ? '#357EC7' : '#505050',
                        backgroundColor: isPathActive('/sales') ? '#f0f7ff' : 'transparent',
                        margin: '2px 8px',
                        borderRadius: '4px'
                    }}>
                        <Link to="/sales" className="sidebar-link" style={{
                            textDecoration: 'none',
                            color: 'inherit',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <TbReportMoney size={16} /> Sales
                        </Link>
                    </Nav.Item>
                )}

                {/* Reports Dropdown (Manager+) - Merged (using File 2's structure and File 1's role check) */}
                {isManagerOrHigher && (
                     <SideBarDropdown
                        isActive={isGroupActive(['/reports', '/sales-report'])}
                        title={
                            <div className="sidebar-link" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <HiOutlineDocumentReport size={16}/> Reports
                            </div>
                        }>
                        {/* General Reports (Manager+) - From File 2 */}
                        <Link to="/reports" className="sidebar-link" style={{
                            textDecoration: 'none',
                            color: 'inherit'
                        }}>
                            <SideBarItem
                                isActive={isPathActive('/reports')}
                                title={
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}>
                                        <HiOutlineDocumentReport size={16} /> General Reports
                                    </div>
                                }
                                onClick={() => handleItemClick("General Reports")}
                            />
                        </Link>
                        {/* Sales Report (Manager+) - From File 2 */}
                        <Link to="/sales-report" className="sidebar-link" style={{
                            textDecoration: 'none',
                            color: 'inherit'
                        }}>
                            <SideBarItem
                                isActive={isPathActive('/sales-report')}
                                title={
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}>
                                        <TbReportMoney size={16} /> Sales Report
                                    </div>
                                }
                                onClick={() => handleItemClick("Sales Report")}
                            />
                        </Link>
                    </SideBarDropdown>
                )}

                {/* POS Link (Cashier+) - From File 1 */}
                 {isCashierOrHigher && (
                    <Nav.Item className="sidebar-nav-item" style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: isPathActive('/pos') ? '#357EC7' : '#505050',
                        backgroundColor: isPathActive('/pos') ? '#f0f7ff' : 'transparent',
                        margin: '2px 8px',
                        borderRadius: '4px'
                    }}>
                        <Link to="/pos" className="sidebar-link" style={{
                            textDecoration: 'none',
                            color: 'inherit',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            {/* Consider adding a POS icon if you have one */}
                            POS
                        </Link>
                    </Nav.Item>
                 )}

                {/* Logout Link (Always visible) - Identical */}
                <Nav.Item
                    onClick={handleLogout}
                    className="sidebar-nav-item sidebar-logout"
                    style={{
                        cursor: 'pointer',
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#ff5252',
                        margin: '2px 8px',
                        borderRadius: '4px',
                        marginTop: '20px'
                    }}
                >
                    Logout
                </Nav.Item>
            </div>
        </SideBar>
    );
}

export default ToolsSidebar;

// --- File End: sidebar.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\components\ui\CustomCard.js ---
// ============================================================================

import React from 'react';

const CustomCard = ({ children }) => {
    const styles = {
        card: {
            border: '1px solid #ddd',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            backgroundColor: '#fff',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            maxWidth: '300px',
            margin: '10px',
        },
        header: {
            backgroundColor: '#f8f9fa',
            padding: '12px 16px',
            borderBottom: '1px solid #ddd',
            fontWeight: 'bold',
            fontSize: '1.1rem',
        },
        body: {
            padding: '16px',
        },
        footer: {
            padding: '12px 16px',
            backgroundColor: '#f8f9fa',
            borderTop: '1px solid #ddd',
            textAlign: 'center',
            fontSize: '0.85rem',
            color: '#555',
        },
    };

    return <div style={styles.card}>{children}</div>;
};

const Header = ({ children }) => {
    const styles = {
        header: {
            backgroundColor: '#f8f9fa',
            padding: '12px 16px',
            borderBottom: '1px solid #ddd',
            fontWeight: 'bold',
            fontSize: '1.1rem',
        },
    };
    return <div style={styles.header}>{children}</div>;
};

const Body = ({ children }) => {
    const styles = {
        body: {
            padding: '16px',
        },
    };
    return <div style={styles.body}>{children}</div>;
};

const Footer = ({ children }) => {
    const styles = {
        footer: {
            padding: '12px 16px',
            backgroundColor: '#f8f9fa',
            borderTop: '1px solid #ddd',
            textAlign: 'center',
            fontSize: '0.85rem',
            color: '#555',
        },
    };
    return <div style={styles.footer}>{children}</div>;
};

// Attach subcomponents to CustomCard
CustomCard.Header = Header;
CustomCard.Body = Body;
CustomCard.Footer = Footer;

export default CustomCard;

// --- File End: CustomCard.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\context\AuthContext.js ---
// ============================================================================

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        setUser({ token });
      } catch (err) {
        console.error('Invalid token:', err);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('/api/login', { username, password });

      if (response.data.success) {
        const { token } = response.data;
        localStorage.setItem('token', token);
        setUser({ token });
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem('token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;

// --- File End: AuthContext.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\hooks\useCart.js ---
// ============================================================================

import { useState, useEffect } from 'react';

const useCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPayable, setTotalPayable] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);

  // Add a product to the cart
  const addToCart = (product) => {
    const existingProductIndex = cartItems.findIndex(item => item.id === product.id);

    if (existingProductIndex !== -1) {
      // If product exists, update its quantity and subtotal
      const updatedCartItems = [...cartItems];
      updatedCartItems[existingProductIndex].quantity += 1;
      updatedCartItems[existingProductIndex].subtotal =
        updatedCartItems[existingProductIndex].quantity *
        (updatedCartItems[existingProductIndex].price * (1 - updatedCartItems[existingProductIndex].discount / 100));

      setCartItems(updatedCartItems);
    } else {
      // If product is new, add it to the cart
      const newProduct = {
        ...product,
        quantity: 1,
        subtotal: product.price * (1 - product.discount / 100),
      };
      setCartItems([...cartItems, newProduct]);
    }
  };

  // Remove an item from the cart
  const removeFromCart = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  // Update the quantity of an item in the cart
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;

    const updatedCartItems = cartItems.map(item => {
      if (item.id === id) {
        const discountedPrice = item.price * (1 - item.discount / 100);
        return {
          ...item,
          quantity: newQuantity,
          subtotal: newQuantity * discountedPrice,
        };
      }
      return item;
    });

    setCartItems(updatedCartItems);
  };

  // Calculate total payable and total quantity
  useEffect(() => {
    const total = cartItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    const quantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    setTotalPayable(Number(total.toFixed(2)));
    setTotalQuantity(quantity);
  }, [cartItems]);

  const resetCart = () => {
    setCartItems([]);
  };

  return {
    cartItems,
    totalPayable,
    totalQuantity,
    addToCart,
    removeFromCart,
    updateQuantity,
    resetCart,
  };
};

export default useCart;

// --- File End: useCart.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\index.js ---
// ============================================================================

// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import './index.css';
// import App from './App';
// import reportWebVitals from './reportWebVitals';

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

// // If you want to start measuring performance in your app, pass a function
// // to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();

// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import './styles/tailwind.css';
import "./index.css";
import App from "./App"; // Root component
import reportWebVitals from "./reportWebVitals";

// Ensure Tailwind is imported if you're using it
import "./styles/tailwind.css"; 

import 'bootstrap/dist/css/bootstrap.min.css';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App /> {/* Ensuring the App component correctly renders the dashboard */}
  </React.StrictMode>
);

// Optional: Performance logging
reportWebVitals();


// --- File End: index.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\pages\EmployeeManagement.js ---
// ============================================================================



import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/sidebar';
import { FiSearch, FiPlus, FiEdit, FiTrash, FiFilter, FiX } from 'react-icons/fi'; 
import { usersAPI } from '../services/api';
import './all_users.css'; 


const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay">
            <div className="modal-container" style={{maxWidth: '500px', padding: '20px'}}>
                 <div className="modal-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                    <h3>{title}</h3>
                    <button className="close-button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem' }}>
                        <FiX />
                    </button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
};


const EmployeeManagement = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // State for Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null); 

    // State for Forms
    const [formData, setFormData] = useState({
        name: '', username: '', password: '', role: 'cashier', phone: '', active: true
    });
    const [editFormData, setEditFormData] = useState({
        name: '', username: '', password: '', role: '', phone: '', active: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await usersAPI.getAll();
           
            setUsers(response.data.data.filter(user => user.role !== 'admin'));
        } catch (err) {
            console.error('Error fetching employees:', err);
            setError(err.response?.data?.message || 'Failed to fetch employees.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

     const showSuccess = (message) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    // --- Modal Handling ---
    const openCreateModal = () => {
        setFormData({ name: '', username: '', password: '', role: 'cashier', phone: '', active: true });
        setError(null);
        setIsCreateModalOpen(true);
    };
    const closeCreateModal = () => setIsCreateModalOpen(false);

    const openEditModal = (user) => {
        setCurrentUser(user);
        setEditFormData({
            name: user.name || '',
            username: user.username, // Usually username cannot be edited
            password: '', // Clear password field for reset option
            role: user.role,
            phone: user.phone || '',
            active: user.active
        });
        setError(null); // Clear previous errors
        setIsEditModalOpen(true);
    };
    const closeEditModal = () => setIsEditModalOpen(false);

    const openDeleteModal = (user) => {
        setCurrentUser(user);
        setIsDeleteModalOpen(true);
    };
    const closeDeleteModal = () => setIsDeleteModalOpen(false);


    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleEditFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        if (formData.password.length < 6) {
             setError("Password must be at least 6 characters long.");
             return;
        }
        setError(null); // Clear previous errors
        setLoading(true);
        try {
            await usersAPI.create({ ...formData });
            showSuccess(`Employee ${formData.username} created successfully.`);
            closeCreateModal();
            fetchEmployees(); // Refresh list
        } catch (err) {
            console.error("Create user error:", err);
            setError(err.response?.data?.message || "Failed to create employee.");
        } finally {
             setLoading(false);
        }
    };

    const handleEditSubmit = async (e) => {
         e.preventDefault();
         if (!currentUser) return;

         const updateData = {
             name: editFormData.name,
             role: editFormData.role,
             phone: editFormData.phone,
             active: editFormData.active
         };
         // Only include password if user entered something
         if (editFormData.password) {
             if (editFormData.password.length < 6) {
                 setError("New password must be at least 6 characters long.");
                 return;
             }
             updateData.password = editFormData.password;
         }
         setError(null); // Clear previous errors
         setLoading(true);

        try {
            await usersAPI.update(currentUser._id, updateData);
            showSuccess(`Employee ${currentUser.username} updated successfully.`);
            closeEditModal();
            fetchEmployees(); // Refresh list
        } catch (err) {
             console.error("Update user error:", err);
             setError(err.response?.data?.message || "Failed to update employee.");
        } finally {
             setLoading(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            await usersAPI.delete(currentUser._id);
            showSuccess(`Employee ${currentUser.username} deleted successfully.`);
            closeDeleteModal();
            fetchEmployees(); // Refresh list
        } catch (err) {
             console.error("Delete user error:", err);
             setError(err.response?.data?.message || "Failed to delete employee.");
             closeDeleteModal(); // Close modal even on error
        } finally {
             setLoading(false);
        }
    };

    // --- Filtering ---
    const filteredUsers = users.filter(user =>
        (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="users-page">
            <Sidebar />
            <div className="content-container">
                <div className="header-section">
                    <h1>Employee Management</h1>
                    <div className="search-filter-container">
                        <div className="search-container">
                            <FiSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search employees..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="search-input"
                            />
                        </div>
                        <div className="action-buttons">
                           
                            <button className="add-user-button" onClick={openCreateModal}>
                                <FiPlus /> Add New Employee
                            </button>
                        </div>
                    </div>
                </div>

                 {successMessage && (
                    <div className="success-container">
                        <div className="success-message">{successMessage}</div>
                    </div>
                )}
                {error && !isCreateModalOpen && !isEditModalOpen && ( // Show general error only if modals are closed
                    <div className="error-container">
                        <div className="error-message">{error}</div>
                    </div>
                )}


                {loading && !isCreateModalOpen && !isEditModalOpen ? (
                     <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <div>Loading employees...</div>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Username</th>
                                    <th>Phone</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map(user => (
                                        <tr key={user._id}>
                                            <td>{user.name || '-'}</td>
                                            <td>{user.username}</td>
                                            <td>{user.phone || '-'}</td>
                                            <td>{user.role}</td>
                                            <td>
                                                <span className={`status-badge ${user.active ? 'active' : 'inactive'}`}>
                                                    {user.active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-icons">
                                                    <FiEdit className="edit-icon" title="Edit" onClick={() => openEditModal(user)} />
                                                    <FiTrash className="delete-icon" title="Delete" onClick={() => openDeleteModal(user)} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="no-results">No employees found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                 {/**/}

            </div>

            {/* */}
            <Modal isOpen={isCreateModalOpen} onClose={closeCreateModal} title="Create New Employee">
                <form onSubmit={handleCreateSubmit} className="modal-form">
                     {error && isCreateModalOpen && <div className="error-message" style={{marginBottom: '10px'}}>{error}</div>}
                    <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleFormChange} required />
                    <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleFormChange} required />
                    <input type="password" name="password" placeholder="Password (min 6 chars)" value={formData.password} onChange={handleFormChange} required />
                    <input type="text" name="phone" placeholder="Phone (Optional)" value={formData.phone} onChange={handleFormChange} />
                    <select name="role" value={formData.role} onChange={handleFormChange} required>
                        <option value="cashier">Cashier</option>
                        <option value="manager">Manager</option>
                    </select>
                     <label style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                        <input type="checkbox" name="active" checked={formData.active} onChange={handleFormChange} style={{ marginRight: '8px' }}/>
                        Active Account
                    </label>
                    <button type="submit" className="submit-button" disabled={loading}>{loading ? 'Creating...' : 'Create Employee'}</button>
                </form>
            </Modal>

            
            <Modal isOpen={isEditModalOpen} onClose={closeEditModal} title={`Edit Employee: ${currentUser?.username}`}>
                 <form onSubmit={handleEditSubmit} className="modal-form">
                    {error && isEditModalOpen && <div className="error-message" style={{marginBottom: '10px'}}>{error}</div>}
                    <input type="text" name="name" placeholder="Full Name" value={editFormData.name} onChange={handleEditFormChange} />
                    <input type="text" name="phone" placeholder="Phone" value={editFormData.phone} onChange={handleEditFormChange} />
                     <input type="password" name="password" placeholder="New Password (Optional)" value={editFormData.password} onChange={handleEditFormChange} />
                    <select name="role" value={editFormData.role} onChange={handleEditFormChange} required>
                        <option value="cashier">Cashier</option>
                        <option value="manager">Manager</option>
                    </select>
                     <label style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                        <input type="checkbox" name="active" checked={editFormData.active} onChange={handleEditFormChange} style={{ marginRight: '8px' }}/>
                        Active Account
                    </label>
                    <button type="submit" className="submit-button" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
                </form>
            </Modal>

            
            <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} title="Confirm Deletion">
                <p>Are you sure you want to delete employee <strong>{currentUser?.username}</strong>?</p>
                 {error && isDeleteModalOpen && <div className="error-message" style={{marginBottom: '10px'}}>{error}</div>}
                <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px'}}>
                     <button className="cancel-button" onClick={closeDeleteModal} disabled={loading}>Cancel</button>
                    <button className="delete-button" onClick={handleDeleteConfirm} disabled={loading}>{loading ? 'Deleting...' : 'Delete'}</button>
                </div>
            </Modal>


        </div>
    );
};

export default EmployeeManagement;


// --- File End: EmployeeManagement.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\pages\ImportPurchase.js ---
// ============================================================================

// // frontend/src/pages/ImportPurchase.jsx
// import React, { useState, useRef, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import '../styles/importPurchase.css';

// const ImportPurchase = () => {
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [suppliers, setSuppliers] = useState([]);
//   const [warehouses, setWarehouses] = useState([]);
//   const [formData, setFormData] = useState({
//     date: new Date().toISOString().split('T')[0],
//     supplier: '',
//     warehouse: '',
//     orderTax: '0',
//     discount: '0',
//     status: 'pending',
//     notes: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const fileInputRef = useRef(null);
//   const navigate = useNavigate();

//   // Fetch suppliers and warehouses on component mount
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch suppliers
//         const suppliersResponse = await axios.get('/api/suppliers');
//         if (suppliersResponse.data.success) {
//           setSuppliers(suppliersResponse.data.data);
//         }

//         // Fetch warehouses if your system uses them
//         try {
//           const warehousesResponse = await axios.get('/api/warehouses');
//           if (warehousesResponse.data.success) {
//             setWarehouses(warehousesResponse.data.data);
//           }
//         } catch (warehouseError) {
//           console.log('Warehouses might not be implemented yet');
//         }
//       } catch (error) {
//         console.error('Error fetching data:', error);
//         setError('Error loading suppliers or warehouses.');
//       }
//     };

//     fetchData();
//   }, []);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value
//     });
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       if (file.type === 'text/csv' || 
//           file.type === 'application/vnd.ms-excel' || 
//           file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
//           file.name.endsWith('.csv') || 
//           file.name.endsWith('.xls') || 
//           file.name.endsWith('.xlsx')) {
//         setSelectedFile(file);
//         setError('');
//       } else {
//         setError('Only CSV, XLS, or XLSX files are allowed.');
//         setSelectedFile(null);
//       }
//     }
//   };

//   const handleDragOver = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     e.stopPropagation();

//     if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
//       const file = e.dataTransfer.files[0];
//       if (file.type === 'text/csv' || 
//           file.type === 'application/vnd.ms-excel' || 
//           file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
//           file.name.endsWith('.csv') || 
//           file.name.endsWith('.xls') || 
//           file.name.endsWith('.xlsx')) {
//         setSelectedFile(file);
//         setError('');
//       } else {
//         setError('Only CSV, XLS, or XLSX files are allowed.');
//         setSelectedFile(null);
//       }
//     }
//   };

//   const handleUploadClick = () => {
//     fileInputRef.current.click();
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!selectedFile) {
//       setError('Please select a file to import.');
//       return;
//     }

//     if (!formData.supplier) {
//       setError('Please select a supplier.');
//       return;
//     }

//     setLoading(true);
//     const submitFormData = new FormData();
//     submitFormData.append('file', selectedFile);

//     // Append all form data
//     Object.keys(formData).forEach(key => {
//       submitFormData.append(key, formData[key]);
//     });

//     try {
//       const response = await axios.post('/api/purchases/import', submitFormData, {
//         headers: {
//           'Content-Type': 'multipart/form-data'
//         }
//       });

//       if (response.data.success) {
//         alert('Purchase data imported successfully!');
//         navigate('/purchases');
//       } else {
//         setError(response.data.message || 'Error importing purchase data.');
//       }
//     } catch (error) {
//       console.error('Import error:', error);
//       setError(error.response?.data?.message || 'Error importing purchase data. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDiscard = () => {
//     navigate('/purchases');
//   };

//   const downloadExample = () => {
//     window.location.href = '/api/purchases/download-sample';
//   };

//   return (
//     <div className="import-purchase-container">
//       <h1>Import Purchase</h1>

//       <form onSubmit={handleSubmit}>
//         <div className="form-row">
//           <div className="form-group">
//             <label htmlFor="date">Date</label>
//             <input 
//               type="date" 
//               id="date" 
//               name="date"
//               value={formData.date} 
//               onChange={handleInputChange}
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label htmlFor="supplier">Supplier</label>
//             <select 
//               id="supplier" 
//               name="supplier"
//               value={formData.supplier} 
//               onChange={handleInputChange}
//               required
//             >
//               <option value="">Choose Supplier</option>
//               {suppliers.map(supplier => (
//                 <option key={supplier._id} value={supplier._id}>
//                   {supplier.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="form-group">
//             <label htmlFor="warehouse">Warehouse</label>
//             <select 
//               id="warehouse" 
//               name="warehouse"
//               value={formData.warehouse} 
//               onChange={handleInputChange}
//             >
//               <option value="">Choose Warehouse</option>
//               {warehouses.map(warehouse => (
//                 <option key={warehouse._id} value={warehouse._id}>
//                   {warehouse.name}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         <div className="form-row">
//           <div className="form-group">
//             <label htmlFor="orderTax">Order Tax (%)</label>
//             <input 
//               type="number" 
//               id="orderTax" 
//               name="orderTax"
//               value={formData.orderTax} 
//               onChange={handleInputChange}
//               placeholder="0"
//               min="0"
//               step="0.01"
//             />
//           </div>

//           <div className="form-group">
//             <label htmlFor="discount">Discount</label>
//             <input 
//               type="number" 
//               id="discount" 
//               name="discount"
//               value={formData.discount} 
//               onChange={handleInputChange}
//               placeholder="0"
//               min="0"
//               step="0.01"
//             />
//           </div>

//           <div className="form-group">
//             <label htmlFor="status">Status</label>
//             <select 
//               id="status" 
//               name="status"
//               value={formData.status} 
//               onChange={handleInputChange}
//               required
//             >
//               <option value="pending">Pending</option>
//               <option value="ordered">Ordered</option>
//               <option value="received">Received</option>
//             </select>
//           </div>
//         </div>

//         <div className="file-upload-section">
//           <div 
//             className="file-drop-area" 
//             onDragOver={handleDragOver}
//             onDrop={handleDrop}
//             onClick={handleUploadClick}
//           >
//             <input 
//               type="file" 
//               ref={fileInputRef}
//               onChange={handleFileChange}
//               style={{ display: 'none' }}
//               accept=".csv,.xls,.xlsx"
//             />
//             <div className="file-message">
//               {selectedFile ? (
//                 <div>
//                   <p>Selected file: {selectedFile.name}</p>
//                 </div>
//               ) : (
//                 <div>
//                   <span className="upload-icon">📁</span>
//                   <p>Click to upload or drag and drop</p>
//                   <p className="small-text">CSV, XLS, or XLSX files are allowed.</p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {error && <p className="error-message">{error}</p>}

//           <div className="download-sample">
//             <button type="button" className="btn-download" onClick={downloadExample}>
//               Download Example
//             </button>
//           </div>
//         </div>

//         <div className="note-section">
//           <label htmlFor="notes">Notes</label>
//           <textarea 
//             id="notes" 
//             name="notes"
//             value={formData.notes} 
//             onChange={handleInputChange}
//             placeholder="Write a note..."
//             rows={3}
//           />
//         </div>

//         <div className="form-buttons">
//           <button type="button" className="btn-discard" onClick={handleDiscard}>
//             Discard
//           </button>
//           <button type="submit" className="btn-save-submit" disabled={loading}>
//             {loading ? 'Processing...' : 'Save & Submit'}
//           </button>
//         </div>
//       </form>
//     </div>

//   );
// };

// export default ImportPurchase;

// frontend/src/pages/ImportPurchase.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout'; // ✅ Added Layout import
import '../styles/importPurchase.css';

const ImportPurchase = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    supplier: '',
    warehouse: '',
    orderTax: '0',
    discount: '0',
    status: 'pending',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const suppliersResponse = await axios.get('/api/suppliers');
        if (suppliersResponse.data.success) {
          setSuppliers(suppliersResponse.data.data);
        }

        try {
          const warehousesResponse = await axios.get('/api/warehouses');
          if (warehousesResponse.data.success) {
            setWarehouses(warehousesResponse.data.data);
          }
        } catch {
          console.log('Warehouses might not be implemented yet');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error loading suppliers or warehouses.');
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (
        file.type === 'text/csv' ||
        file.type === 'application/vnd.ms-excel' ||
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.name.endsWith('.csv') ||
        file.name.endsWith('.xls') ||
        file.name.endsWith('.xlsx')
      ) {
        setSelectedFile(file);
        setError('');
      } else {
        setError('Only CSV, XLS, or XLSX files are allowed.');
        setSelectedFile(null);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileChange({ target: { files: [file] } });
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Please select a file to import.');
      return;
    }

    if (!formData.supplier) {
      setError('Please select a supplier.');
      return;
    }

    setLoading(true);
    const submitFormData = new FormData();
    submitFormData.append('file', selectedFile);
    Object.entries(formData).forEach(([key, value]) => {
      submitFormData.append(key, value);
    });

    try {
      const response = await axios.post('/api/purchases/import', submitFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        alert('Purchase data imported successfully!');
        navigate('/purchases');
      } else {
        setError(response.data.message || 'Error importing purchase data.');
      }
    } catch (error) {
      console.error('Import error:', error);
      setError(error.response?.data?.message || 'Error importing purchase data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    navigate('/purchases');
  };

  const downloadExample = () => {
    window.location.href = '/api/purchases/download-sample';
  };

  return (
    <Layout> {/* ✅ Wrapping everything in Layout */}
      <div className="import-purchase-container">
        <h1>Import Purchase</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="supplier">Supplier</label>
              <select
                id="supplier"
                name="supplier"
                value={formData.supplier}
                onChange={handleInputChange}
                required
              >
                <option value="">Choose Supplier</option>
                {suppliers.map(supplier => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="warehouse">Warehouse</label>
              <select
                id="warehouse"
                name="warehouse"
                value={formData.warehouse}
                onChange={handleInputChange}
              >
                <option value="">Choose Warehouse</option>
                {warehouses.map(warehouse => (
                  <option key={warehouse._id} value={warehouse._id}>
                    {warehouse.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="orderTax">Order Tax (%)</label>
              <input
                type="number"
                id="orderTax"
                name="orderTax"
                value={formData.orderTax}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label htmlFor="discount">Discount</label>
              <input
                type="number"
                id="discount"
                name="discount"
                value={formData.discount}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
              >
                <option value="pending">Pending</option>
                <option value="ordered">Ordered</option>
                <option value="received">Received</option>
              </select>
            </div>
          </div>

          <div className="file-upload-section">
            <div
              className="file-drop-area"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handleUploadClick}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept=".csv,.xls,.xlsx"
              />
              <div className="file-message">
                {selectedFile ? (
                  <div>
                    <p>Selected file: {selectedFile.name}</p>
                  </div>
                ) : (
                  <div>
                    <span className="upload-icon">📁</span>
                    <p>Click to upload or drag and drop</p>
                    <p className="small-text">CSV, XLS, or XLSX files are allowed.</p>
                  </div>
                )}
              </div>
            </div>

            {error && <p className="error-message">{error}</p>}

            <div className="download-sample">
              <button type="button" className="btn-download" onClick={downloadExample}>
                Download Example
              </button>
            </div>
          </div>

          <div className="note-section">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Write a note..."
              rows={3}
            />
          </div>

          <div className="form-buttons">
            <button type="button" className="btn-discard" onClick={handleDiscard}>
              Discard
            </button>
            <button type="submit" className="btn-save-submit" disabled={loading}>
              {loading ? 'Processing...' : 'Save & Submit'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ImportPurchase;




// --- File End: ImportPurchase.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\pages\Login.js ---
// ============================================================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';
import logoImage from '../images/logo-small.png';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { login, error, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-container login-page">
      <div className="auth-card-left">
        <div className="logo-container">
          <div className="logo">
            {/* Logo image would be here */}
              <img src={logoImage} alt="logo"></img>
          </div>
          <h1>FinTrack</h1>
        </div>

        <div className="promo-content">
          <h2>Start your Journey with us!</h2>
          <p>Experience seamless transactions and personalized solutions. Let's enhance your business operations together.
            Start optimizing your POS system today with us!</p>
          <div className="company-info">
            <p>FinTrack Solutions Inc.</p>
          </div>
        </div>
      </div>

      <div className="auth-card-right">
        <div className="form-content">
          <div className="auth-header">
            <h2>Login</h2>
            <p>Login to your account!</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username:</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="username"
                required
                autoComplete="off"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="password"
                required
                autoComplete="off"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <div className="form-options">
                <div className="remember-me">
                  <input 
                    type="checkbox" 
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="remember">Remember Me</label>
                </div>
                <Link to="/forgot-password" className="forgot-password">Forget Password?</Link>
              </div>
            </div>

            <div className="form-group">
              <input 
                type="submit" 
                value={loading ? "Logging in..." : "Login"} 
                disabled={loading}
                className="submit-button"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login; 

// --- File End: Login.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\pages\all_products.js ---
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaEye, FaPrint } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { productsAPI } from '../services/api';
import ProductLabel from '../components/ProductLabel';
import './all_products.css';

// Import images
import sodaImage from '../images/soda.jpeg';
import chocolateImage from '../images/chocolate.jpeg';
import milkImage from '../images/milk.jpg';
import defaultProductImage from '../images/default-product-image.jpg';

const Inventory = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [showProductLabel, setShowProductLabel] = useState(false);

  // Handle escape key press to close modals
  const handleEscapeKey = useCallback((event) => {
    if (event.key === 'Escape') {
      if (selectedProduct) {
        setSelectedProduct(null);
        document.body.style.overflow = 'auto';
      }
      if (isEditModalOpen) {
        setIsEditModalOpen(false);
        document.body.style.overflow = 'auto';
      }
      if (isDeleteConfirmOpen) {
        setIsDeleteConfirmOpen(false);
        document.body.style.overflow = 'auto';
      }
      if (showProductLabel) {
        setShowProductLabel(false);
        document.body.style.overflow = 'auto';
      }
    }
  }, [selectedProduct, isEditModalOpen, isDeleteConfirmOpen, showProductLabel]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Add event listener for escape key
  useEffect(() => {
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [handleEscapeKey]);

  // Fetch products on component mount or page change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Get token from localStorage
        const token = localStorage.getItem('token');

        if (!token) {
          // Redirect to login if not authenticated
          window.location.href = '/login';
          return;
        }

        const response = await productsAPI.getAll({ page: currentPage });

        setProducts(response.data.data);
        setTotalPages(response.data.totalPages || 1);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage]);

  // Handle checkbox selection
  const toggleSelect = (productId) => {
    if (selectedItems.includes(productId)) {
      setSelectedItems(selectedItems.filter(id => id !== productId));
    } else {
      setSelectedItems([...selectedItems, productId]);
    }
  };

  // Handle select all checkbox
  const toggleSelectAll = () => {
    if (selectedItems.length === filteredProducts.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredProducts.map(product => product._id));
    }
  };

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to get product image
  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    if (product.name.toLowerCase().includes('soda')) return sodaImage;
    if (product.name.toLowerCase().includes('chocolate')) return chocolateImage;
    if (product.name.toLowerCase().includes('milk')) return milkImage;
    return defaultProductImage;
  };

  const handleCreateProduct = () => {
    if (isAuthenticated()) {
      navigate('/create_products');
    } else {
      navigate('/login');
    }
  };

  // Handle edit button click
  const handleEditClick = (product) => {
    setEditFormData({
      _id: product._id,
      name: product.name,
      barcode: product.barcode,
      description: product.description || '',
      price: product.price,
      quantity: product.quantity,
      category: product.category?._id,
      supplier: product.supplier?._id,
      costPrice: product.costPrice || 0,
      minStockLevel: product.minStockLevel || 0,
      status: product.status || 'active'
    });
    setIsEditModalOpen(true);
    // Add overflow hidden to body to prevent background scrolling
    document.body.style.overflow = 'hidden';
  };

  // Handle delete button click
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setIsDeleteConfirmOpen(true);
    // Add overflow hidden to body to prevent background scrolling
    document.body.style.overflow = 'hidden';
  };

  // Handle form input changes for edit modal
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await productsAPI.update(editFormData._id, editFormData);
      // Refresh product list
      const response = await productsAPI.getAll({ page: currentPage });
      setProducts(response.data.data);
      setIsEditModalOpen(false);
      // Restore body overflow
      document.body.style.overflow = 'auto';
      // Show success message
      setError(null);
      alert('Product updated successfully');
    } catch (err) {
      console.error('Error updating product:', err);
      setError('Failed to update product. Please try again.');
    }
  };

  // Handle product deletion
  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      await productsAPI.delete(productToDelete._id);
      // Refresh product list
      const response = await productsAPI.getAll({ page: currentPage });
      setProducts(response.data.data);
      setIsDeleteConfirmOpen(false);
      setProductToDelete(null);
      // Restore body overflow
      document.body.style.overflow = 'auto';
      // Show success message
      setError(null);
      alert('Product deleted successfully');
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Failed to delete product. Please try again.');
    }
  };

  return (
    <Layout title="All Products">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {loading && (
        <div className="flex justify-center items-center p-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}
      <div className="products-frame">
        <div className="products-div-2">
          <div className="products-div-3">
            <div className="products-div-4">
              <div className="products-text-2">All Products</div>
              <div className="products-controls-container">
                <div className="products-search-container">
                  <FaSearch className="products-search-icon" />
                  <input
                    type="text"
                    placeholder="Search this table"
                    className="products-search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="products-action-buttons">
                  <button
                    className="products-create-button"
                    onClick={handleCreateProduct}
                  >
                    <FaPlus /> Create New Product
                  </button>
                </div>
              </div>
            </div>

            <div className="products-div-6">
              <div className="products-div-7">
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          className="products-checkbox"
                          onChange={toggleSelectAll}
                          checked={selectedItems.length === filteredProducts.length}
                        />
                      </th>
                      <th>P-Code</th>
                      <th>Photo</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>SKU</th>
                      <th>Sale Price</th>
                      <th>Qty</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product._id}>
                        <td>
                          <input
                            type="checkbox"
                            className="products-checkbox"
                            checked={selectedItems.includes(product._id)}
                            onChange={() => toggleSelect(product._id)}
                          />
                        </td>
                        <td>{product.barcode}</td>
                        <td>
                          <div className="products-image-container">
                            <img
                              src={getProductImage(product)}
                              alt={product.name}
                              className="products-image"
                            />
                          </div>
                        </td>
                        <td>{product.name}</td>
                        <td>{product.category ? product.category.name : 'Uncategorized'}</td>
                        <td>{product.barcode}</td>
                        <td>${product.price?.toFixed(2)}</td>
                        <td>{product.quantity}</td>
                        <td>
                          <div className="products-action-buttons">
                            <button
                              className="products-action-button"
                              onClick={() => {
                                setSelectedProduct(product);
                                // Add overflow hidden to body to prevent background scrolling
                                document.body.style.overflow = 'hidden';
                              }}
                            >
                              <FaEye />
                            </button>
                            <button
                              className="products-action-button"
                              onClick={() => handleEditClick(product)}
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="products-action-button"
                              onClick={() => handleDeleteClick(product)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="products-pagination-container">
                  <div className="products-pagination-controls">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="products-pagination-button"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="products-pagination-button"
                    >
                      Next
                    </button>
                  </div>
                  <span className="products-page-info">Page {currentPage} of {totalPages}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div
          className="products-modal-overlay"
          onClick={() => {
            setSelectedProduct(null);
            document.body.style.overflow = 'auto';
          }}
        >
          <div
            className="products-modal-container details"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="products-modal-header">
              <button
                className="products-print-label-btn"
                onClick={() => setShowProductLabel(true)}
              >
                <FaPrint size={12} /> Print Label
              </button>
              <div className="products-modal-title">
                Product Details
              </div>
              <button
                className="products-modal-close"
                onClick={() => {
                  setSelectedProduct(null);
                  // Restore body overflow
                  document.body.style.overflow = 'auto';
                }}
              >
                ×
              </button>
            </div>

            {/* Image Section */}
            <div className="products-modal-image">
              <img
                src={getProductImage(selectedProduct)}
                alt={selectedProduct.name}
              />
            </div>

            {/* Details Section */}
            <div className="products-modal-details">
              <div className="products-modal-detail-row">
                <div className="products-modal-detail-label">Type</div>
                <div className="products-modal-detail-value">Single</div>
              </div>
              <div className="products-modal-detail-row">
                <div className="products-modal-detail-label">Code Product</div>
                <div className="products-modal-detail-value">{selectedProduct._id.substring(0, 8)}</div>
              </div>
              <div className="products-modal-detail-row">
                <div className="products-modal-detail-label">Product</div>
                <div className="products-modal-detail-value">{selectedProduct.name}</div>
              </div>
              <div className="products-modal-detail-row">
                <div className="products-modal-detail-label">Brand</div>
                <div className="products-modal-detail-value">{selectedProduct.brand || 'N/A'}</div>
              </div>
              <div className="products-modal-detail-row">
                <div className="products-modal-detail-label">Category</div>
                <div className="products-modal-detail-value">{selectedProduct.category ? selectedProduct.category.name : 'Uncategorized'}</div>
              </div>
              <div className="products-modal-detail-row">
                <div className="products-modal-detail-label">Cost</div>
                <div className="products-modal-detail-value">${selectedProduct.costPrice?.toFixed(2) || '0.00'}</div>
              </div>
              <div className="products-modal-detail-row">
                <div className="products-modal-detail-label">Warehouse</div>
                <div className="products-modal-detail-value">Warehouse 1</div>
              </div>
              <div className="products-modal-detail-row">
                <div className="products-modal-detail-label">Price</div>
                <div className="products-modal-detail-value">${selectedProduct.price?.toFixed(2) || '0.00'}</div>
              </div>
              <div className="products-modal-detail-row">
                <div className="products-modal-detail-label">Unit</div>
                <div className="products-modal-detail-value">Pc</div>
              </div>
              <div className="products-modal-detail-row">
                <div className="products-modal-detail-label">Tax</div>
                <div className="products-modal-detail-value">0.00%</div>
              </div>
              <div className="products-modal-detail-row">
                <div className="products-modal-detail-label">Stock</div>
                <div className="products-modal-detail-value">{selectedProduct.quantity || '0'}</div>
              </div>

              {/* Barcode Section */}
              <div className="products-modal-barcode">
                <div className="text-center">
                  <img
                    src={`https://barcodeapi.org/api/code128/${selectedProduct.barcode || '000000000000'}`}
                    alt="Barcode"
                    style={{ width: '140px', height: '35px' }}
                  />
                  <div style={{ fontSize: '11px', marginTop: '2px' }}>
                    {selectedProduct.barcode || '000000000000'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && (
        <div
          className="products-modal-overlay"
          onClick={() => {
            setIsEditModalOpen(false);
            document.body.style.overflow = 'auto';
          }}
        >
          <div
            className="products-modal-container edit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="products-modal-header">
              <div className="products-modal-title">Edit Product</div>
              <button
                className="products-modal-close"
                onClick={() => {
                  setIsEditModalOpen(false);
                  // Restore body overflow
                  document.body.style.overflow = 'auto';
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-4">
              <div className="grid grid-cols-2 gap-6 mb-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name || ''}
                    onChange={handleEditFormChange}
                    className="block w-full border border-gray-300 rounded-md p-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Barcode</label>
                  <input
                    type="text"
                    name="barcode"
                    value={editFormData.barcode || ''}
                    onChange={handleEditFormChange}
                    className="block w-full border border-gray-300 rounded-md p-2 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">Description</label>
                <textarea
                  name="description"
                  value={editFormData.description || ''}
                  onChange={handleEditFormChange}
                  className="block w-full border border-gray-300 rounded-md p-2 text-sm"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-6 mb-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Sale Price</label>
                  <input
                    type="number"
                    name="price"
                    value={editFormData.price || 0}
                    onChange={handleEditFormChange}
                    className="block w-full border border-gray-300 rounded-md p-2 text-sm"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Cost Price</label>
                  <input
                    type="number"
                    name="costPrice"
                    value={editFormData.costPrice || 0}
                    onChange={handleEditFormChange}
                    className="block w-full border border-gray-300 rounded-md p-2 text-sm"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={editFormData.quantity || 0}
                    onChange={handleEditFormChange}
                    className="block w-full border border-gray-300 rounded-md p-2 text-sm"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Min Stock Level</label>
                  <input
                    type="number"
                    name="minStockLevel"
                    value={editFormData.minStockLevel || 0}
                    onChange={handleEditFormChange}
                    className="block w-full border border-gray-300 rounded-md p-2 text-sm"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Status</label>
                  <select
                    name="status"
                    value={editFormData.status || 'active'}
                    onChange={handleEditFormChange}
                    className="block w-full border border-gray-300 rounded-md p-2 text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    // Restore body overflow
                    document.body.style.overflow = 'auto';
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Label Modal */}
      {showProductLabel && selectedProduct && (
        <ProductLabel
          product={selectedProduct}
          onClose={() => {
            setShowProductLabel(false);
            document.body.style.overflow = 'auto';
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div
          className="products-modal-overlay"
          onClick={() => {
            setIsDeleteConfirmOpen(false);
            document.body.style.overflow = 'auto';
          }}
        >
          <div
            className="products-modal-container delete"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="products-modal-header">
              <div className="products-modal-title">Confirm Delete</div>
              <button
                className="products-modal-close"
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  // Restore body overflow
                  document.body.style.overflow = 'auto';
                }}
              >
                ×
              </button>
            </div>
            <div className="p-6 text-center">
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete the product "{productToDelete?.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteConfirmOpen(false);
                    // Restore body overflow
                    document.body.style.overflow = 'auto';
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Inventory;

// --- File End: all_products.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\pages\all_users.js ---
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { FiSearch, FiFilter, FiPlus } from 'react-icons/fi';
import { FaFileExcel, FaFilePdf, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import { usersAPI } from '../services/api';
import './all_users.css';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, userName }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Confirm Deletion</h3>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <p>Are you sure you want to delete user <strong>{userName}</strong>?</p>
          <p className="warning-text">This action cannot be undone.</p>
        </div>
        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button className="delete-button" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();
      setUsers(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to fetch users. You may not have permission to view this data.');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages));
  };

  const handleAddUser = () => {
    navigate('/create-user');
  };

  const handleExportExcel = async () => {
    try {
      const response = await usersAPI.exportUsers('excel');
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'users.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting users:', err);
      setError('Failed to export users');
    }
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await usersAPI.delete(userToDelete._id);
      setUsers(users.filter(user => user._id !== userToDelete._id));
      setDeleteSuccess(`User ${userToDelete.name} was deleted successfully`);

      //will remove the success message after 3s
      setTimeout(() => {
        setDeleteSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.response?.data?.message || 'Failed to delete user');
    } finally {
      closeDeleteModal();
    }
  };

  return (
    <Layout title="All Users">
      <div className="content-container">
        <div className="header-section">
          <h1>All Users</h1>
          <div className="search-filter-container">
            <div className="search-container">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search this table"
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
            </div>
            <div className="action-buttons">
              <button className="filter-button">
                <FiFilter /> Filters
              </button>
              <button className="export-button pdf">
                <FaFilePdf /> PDF
              </button>
              <button className="export-button excel" onClick={handleExportExcel}>
                <FaFileExcel /> Excel
              </button>
              <button className="add-user-button" onClick={handleAddUser}>
                <FiPlus /> Add New User
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-container">
            <div className="error-message">{error}</div>
          </div>
        )}

        {deleteSuccess && (
          <div className="success-container">
            <div className="success-message">{deleteSuccess}</div>
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <div>Loading users...</div>
          </div>
        ) : (
          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length > 0 ? (
                  currentUsers.map(user => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email || '-'}</td>
                      <td>{user.phone || '-'}</td>
                      <td>{user.role}</td>
                      <td>
                        <span className={`status-badge ${user.active ? 'active' : 'inactive'}`}>
                          {user.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-icons">
                          <FaEdit className="edit-icon" title="Edit" />
                          <FaTrash
                            className="delete-icon"
                            title="Delete"
                            onClick={() => openDeleteModal(user)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-results">No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 0 && (
          <div className="pagination">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={currentPage === 1 ? 'disabled' : ''}
            >
              Previous
            </button>
            <span className="page-info">Page {currentPage} of {totalPages}</span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={currentPage === totalPages ? 'disabled' : ''}
            >
              Next
            </button>
          </div>
        )}

        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={confirmDelete}
          userName={userToDelete?.name || ''}
        />
      </div>
    </Layout>
  );
};

export default AllUsers;

// --- File End: all_users.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\pages\brands.js ---
// ============================================================================

import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaSearch, FaPlus, FaTimes } from 'react-icons/fa';
import Layout from '../components/Layout';
import './brands.css';

const Brands = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [brandName, setBrandName] = useState('');
  const [brandDescription, setBrandDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingBrand, setEditingBrand] = useState(null);

  // Fetch brands on component mount
  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }
      const response = await fetch('http://localhost:5002/api/brands', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setBrands(data.data);
      } else {
        setError('Failed to fetch brands: ' + (data.message || 'Unknown error'));
        console.warn('Brands fetch failed:', data.message);
      }
    } catch (err) {
      setError('Failed to fetch brands');
      console.error('Error fetching brands:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const method = editingBrand ? 'PUT' : 'POST';
      const url = editingBrand
        ? `http://localhost:5002/api/brands/${editingBrand._id}`
        : 'http://localhost:5002/api/brands';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: brandName,
          description: brandDescription
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Refresh brands list
        await fetchBrands();

        // Reset form
        setIsModalOpen(false);
        setBrandName('');
        setBrandDescription('');
        setEditingBrand(null);
      } else {
        setError(data.message || 'Failed to save brand');
      }
    } catch (err) {
      setError('Failed to save brand');
      console.error('Error saving brand:', err);
    }
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setBrandName(brand.name);
    setBrandDescription(brand.description);
    setIsModalOpen(true);
  };

  const handleDelete = async (brandId) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/login';
          return;
        }

        const response = await fetch(`http://localhost:5002/api/brands/${brandId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (data.success) {
          await fetchBrands();
        } else {
          setError(data.message || 'Failed to delete brand');
        }
      } catch (err) {
        setError('Failed to delete brand');
        console.error('Error deleting brand:', err);
      }
    }
  };

  // Filter brands based on search term
  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout title="Brands">
      <div className="categories-frame">
        <div className="categories-div-2">
          <div className="categories-div-3">
            <div className="categories-div-4">
              <div className="categories-text-2">Brands</div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="categories-search-container">
              <FaSearch className="categories-search-icon" />
              <input
                type="text"
                placeholder="Search brands"
                className="categories-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="categories-div-6">
              <div className="categories-div-7">
                <table className="categories-table">
                  <thead>
                    <tr>
                      <th>Brand Name</th>
                      <th>Brand Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="3">Loading...</td>
                      </tr>
                    ) : filteredBrands.map((brand) => (
                      <tr key={brand._id}>
                        <td>{brand.name}</td>
                        <td>{brand.description}</td>
                        <td>
                          <div className="categories-action-buttons">
                            <button
                              className="categories-action-button"
                              onClick={() => handleEdit(brand)}
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="categories-action-button"
                              onClick={() => handleDelete(brand._id)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="categories-action-buttons-container">
            <button
              className="categories-action-button primary"
              onClick={() => {
                setEditingBrand(null);
                setBrandName('');
                setBrandDescription('');
                setIsModalOpen(true);
              }}
            >
              <FaPlus /> Create New Brand
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="categories-modal-overlay">
          <div className="categories-modal">
            <button
              className="categories-modal-close"
              onClick={() => {
                setIsModalOpen(false);
                setEditingBrand(null);
                setBrandName('');
                setBrandDescription('');
              }}
            >
              <FaTimes />
            </button>
            <h2 className="categories-modal-title">
              {editingBrand ? 'Edit Brand' : 'Create Brand'}
            </h2>
            <form className="categories-modal-form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Enter brand name"
                className="categories-modal-input"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Enter brand description"
                className="categories-modal-description"
                value={brandDescription}
                onChange={(e) => setBrandDescription(e.target.value)}
                required
              />
              <button type="submit" className="categories-modal-submit">
                {editingBrand ? 'Update' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Brands;



// --- File End: brands.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\pages\categories.js ---
// ============================================================================

import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaSearch, FaPlus, FaTimes } from 'react-icons/fa';
import Layout from '../components/Layout';
import './categories.css';

const CategoryPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [active, setActive] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);

  // Fetch categories from the backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/login';
          return;
        }
        const response = await fetch('/api/categories', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setCategories(data.data);
        } else {
          console.warn('Categories fetch failed:', data.message);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this category?');
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setCategories(prev => prev.filter(category => category._id !== id));
      } else {
        alert(data.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Something went wrong while deleting category.');
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing
        ? `/api/categories/${editingId}`
        : '/api/categories';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: categoryName,
          description: categoryDescription,
          active,
        }),
      });

      const data = await response.json();
      if (data.success) {
        if (isEditing) {
          setCategories(prev =>
            prev.map(cat => (cat._id === editingId ? data.data : cat))
          );
        } else {
          setCategories(prev => [...prev, data.data]);
        }

        setIsModalOpen(false);
        setIsEditing(false);
        setEditingId(null);
        setCategoryName('');
        setCategoryDescription('');
        setActive(true);
      } else {
        alert(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Something went wrong.');
    }
  };

  const handleEdit = (category) => {
    setIsEditing(true);
    setEditingId(category._id);
    setCategoryName(category.name);
    setCategoryDescription(category.description);
    setActive(category.active);
    setIsModalOpen(true);
  };


  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category._id.toLowerCase().includes(searchTerm.toLowerCase()) || // Use _id for category code
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout title="Categories">
      <div className="categories-frame">
        <div className="categories-div-2">
          <div className="categories-div-3">
            <div className="categories-div-4">
              <div className="categories-text-2">Category</div>
            </div>
            <div className="categories-search-container">
              <FaSearch className="categories-search-icon" />
              <input
                type="text"
                placeholder="Search this table"
                className="categories-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="categories-div-6">
              <div className="categories-div-7">
                <table className="categories-table">
                  <thead>
                    <tr>
                      <th>Category Name</th>
                      <th>Category Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.map((category) => (
                      <tr key={category._id}>
                        <td>{category.name}</td> {/* Displaying the category name */}
                        <td>{category.description}</td> {/* Displaying the category description */}
                        <td>
                          <div className="categories-action-buttons">
                            <button className="categories-action-button"
                            onClick={() => handleEdit(category)}
                            >
                              <FaEdit />
                            </button>
                            <button className="categories-action-button"
                            onClick={() => handleDelete(category._id)}>
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="categories-pagination-container">
                  <div className="categories-pagination-controls">
                    <button className="categories-pagination-button">Previous</button>
                    <button className="categories-pagination-button">Next</button>
                  </div>
                  <span className="categories-page-info">Page 1 of 10</span>
                </div>
              </div>
            </div>
          </div>

          <div className="categories-action-buttons-container">
            <button
              className="categories-action-button primary"
              onClick={() => setIsModalOpen(true)}
            >
              <FaPlus /> Create New Category
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="categories-modal-overlay">
          <div className="categories-modal">
            <button
              className="categories-modal-close"
              onClick={() => setIsModalOpen(false)}
            >
              <FaTimes />
            </button>
            <h2 className="categories-modal-title">Create Category</h2>
            <form className="categories-modal-form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Enter category name"
                className="categories-modal-input"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Enter category description"
                className="categories-modal-input"
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                required
              />
              <label className="categories-modal-label">
  Active Status:
  <select
    className="categories-modal-input"
    value={active}
    onChange={(e) => setActive(e.target.value === 'true')}
  >
    <option value="true">Active</option>
    <option value="false">Inactive</option>
  </select>
</label>
              <button type="submit" className="categories-modal-submit">
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default CategoryPage;


// --- File End: categories.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\pages\create_products.js ---
// ============================================================================

import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Card, Alert } from 'react-bootstrap';
import "../styles/topbar.css";
import "../styles/product_page.css";


const getInitialState = () => ({
    warehouse: '',
    title: '',
    brand: '',
    category: '',
    subcategory: '',
    group: '',
    supplier: '',
    size: '',
    color: '',
    description: '',
    productImage: null,
    sku: '',
    salePrice: '',
    purchasePrice: '',
    saleUnit: '',
    gst: '',
    purchaseUnit: '',
    quantity: '',
    stockAlert: '',
    discountRate: '',
    discountAmount: ''
});


const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

const CreateProducts = () => {
  const [formData, setFormData] = useState(getInitialState());

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => {
      const newData = {
        ...prevData,
        [name]: value
      };
      //discount logic
      if (name === 'discountAmount' && value !== '' && newData.salePrice !== '') {
        const salePrice = parseFloat(newData.salePrice);
        const discountAmount = parseFloat(value);
        if (!isNaN(salePrice) && !isNaN(discountAmount) && salePrice > 0) {
          newData.discountRate = ((discountAmount / salePrice) * 100).toFixed(2);
        }
      } else if (name === 'discountRate' && value !== '' && newData.salePrice !== '') {
        const salePrice = parseFloat(newData.salePrice);
        const discountRate = parseFloat(value);
        if (!isNaN(salePrice) && !isNaN(discountRate)) {
          newData.discountAmount = ((salePrice * discountRate) / 100).toFixed(2);
        }
      } else if (name === 'salePrice' && value !== '') {
        if (newData.discountRate !== '') {
          const discountRate = parseFloat(newData.discountRate);
          const salePrice = parseFloat(value);
          if (!isNaN(discountRate) && !isNaN(salePrice)) {
            newData.discountAmount = ((salePrice * discountRate) / 100).toFixed(2);
          }
        } else if (newData.discountAmount !== '') {
          const discountAmount = parseFloat(newData.discountAmount);
          const salePrice = parseFloat(value);
          if (!isNaN(discountAmount) && !isNaN(salePrice) && salePrice > 0) {
            newData.discountRate = ((discountAmount / salePrice) * 100).toFixed(2);
          }
        }
      }

      return newData;
    });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prevData => ({
      ...prevData,
      productImage: file
    }));
    console.log("Selected file (not sending):", file ? file.name : 'None');
  };

  const handleDiscard = () => {
      setFormData(getInitialState());
      setError('');
      setSuccess('');
      console.log("Form discarded");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    console.log("Form Data Before Submission:", formData);


    const productData = {
      name: formData.title,
      barcode: formData.sku,
      description: formData.description,
      price: formData.salePrice !== '' ? parseFloat(formData.salePrice) : undefined,
      costPrice: formData.purchasePrice !== '' ? parseFloat(formData.purchasePrice) : undefined,
      quantity: formData.quantity !== '' ? parseInt(formData.quantity, 10) : undefined,
      category: formData.category,
      supplier: formData.supplier,
      taxRate: formData.gst !== '' ? parseFloat(formData.gst) : undefined,
      minStockLevel: formData.stockAlert !== '' ? parseInt(formData.stockAlert, 10) : undefined,
      discountRate: formData.discountRate !== '' ? parseFloat(formData.discountRate) : undefined
    };

    console.log("Data being sent to API:", productData);


    const requiredFrontendFields = ['title', 'sku', 'salePrice', 'category', 'supplier', 'quantity'];
    const missingFrontendFields = requiredFrontendFields.filter(field => !formData[field]);

    if (missingFrontendFields.length > 0) {
        setError(`Please fill in all required fields marked with *: ${missingFrontendFields.join(', ')}`);
        setIsLoading(false);
        return;
    }

     if (productData.price === undefined || isNaN(productData.price) || productData.price < 0) {
        setError('Sale Price must be a valid non-negative number.'); setIsLoading(false); return;
    }
     if (productData.quantity === undefined || isNaN(productData.quantity) || !Number.isInteger(productData.quantity) || productData.quantity < 0) {
        setError('Quantity must be a valid non-negative integer.'); setIsLoading(false); return;
    }
     if (productData.costPrice !== undefined && (isNaN(productData.costPrice) || productData.costPrice < 0)) {
        setError('Purchase Price must be a valid non-negative number.'); setIsLoading(false); return;
    }
    if (productData.taxRate !== undefined && (isNaN(productData.taxRate) || productData.taxRate < 0)) {
        setError('GST/Tax Rate must be a valid non-negative number.'); setIsLoading(false); return;
    }
    if (productData.minStockLevel !== undefined && (isNaN(productData.minStockLevel) || !Number.isInteger(productData.minStockLevel) || productData.minStockLevel < 0)) {
        setError('Stock Alert must be a valid non-negative integer.'); setIsLoading(false); return;
    }
    if (productData.discountRate !== undefined && (isNaN(productData.discountRate) || productData.discountRate < 0 || productData.discountRate > 100)) {
        setError('Discount Rate must be between 0 and 100.'); setIsLoading(false); return;
    }
    if (!isValidObjectId(productData.category)) {
        setError('Selected Category value is not a valid ID format.'); setIsLoading(false); return;
    }
     if (!isValidObjectId(productData.supplier)) {
        setError('Selected Supplier value is not a valid ID format.'); setIsLoading(false); return;
    }


    try {
      const apiUrl = '/api/products';
      console.log(`Sending POST request to: ${apiUrl}`);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const responseData = await response.json();

      if (response.ok) {
        setSuccess(`Product "${responseData.data?.name || productData.name}" created successfully!`);
        console.log('Product created:', responseData.data);
        setFormData(getInitialState());
      } else {
        const errorMsg = responseData.message || `Request failed with status: ${response.status}`;
        setError(`Failed to create product: ${errorMsg}`);
        console.error('API Error:', responseData);
      }
    } catch (err) {
      setError(`An error occurred: ${err.message}. Check network connection and console.`);
      console.error('Submit Error:', err);
    } finally {
      setIsLoading(false);
    }
  };


  const requiredStar = <span style={{ color: 'red' }}>*</span>;

  return (
    <Layout title="Create Product">
      <div>
        <Card>
          <Card.Header>Create New Product</Card.Header>
          <Card.Body>
            {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
            {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-grid">
                 <div className="form-group">
                  <label htmlFor="title">Title {requiredStar}</label>
                  <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} placeholder="Product Name" required />
                </div>
                 <div className="form-group">
                  <label htmlFor="sku">SKU / Barcode {requiredStar}</label>
                  <input type="text" id="sku" name="sku" value={formData.sku} onChange={handleChange} placeholder="Unique Barcode" required />
                </div>

                 <div className="form-group">
                  <label htmlFor="category">Category {requiredStar}</label>
                  <select id="category" name="category" value={formData.category} onChange={handleChange} required>
                    <option value="">Select Category</option>
                    <option value="67f65d2951c326c002d6f0ac">Casual Wear</option>
                    <option value="67f65d2951c326c002d6f0ad">Formal Wear</option>
                    <option value="67f65d2951c326c002d6f0ae">Sportswear</option>
                  </select>
                </div>

                 <div className="form-group">
                  <label htmlFor="supplier">Supplier {requiredStar}</label>
                  <select id="supplier" name="supplier" value={formData.supplier} onChange={handleChange} required>
                    <option value="">Select Supplier</option>
                    <option value="67f662e851c326c002d6f0b3">Best Supplies Co.</option>
                    <option value="67f662e851c326c002d6f0b4">Urban Styles Apparel</option>
                    <option value="67f662e851c326c002d6f0b5">Classic Tailors Ltd.</option>
                  </select>
                </div>

                <div className="form-group form-group-span-2">
                  <label htmlFor="description">Description</label>
                  <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Optional product details..."></textarea>
                </div>
                <div className="form-group form-group-span-2 image-uploader">
                  <label htmlFor="productImage">Product Image</label>
                  <input type="file" id="productImage" name="productImage" onChange={handleFileChange} accept="image/svg+xml, image/png, image/jpeg" />
                  <p><small>Image upload not functional in this fix.</small></p>
                  {formData.productImage && <p><small>Selected: {formData.productImage.name}</small></p>}
                </div>

                <div className="form-group">
                  <label htmlFor="salePrice">Sale Price {requiredStar}</label>
                  <input type="number" id="salePrice" name="salePrice" value={formData.salePrice} onChange={handleChange} placeholder="0.00" required min="0" step="0.01" />
                </div>
                <div className="form-group">
                  <label htmlFor="purchasePrice">Purchase Price (Cost)</label>
                  <input type="number" id="purchasePrice" name="purchasePrice" value={formData.purchasePrice} onChange={handleChange} placeholder="0.00" min="0" step="0.01" />
                </div>
                <div className="form-group">
                  <label htmlFor="discountRate">Discount Rate (%)</label>
                  <input type="number" id="discountRate" name="discountRate" value={formData.discountRate} onChange={handleChange} placeholder="0" min="0" max="100" step="0.01" />
                </div>
                <div className="form-group">
                  <label htmlFor="discountAmount">Discount Amount</label>
                  <input type="number" id="discountAmount" name="discountAmount" value={formData.discountAmount} onChange={handleChange} placeholder="0.00" min="0" step="0.01" />
                </div>
                 <div className="form-group">
                  <label htmlFor="quantity">Quantity {requiredStar}</label>
                  <input type="number" id="quantity" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="0" required min="0" step="1" />
                </div>
                <div className="form-group">
                  <label htmlFor="gst">Tax Rate (%)</label>
                  <input type="number" id="gst" name="gst" value={formData.gst} onChange={handleChange} placeholder="e.g., 0" min="0" step="0.01"/>
                </div>
                <div className="form-group">
                  <label htmlFor="stockAlert">Min. Stock Alert</label>
                  <input type="number" id="stockAlert" name="stockAlert" value={formData.stockAlert} onChange={handleChange} placeholder="e.g., 5" min="0" step="1"/>
                </div>

              </div>

              <div className="form-buttons">
                <button type="button" className="btn btn-discard" onClick={handleDiscard} disabled={isLoading}>Discard</button>
                <button type="submit" className="btn btn-submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save & Submit'}
                </button>
              </div>
            </form>
          </Card.Body>
        </Card>
      </div>
    </Layout>
  );
}

export default CreateProducts;


// --- File End: create_products.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\pages\create_user.js ---
// ============================================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/sidebar';
import { usersAPI } from '../services/api'; // Import usersAPI

// Inline CSS as a <style> block
const styles = `
  .layout {
    display: flex;
    min-height: 100vh;
    background-color: #f9f9f9;
  }

  .content {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
  }

  .auth-container {
    width: 100%;
    max-width: 500px;
    background: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .form-title {
    text-align: center;
    margin-bottom: 20px;
    font-size: 24px;
    font-weight: bold;
  }

  .form-grid {
    display: grid;
    gap: 15px;
  }

  .form-input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
  }

  .submit-button {
    padding: 10px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
  }

  .submit-button:hover {
    background-color: #218838;
  }

  .error-message {
    color: red;
    font-size: 12px;
  }
`;

const CreateUser = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    shiftTime: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate password
    if (formData.password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setPasswordError('');
    setLoading(true);
    setError('');

    try {
      // Call the create user API
      const response = await usersAPI.create(formData);
      if (response.data.success) {
        navigate('/all_users'); // Redirect to the users list after successful creation
      }
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Inject the CSS */}
      <style>{styles}</style>

      <div className="layout">
        {/* Sidebar Component */}
        <Sidebar />

        <div className="content">
          <div className="auth-container signup-page">
            <div className="form-card">
              <h2 className="form-title">Add New User</h2>
              <form onSubmit={handleSubmit} className="form-grid">
                <input
                  type="text"
                  name="name"
                  placeholder="Enter Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
                <input
                  type="text"
                  name="phone"
                  placeholder="Enter Phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="form-input"
                >
                  <option value="" disabled>
                    Select Role
                  </option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="staff">Staff</option>
                </select>
                <select
                  name="shiftTime"
                  value={formData.shiftTime}
                  onChange={handleChange}
                  required
                  className="form-input"
                >
                  <option value="" disabled>
                    Select Shift Time
                  </option>
                  <option value="morning">Morning</option>
                  <option value="evening">Evening</option>
                  <option value="night">Night</option>
                </select>
                <input
                  type="text"
                  name="username"
                  placeholder="Enter Username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Enter Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-Enter Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
                {passwordError && <div className="error-message">{passwordError}</div>}
                {error && <div className="error-message">{error}</div>}
                <button
                  type="submit"
                  disabled={loading}
                  className="submit-button"
                >
                  {loading ? 'Creating account...' : 'Submit'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateUser;

// --- File End: create_user.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\pages\inventory.js ---
// ============================================================================

import React from 'react';
import Layout from '../components/Layout';
import CustomCard from '../components/ui/CustomCard'; // Import the CustomCard component

const Inventory = () => {
  return (
    <Layout title="Inventory">
      <div className="container">
        <h1>Inventory PAGE</h1>
        <p>This is a simple HTML page.</p>

        {/* Add a single CustomCard example */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <CustomCard>
            <CustomCard.Header>Product 1</CustomCard.Header>
            <CustomCard.Body>
              <p>This is a description of Product 1.</p>
              <p>Price: $10.00</p>
            </CustomCard.Body>
            <CustomCard.Footer>Stock: 20</CustomCard.Footer>
          </CustomCard>
        </div>
      </div>
    </Layout>
  );
};

export default Inventory;

// --- File End: inventory.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\pages\main_dashboard.js ---
// ============================================================================

import React from "react";
import Layout from "../components/Layout";
import "../components/Dashboard.css";


const MainDashboard = () => {
  return (
    <Layout title="Dashboard">

        <main className="main-content p-6">
          {/* Stats Cards */}
          <section className="stats-cards grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Total Sales", value: "$06,850" },
              { label: "Total Purchase", value: "$12,850" },
              { label: "Total Products", value: "14,000" },
              { label: "Total Revenue", value: "$80" },
            ].map((stat, index) => (
              <article key={index} className="card stat-card p-4 bg-white shadow-md rounded-xl">
                <div className="stat-icon">[Icon]</div>
                <div className="stat-label text-sm font-medium text-gray-600">{stat.label}</div>
                <div className="stat-value text-lg font-bold">{stat.value}</div>
              </article>
            ))}
          </section>

          {/* Sales Report & Alerts */}
          <section className="content-row grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <article className="card sales-report bg-white shadow-md rounded-xl p-6 md:col-span-2">
              <div className="card-header flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Sales Report</h2>
                <select className="report-control border rounded px-2 py-1">
                  <option>Monthly</option>
                </select>
              </div>
              <div className="chart-placeholder text-center text-gray-400 py-10">
                [Bar Chart Area - Max height ~100px. June highest.]
              </div>
            </article>

            <aside className="card alerts-section bg-white shadow-md rounded-xl p-6">
              <div className="card-header mb-4">
                <h2 className="text-lg font-semibold">Alerts</h2>
              </div>
              <ul className="space-y-2 text-sm">
                <li><span className="alert-icon">[!]</span> Stock Alert! Green Shirt is low <span className="timestamp text-gray-400">1h ago</span></li>
                <li><span className="alert-icon">[!]</span> New order received #ORD004 <span className="timestamp text-gray-400">2h ago</span></li>
                <li><span className="alert-icon">[!]</span> Server maintenance scheduled <span className="timestamp text-gray-400">1d ago</span></li>
              </ul>
              <a href="#" className="view-all text-blue-500 mt-4 inline-block">View All</a>
            </aside>
          </section>

          {/* Top Selling Products Table */}
          <section className="card data-table-card bg-white shadow-md rounded-xl p-6 mt-6">
            <div className="card-header mb-4">
              <h2 className="text-lg font-semibold">Top Selling Product</h2>
            </div>
            <table className="data-table w-full text-sm">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>SKU</th>
                  <th>Total Sales</th>
                  <th>Revenue</th>
                  <th>Last Sold</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["1", "SKU001", "500", "$50,000", "29-Dec-2024"],
                  ["2", "SKU002", "400", "$40,000", "28-Dec-2024"],
                  ["3", "SKU003", "350", "$35,000", "27-Dec-2024"],
                  ["4", "SKU004", "400", "$40,000", "28-Dec-2024"],
                  ["5", "SKU005", "450", "$45,000", "29-Dec-2024"],
                ].map(([rank, sku, sales, revenue, sold], idx) => (
                  <tr key={idx}>
                    <td>{rank}</td><td>{sku}</td><td>{sales}</td><td>{revenue}</td><td>{sold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pagination flex gap-2 justify-end mt-4">
              <span className="cursor-pointer">&lt;</span>
              <span className="active font-bold">1</span>
              <span>2</span>
              <span>3</span>
              <span className="cursor-pointer">&gt;</span>
            </div>
          </section>

          {/* Bottom Tables */}
          <section className="content-row grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <article className="card data-table-card small-table bg-white shadow-md rounded-xl p-6">
              <div className="card-header mb-4">
                <h2 className="text-lg font-semibold">Products Out of Stock</h2>
              </div>
              <table className="data-table w-full text-sm">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Date Out</th>
                    <th>Restock Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Product 1</td><td>SKU001</td><td>01-Jan-2024</td><td>10-Jan-2024</td></tr>
                  <tr><td>Product 2</td><td>SKU002</td><td>03-Jan-2024</td><td>12-Jan-2024</td></tr>
                </tbody>
              </table>
            </article>

            <article className="card data-table-card small-table bg-white shadow-md rounded-xl p-6">
              <div className="card-header mb-4">
                <h2 className="text-lg font-semibold">Top Payments Received</h2>
              </div>
              <table className="data-table w-full text-sm">
                <thead>
                  <tr><th>Date</th><th>Order No</th><th>Customer</th><th>Amount</th></tr>
                </thead>
                <tbody>
                  <tr><td>01-Jan-2024</td><td>ORD001</td><td>James Wilson</td><td>$2,000</td></tr>
                  <tr><td>03-Jan-2024</td><td>ORD002</td><td>Jessica John</td><td>$1,800</td></tr>
                  <tr><td>05-Jan-2024</td><td>ORD003</td><td>Stella Harper</td><td>$950</td></tr>
                </tbody>
              </table>
            </article>
          </section>
        </main>
    </Layout>
  );
};

export default MainDashboard;





// --- File End: main_dashboard.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\pages\pos.js ---
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Container, Button, Card } from 'react-bootstrap';
import Layout from '../components/Layout';
import SearchBar from '../components/pos/searchbarpos.jsx';
import CartTable from '../components/pos/CartTable.js';
import BillTab from '../components/pos/BillTab.js';
import CreateBillButton from '../components/pos/CreateBillButton.js';
import SalesTable from '../components/pos/SalesTable.js';
import PayButton from '../components/pos/PayButton.js';
import { productsAPI, salesAPI } from '../services/api.js';
import useCart from '../hooks/useCart';

const Pos = () => {
  const [searchedProduct, setSearchedProduct] = useState(null); // item found from SearchBar
  const [billNumber, setBillNumber] = useState('Loading...'); // Default placeholder value

  const {
    cartItems,
    totalPayable,
    totalQuantity,
    addToCart,
    removeFromCart,
    updateQuantity,
    resetCart,
  } = useCart();

  useEffect(() => {
    const fetchLastBillNumber = async () => {
      try {
        const response = await salesAPI.getLastBillNumber();
        const lastBillNumber = response.data.lastBillNumber;

        if (lastBillNumber) {
          setBillNumber(lastBillNumber + 1);
        } else {
          setBillNumber(1); // Start from 1 if no sales exist
        }
      } catch (error) {
        console.error('Error fetching last bill number:', error);
        setBillNumber('Error');
      }
    };

    fetchLastBillNumber();
  }, []);

  const handleProductSearch = (product) => {
    setSearchedProduct(product);
  };

  // This effect will add the searched product to the cart when it changes
  useEffect(() => {
    if (searchedProduct) {
      addToCart(searchedProduct);
      setSearchedProduct(null);
    }
  }, [searchedProduct, addToCart]);

  const handleRemoveItem = (id) => {
    removeFromCart(id);
  };

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(id, newQuantity);
  };

  const handleBackClick = () => {
    window.history.back();
  };

  return (
    <Layout title="Point of Sale">
      <div className="app-container" style={{ display: 'flex', height: 'calc(100vh - 80px)' }}>
        {/* left section */}
        <div className="main-content" style={{ flex: '1', padding: '0', display: 'flex', flexDirection: 'column' }}>
        <div className="bill-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '1px solid #dee2e6',
          paddingBottom: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              onClick={handleBackClick}
            >
              Back
            </button>
            <span
              style={{
                fontWeight: 'bold',
                marginRight: '16px',
                fontSize: '18px'
              }}
            >
              Recent Bills:
            </span>
            {/* Conditionally render BillTab only when billNumber is ready */}
            {billNumber !== 'Loading...' && billNumber !== 'Error' ? (
              <BillTab billNumber={billNumber} />
            ) : (
              <div>Loading...</div>
            )}
          </div>

          <div>
            <CreateBillButton />
          </div>
        </div>

        <Container className="card-container" style={{ padding: '0', margin: '0', maxWidth: '100%' }}>
          <Card style={{ width: '100%', maxWidth: '1200px' }}>
            <Card.Body>
              <div>
                <SearchBar onProductSearch={handleProductSearch} />
              </div>
            </Card.Body>
          </Card>

          {/* main content ie Product details card */}
          <Card style={{ width: '100%', maxWidth: '1200px' }}>
            <Card.Header as="h5"> Products</Card.Header>
            <Card.Body>
              <CartTable
                cartItems={cartItems}
                handleQuantityChange={updateQuantity}
                handleRemoveItem={removeFromCart}
              />
            </Card.Body>

            <Card.Footer className="d-flex justify-content-between align-items-center">
              <Button variant="danger" onClick={resetCart}>
                Reset
              </Button>
              <div className="text-end">
                <div className="pay-value">
                  Total Payable: ${totalPayable.toFixed(2)}
                </div>
              </div>

              <PayButton
                cartItems={cartItems}
                totalPayable={totalPayable}
                totalQuantity={totalQuantity}
                billNumber={billNumber}
                updateBillNumber={setBillNumber}
              />
            </Card.Footer>
          </Card>
        </Container>
      </div>

      {/* right section */}
      <div className="sales-sidebar" style={{
        width: '400px',
        borderLeft: '1px solid #dee2e6',
        padding: '20px',
        backgroundColor: '#fff'
      }}>
        <Card>
          <Card.Header style={{ backgroundColor: '#f8f9fa', padding: '10px 15px' }}>Last Sales</Card.Header>
          <Card.Body style={{ padding: '0' }}>
            <SalesTable />
          </Card.Body>
        </Card>
      </div>
    </div>
    </Layout>
  );
};

export default Pos;

// --- File End: pos.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\pages\reports.js ---
// ============================================================================

import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import axios from 'axios';

const Reports = () => {
  const [categoryId, setCategoryId] = useState(null);
  const [supplierId, setSupplierId] = useState(null);

  const getError = (error) => {
    let e = error;
    if (error.response) {
      e = error.response.data;
      if (error.response.data && error.response.data.error) {
        e = error.response.data.error;
      }
    } else if (error.message) {
      e = error.message;
    } else {
      e = "Unknown error occurred";
    }
    return e;
  };

  // Function to fetch Category and Supplier IDs from backend
  const fetchCategoryAndSupplierIds = async () => {
    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        console.error('No token found. Please log in.');
        return;
      }

      // Fetch the category and supplier IDs from the backend
      const categoryResult = await axios.get('/api/categories?name=Casual Wear', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const supplierResult = await axios.get('/api/suppliers?name=Best Supplies Co.', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (categoryResult.data && supplierResult.data) {
        setCategoryId(categoryResult.data._id);
        setSupplierId(supplierResult.data._id);
      }
    } catch (err) {
      console.error('Error fetching category or supplier:', getError(err));
    }
  };

  useEffect(() => {
    fetchCategoryAndSupplierIds();
  }, []);

  // Sample product object that uses category and supplier IDs
  const createProduct = async () => {
    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        console.error('No token found. Please log in.');
        return;
      }

      // Wait for category and supplier IDs to be fetched before sending the request
      if (!categoryId || !supplierId) {
        console.log('Category or Supplier ID not available yet.');
        return;
      }

      const newProduct = {
        name: "Green Shirt",
        barcode: "1001",
        description: "Comfy Green shirt for everyday wear.",
        price: 249.99,
        quantity: 100,
        category: categoryId,  // Dynamically set category ID
        supplier: supplierId,  // Dynamically set supplier ID
      };

      const result = await axios.post('/api/products', newProduct, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Product created successfully:', result.data);
    } catch (err) {
      console.error('Error creating product:', getError(err));
    }
  };

  return (
    <Layout title="Reports">
      <div className="container">
        <h1>REPORTS PAGE</h1>
        <p>This is a simple HTML page.</p>

        <button onClick={createProduct}>
          Add Product
        </button>
      </div>
    </Layout>
  );
};

export default Reports;


// --- File End: reports.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\pages\sales-report.js ---
// ============================================================================

import React, { useState, useEffect } from "react";
import { FaSearch, FaFileExcel, FaFilePdf, FaCalendarAlt } from 'react-icons/fa';
import Layout from '../components/Layout';
import { salesAPI } from '../services/api';
import { SalesBarChart, PaymentMethodPieChart, SalesTrendLineChart } from '../components/SalesCharts';
import AISalesInsights from '../components/AISalesInsights';
import '../components/AISalesInsights.css';
import './sales.css'; // Reusing sales.css for styling

const SalesReport = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [salesStats, setSalesStats] = useState({
    overall: {
      totalSalesValue: 0,
      totalDiscountValue: 0,
      totalTaxValue: 0,
      averageSaleValue: 0,
      totalTransactions: 0
    },
    byPaymentMethod: []
  });

  // Fetch sales data
  useEffect(() => {
    fetchSales();
    fetchSalesStats();
  }, [startDate, endDate]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      // Add date filters if provided
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await salesAPI.getAll(params);

      if (response.data.success && Array.isArray(response.data.data)) {
        setSales(response.data.data);
      } else if (response.data.success && Array.isArray(response.data.sales)) {
        // if your server calls it "sales" instead of "data"
        setSales(response.data.sales);
      } else {
        // fallback to empty array
        console.warn('Unexpected sales shape, defaulting to []');
        setSales([]);
      }
    } catch (err) {
      setError('Failed to fetch sales data');
      console.error('Error fetching sales:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesStats = async () => {
    try {
      // Add date filters if provided
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await salesAPI.getStats(params);

      if (response.data.success) {
        setSalesStats(response.data);
      } else {
        console.warn('Failed to fetch sales stats');
      }
    } catch (err) {
      console.error('Error fetching sales stats:', err);
    }
  };

  const handleExcelExport = async () => {
    try {
      setLoading(true);

      // Add date filters if provided
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await salesAPI.exportSales('csv', params);

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales-report-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to export sales data');
      console.error('Error exporting sales:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePdfExport = async () => {
    try {
      setLoading(true);

      // Add date filters if provided
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await salesAPI.exportSales('pdf', params);

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales-report-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to export sales data');
      console.error('Error exporting sales:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter sales based on search term
  const filteredSales = sales.filter(sale =>
    (sale._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <Layout title="Sales Report">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {loading && (
        <div className="flex justify-center items-center p-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}
      <div className="sales-frame">
        <div className="sales-div-2">
          <div className="sales-div-3">
            <div className="sales-div-4">
              <div className="sales-text-2">Sales Report</div>

              {/* Date Filter Controls */}
              <div className="sales-controls-container">
                <div className="sales-date-filter">
                  <div className="sales-date-input-container">
                    <label htmlFor="start-date">Start Date:</label>
                    <div className="sales-date-input-wrapper">
                      <FaCalendarAlt className="sales-date-icon" />
                      <input
                        type="date"
                        id="start-date"
                        className="sales-date-input"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="sales-date-input-container">
                    <label htmlFor="end-date">End Date:</label>
                    <div className="sales-date-input-wrapper">
                      <FaCalendarAlt className="sales-date-icon" />
                      <input
                        type="date"
                        id="end-date"
                        className="sales-date-input"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="sales-search-container">
                  <FaSearch className="sales-search-icon" />
                  <input
                    type="text"
                    placeholder="Search by reference or customer"
                    className="sales-search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="sales-action-buttons">
                  <button
                    className="sales-export-button pdf-button"
                    onClick={handlePdfExport}
                    disabled={loading}
                  >
                    <FaFilePdf /> PDF
                  </button>
                  <button
                    className="sales-export-button excel-button"
                    onClick={handleExcelExport}
                    disabled={loading}
                  >
                    <FaFileExcel /> Excel
                  </button>
                </div>
              </div>

              {/* Sales Statistics */}
              <div className="sales-stats-container">
                <div className="sales-stats-card">
                  <h3>Total Sales</h3>
                  <p>${salesStats.overall.totalSalesValue.toFixed(2)}</p>
                </div>
                <div className="sales-stats-card">
                  <h3>Total Transactions</h3>
                  <p>{salesStats.overall.totalTransactions}</p>
                </div>
                <div className="sales-stats-card">
                  <h3>Average Sale</h3>
                  <p>${salesStats.overall.averageSaleValue.toFixed(2)}</p>
                </div>
                <div className="sales-stats-card">
                  <h3>Total Discount</h3>
                  <p>${salesStats.overall.totalDiscountValue.toFixed(2)}</p>
                </div>
              </div>

              {/* Payment Method Stats */}
              <div className="payment-method-stats">
                <h3>Sales by Payment Method</h3>
                <div className="payment-method-cards">
                  {salesStats.byPaymentMethod.map((method, index) => (
                    <div className="payment-method-card" key={index}>
                      <h4>{method._id.charAt(0).toUpperCase() + method._id.slice(1)}</h4>
                      <p>Count: {method.count}</p>
                      <p>Total: ${method.totalValue.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Charts Section */}
              <div className="sales-charts-container">
                <div className="chart-card">
                  <SalesBarChart sales={filteredSales} />
                </div>
                <div className="chart-card">
                  <PaymentMethodPieChart paymentMethodStats={salesStats.byPaymentMethod} />
                </div>
              </div>

              <div className="sales-charts-container">
                <div className="chart-card">
                  <SalesTrendLineChart sales={filteredSales} />
                </div>
              </div>

              {/* AI Sales Insights */}
              <AISalesInsights sales={filteredSales} salesStats={salesStats} />
            </div>

            <div className="sales-div-6">
              <div className="sales-div-7">
                <table className="sales-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Reference</th>
                      <th>Added by</th>
                      <th>Customer</th>
                      <th>Grand Total</th>
                      <th>Paid</th>
                      <th>Due</th>
                      <th>Payment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.map((sale, index) => (
                      <tr key={index}>
                        <td>{formatDate(sale.createdAt)}</td>
                        <td>{sale._id}</td>
                        <td>{sale.createdBy?.name || sale.createdBy?.username || 'N/A'}</td>
                        <td>{sale.customer.name}</td>
                        <td>${sale.total.toFixed(2)}</td>
                        <td>${sale.amountPaid.toFixed(2)}</td>
                        <td>${Math.max(0, sale.total - sale.amountPaid).toFixed(2)}</td>
                        <td><span className={`sales-status-badge ${sale.paymentStatus.toLowerCase()}`}>{sale.paymentStatus}</span></td>
                      </tr>
                    ))}
                    {filteredSales.length === 0 && (
                      <tr>
                        <td colSpan="8" className="text-center">No sales found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SalesReport;


// --- File End: sales-report.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\pages\sales.js ---
// ============================================================================

import React, { useState, useEffect } from "react";
import { FaSearch, FaFilter, FaFileExcel, FaFilePdf } from 'react-icons/fa';
import Layout from '../components/Layout';
import { salesAPI } from '../services/api';
import './sales.css';

export const Frame = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch sales data
  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/login';
          return;
        }

        const response = await salesAPI.getAll();
        console.log('sales payload:', response.data);

        if (response.data.success && Array.isArray(response.data.data)) {
          setSales(response.data.data);
        } else if (response.data.success && Array.isArray(response.data.sales)) {
          // if your server calls it "sales" instead of "data"
          setSales(response.data.sales);
        } else {
          // fallback to empty array
          console.warn('Unexpected sales shape, defaulting to []');
          setSales([]);
        }
        setError(null);
      } catch (error) {
        console.error('Error fetching sales:', error);
        setSales([]);      // ensure state stays an array
        setError('Failed to load sales data');
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  // Handle PDF export
  const handlePdfExport = async () => {
    try {
      setLoading(true);
      const response = await salesAPI.exportSales('pdf');

      // Create a blob URL and open it in a new tab
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      // Open in a new tab
      window.open(url, '_blank');

      // Clean up the URL object after opening
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);

      setError(null);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setError('Failed to export PDF');
    } finally {
      setLoading(false);
    }
  };

  // Handle Excel export
  const handleExcelExport = async () => {
    try {
      setLoading(true);
      const response = await salesAPI.exportSales('csv');

      // Create a blob URL and trigger download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sales.csv');
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);

      setError(null);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      setError('Failed to export CSV');
    } finally {
      setLoading(false);
    }
  };

  // Filter sales based on reference number
  const filteredSales = sales.filter(sale =>
    sale._id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout title="All Sales">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {loading && (
        <div className="flex justify-center items-center p-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}
      <div className="sales-frame">
        <div className="sales-div-2">
          <div className="sales-div-3">
            <div className="sales-div-4">
              <div className="sales-text-2">All Sales</div>
              <div className="sales-controls-container">
                <div className="sales-search-container">
                  <FaSearch className="sales-search-icon" />
                  <input
                    type="text"
                    placeholder="Search this table"
                    className="sales-search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="sales-action-buttons">
                  <button className="sales-filter-button">
                    <FaFilter /> Filter
                  </button>
                  <button
                    className="sales-export-button pdf-button"
                    onClick={handlePdfExport}
                    disabled={loading}
                  >
                    <FaFilePdf /> PDF
                  </button>
                  <button
                    className="sales-export-button excel-button"
                    onClick={handleExcelExport}
                    disabled={loading}
                  >
                    <FaFileExcel /> Excel
                  </button>
                  <button className="sales-create-button">
                    Create New Sale
                  </button>
                </div>
              </div>
            </div>

            <div className="sales-div-6">
              <div className="sales-div-7">
                <table className="sales-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Reference</th>
                      <th>Added by</th>
                      <th>Customer</th>
                      <th>Grand Total</th>
                      <th>Paid</th>
                      <th>Due</th>
                      <th>Payment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.map((sale, index) => (
                      <tr key={index}>
                        <td>{sale.createdAt}</td>
                        <td>{sale._id}</td>
                        <td>{sale.createdBy?.name}</td>
                        <td>{sale.customer.name}</td>
                        <td>{sale.total}</td>
                        <td>{sale.amountPaid}</td>
                        <td>{sale.change}</td>
                        <td><span className={`sales-status-badge ${sale.paymentStatus.toLowerCase()}`}>{sale.paymentStatus}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="sales-pagination-container">
                  <div className="sales-pagination-controls">
                    <button className="sales-pagination-button">Previous</button>
                    <button className="sales-pagination-button">Next</button>
                  </div>
                  <span className="sales-page-info">Page 1 of 10</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};


// --- File End: sales.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\pages\supplier.js ---
// ============================================================================

import React, { useState, useEffect} from "react";
import { FaEdit, FaTrash, FaSearch, FaPlus, FaTimes } from 'react-icons/fa';
import Layout from '../components/Layout';
import './supplier.css';

export const Frame = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplierName, setSupplierName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSupplierId, setEditingSupplierId] = useState(null);


  // Sample data - replace with your actual data source
// Fetch suppliers from the backend
useEffect(() => {
  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Not logged in → force login
        window.location.href = '/login';
        return;
      }

      const response = await fetch('/api/suppliers', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      // you might also want:
      // if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (data.success) {
        setSuppliers(data.data);
      } else {
        console.warn('Suppliers fetch failed:', data.message);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  fetchSuppliers();
}, []); // empty deps → run once on mount

const handleEdit = (supplier) => {
  setSupplierName(supplier.name);
  setContactNumber(supplier.phone);
  setAddress(supplier.address);
  setEditingSupplierId(supplier._id);
  setIsEditMode(true);
  setIsModalOpen(true);
};

const handleDelete = async (id) => {
  const confirm = window.confirm("Are you sure you want to delete this supplier?");
  if (!confirm) return;

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/suppliers/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.success) {
      setSuppliers(prev => prev.filter(s => s._id !== id));
    } else {
      alert(data.message || 'Error deleting supplier');
    }
  } catch (error) {
    console.error('Delete supplier error:', error);
  }
};


const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const token = localStorage.getItem('token');
    const url = isEditMode ? `/api/suppliers/${editingSupplierId}` : '/api/suppliers';
    const method = isEditMode ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: supplierName,
        phone: contactNumber,
        address
      })
    });

    const data = await response.json();

    if (data.success) {
      if (isEditMode) {
        setSuppliers(prev =>
          prev.map(s => (s._id === editingSupplierId ? data.data : s))
        );
      } else {
        setSuppliers(prev => [...prev, data.data]);
      }
      setIsModalOpen(false);
      setSupplierName('');
      setContactNumber('');
      setAddress('');
      setIsEditMode(false);
      setEditingSupplierId(null);
    } else {
      alert(data.message || 'Error saving supplier');
    }
  } catch (error) {
    console.error('Save supplier error:', error);
  }
};



  // Filter suppliers based on search term
  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout title="Suppliers">
      <div className="supplier-frame">
        <div className="supplier-div-2">
          <div className="supplier-div-3">
            <div className="supplier-div-4">
              <div className="supplier-text-2">Supplier</div>
              <div className="supplier-search-container">
                <FaSearch className="supplier-search-icon" />
                <input
                  type="text"
                  placeholder="Search this table"
                  className="supplier-search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="supplier-div-6">
              <div className="supplier-div-7">
                <table className="supplier-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Contact</th>
                      <th>Location</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSuppliers.map((supplier) => (
                      <tr key={supplier.id}>
                        <td>{supplier._id}</td>
                        <td>{supplier.name}</td>
                        <td>{supplier.phone}</td>
                        <td>{supplier.address}</td>
                        <td>
                          <div className="supplier-action-buttons">
                            <button className="supplier-action-button"
                            onClick={() => handleEdit(supplier)}>
                              <FaEdit />
                            </button>
                            <button className="supplier-action-button"
                            onClick={() => handleDelete(supplier._id)}>
                              <FaTrash />
                            </button>
                    </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="supplier-pagination-container">
                  <div className="supplier-pagination-controls">
                    <button className="supplier-pagination-button">Previous</button>
                    <button className="supplier-pagination-button">Next</button>
                  </div>
                  <span className="supplier-page-info">Page 1 of 10</span>
                </div>
              </div>
            </div>
          </div>

          <div className="supplier-action-buttons-container">
            <button
              className="supplier-action-button primary"
              onClick={() => setIsModalOpen(true)}
            >
              <FaPlus /> Add New Supplier
            </button>
                </div>
              </div>
            </div>

      {isModalOpen && (
        <div className="supplier-modal-overlay">
          <div className="supplier-modal">
            <button
              className="supplier-modal-close"
              onClick={() => setIsModalOpen(false)}
            >
              <FaTimes />
            </button>
            <h2 className="supplier-modal-title">Add Supplier</h2>
            <form className="supplier-modal-form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Supplier Name"
                className="supplier-modal-input"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Contact Number"
                className="supplier-modal-input"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Address"
                className="supplier-modal-input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
              <button type="submit" className="supplier-modal-submit">
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};


// --- File End: supplier.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\reportWebVitals.js ---
// ============================================================================

const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;


// --- File End: reportWebVitals.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\services\api.js ---
// ============================================================================

import axios from 'axios';

// Create an Axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5002/api', // Updated port to 5002
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration or unauthorized access
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Token expired or invalid, or insufficient permissions
      console.warn(`Auth Error (${error.response.status}): Redirecting to login.`);
      localStorage.removeItem('token'); // Clear invalid token
      // Prevent redirect loops if already on login page
      if (window.location.pathname !== '/login') {
         window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/login', credentials),
  // signup: (userData) => api.post('/signup', userData), // *** Removed public signup ***
  getProfile: () => api.get('/users/profile'), // Corrected path based on routes
  adminCreateUser: (userData) => api.post('/users', userData), // *** Added: Admin create user ***
};

// Users API Group *** ADDED/MODIFIED ***
export const usersAPI = {
  getAll: () => api.get('/users'),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  create: (userData) => api.post('/users', userData), // Call adminCreateUser endpoint
  delete: (id) => api.delete(`/users/${id}`), // Add delete method
  exportUsers: (format = 'csv') => api.get(`/users/export?format=${format}`, {
    responseType: 'blob', // Important for handling file download
  }),
};

// Products API
export const productsAPI = {
  getAll: (params = {}) => api.get('/products', { params }), // Allow passing query params
  getById: (id) => api.get(`/products/${id}`),
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
  search: (query) => api.get('/products/search', { params: { query } }),
  getLowStock: () => api.get('/products/low-stock'),
  updateStock: (id, stockData) => api.patch(`/products/${id}/stock`, stockData),
};

// Categories API *** ADDED ***
export const categoriesAPI = {
    getAll: () => api.get('/categories'),
    getById: (id) => api.get(`/categories/${id}`),
    create: (categoryData) => api.post('/categories', categoryData),
    update: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
    delete: (id) => api.delete(`/categories/${id}`),
};

// Suppliers API *** ADDED ***
export const suppliersAPI = {
    getAll: () => api.get('/suppliers'),
    getById: (id) => api.get(`/suppliers/${id}`),
    create: (supplierData) => api.post('/suppliers', supplierData),
    update: (id, supplierData) => api.put(`/suppliers/${id}`, supplierData),
    delete: (id) => api.delete(`/suppliers/${id}`),
};


// Inventory API (Note: May overlap with product stock updates, clarify usage)
export const inventoryAPI = {
  // Assuming '/inventory' might provide a summary or specific inventory view
  // If it's just product stock, use productsAPI.updateStock
  // getAll: () => api.get('/inventory'),
  // updateStock: (id, quantity) => api.put(`/inventory/${id}`, { quantity }), // Likely handled by product patch

  // i think this is just more just product stock, i dont think we are doing another inventory schema - Walid
};

// Sales API
export const salesAPI = {
  getAll: (params = {}) => api.get('/sales', { params }), // Allow passing query params
  create: (saleData) => api.post('/sales', saleData),
  getById: (id) => api.get(`/sales/${id}`),
  updatePayment: (id, paymentData) => api.put(`/sales/${id}/payment`, paymentData),
  getStats: (params = {}) => api.get('/sales/stats', { params }), // Allow date range params
  // *** ADDED BACK from user's version, required by pos.js ***
  getLastBillNumber: () => api.get('/sales/last-bill-number'),
  // Export sales to CSV or PDF
  exportSales: (format = 'csv', params = {}) => api.get(`/sales/export`, {
    params: { format, ...params },
    responseType: 'blob', // Important for handling file download
  }),
};

// Purchases API *** ADDED ***
export const purchasesAPI = {
    getAll: (params = {}) => api.get('/purchases', { params }),
    create: (purchaseData) => api.post('/purchases', purchaseData),
    getById: (id) => api.get(`/purchases/${id}`),
    exportPurchases: (format = 'csv') => api.get(`/purchases/export?format=${format}`, {
        responseType: 'blob', // Important for file download
    }),
     // Add update/delete if needed
    // update: (id, purchaseData) => api.put(`/purchases/${id}`, purchaseData),
    // delete: (id) => api.delete(`/purchases/${id}`),
};


// Dashboard API
export const dashboardAPI = {
  // getSummary: () => api.get('/dashboard/summary'),
};

export default api; // Export the configured instance


// --- File End: api.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\services\brandsService.js ---
// ============================================================================

import api from './api';

// Brands API service
export const brandsAPI = {
    getAll: () => api.get('/brands'),
    getById: (id) => api.get(`/brands/${id}`),
    create: (brandData) => api.post('/brands', brandData),
    update: (id, brandData) => api.put(`/brands/${id}`, brandData),
    delete: (id) => api.delete(`/brands/${id}`),
};

export default brandsAPI;


// --- File End: brandsService.js ---


// ============================================================================
// --- File Start: D:\Shop-Management-System-main_NEW\frontend\src\setupTests.js ---
// ============================================================================

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';


// --- File End: setupTests.js ---
