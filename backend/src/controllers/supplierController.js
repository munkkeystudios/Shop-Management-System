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