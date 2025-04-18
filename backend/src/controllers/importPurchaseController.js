const ImportPurchase = require('../models/ImportPurchase');

exports.createImportPurchase = async (req, res) => {
  try {
    const { supplier, items, totalAmount, notes } = req.body;
    const createdBy = req.user._id;

    const newImport = new ImportPurchase({
      supplier,
      items,
      totalAmount,
      notes,
      createdBy
    });

    await newImport.save();
    res.status(201).json({ message: 'Import purchase created successfully', import: newImport });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create import purchase', error: error.message });
  }
};

exports.getAllImportPurchases = async (req, res) => {
  try {
    const imports = await ImportPurchase.find()
      .populate('supplier')
      .populate('items.product')
      .populate('createdBy');
    res.status(200).json(imports);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch import purchases', error: error.message });
  }
};
