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