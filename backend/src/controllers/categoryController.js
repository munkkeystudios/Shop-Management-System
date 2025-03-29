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