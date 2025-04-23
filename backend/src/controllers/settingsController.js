const asyncHandler = require('express-async-handler');
const Settings = require('../models/settings');
const User = require('../models/user');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// @desc    Get all settings
// @route   GET /api/settings
// @access  Public
const getSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton();
  res.status(200).json(settings);
});

// @desc    Update settings
// @route   PUT /api/settings
// @access  Admin
const updateSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton();
  
  // Destructure all possible settings fields
  const {
    // Legacy fields
    companyName,
    defaultTaxRate,
    defaultDiscount,
    dateFormat,
    timeFormat,
    defaultOrderType,
    logoUrl,
    
    // Company Information (General Settings)
    companyLogo,
    contactEmail,
    supportPhone,
    
    // Financial Settings
    currencyCode,
    invoicePrefix,
    fiscalYearStart,
    fiscalYearEnd,
    
    // Inventory Settings
    inventoryAlertThreshold,
    pricingStrategy,
    
    // Payment Settings
    enableOnlinePayments,
    paymentMethods,
    enableDiscounts,
    
    // Display Settings
    timezone,
    currencyPosition,
    decimalSeparator,
    thousandsSeparator,
    decimalPlaces,
    language,
    tableRowsPerPage,
    enableDarkMode,
    colorScheme,
    showGridLines,
    fontScale,
    
    // Receipt & Invoice Settings
    receiptFooter,
    invoiceNotes
  } = req.body;
  
  // Legacy and basic fields
  if (companyName !== undefined) settings.companyName = companyName;
  if (defaultTaxRate !== undefined) settings.defaultTaxRate = defaultTaxRate;
  if (defaultDiscount !== undefined) settings.defaultDiscount = defaultDiscount;
  if (dateFormat !== undefined) settings.dateFormat = dateFormat;
  if (timeFormat !== undefined) settings.timeFormat = timeFormat;
  if (defaultOrderType !== undefined) settings.defaultOrderType = defaultOrderType;
  
  // Support both logoUrl (legacy) and companyLogo (new)
  if (logoUrl !== undefined) settings.logoUrl = logoUrl;
  if (companyLogo !== undefined) settings.companyLogo = companyLogo;
  
  // Company Information
  if (contactEmail !== undefined) settings.contactEmail = contactEmail;
  if (supportPhone !== undefined) settings.supportPhone = supportPhone;
  
  // Financial Settings
  if (currencyCode !== undefined) settings.currencyCode = currencyCode;
  if (invoicePrefix !== undefined) settings.invoicePrefix = invoicePrefix;
  if (fiscalYearStart !== undefined) settings.fiscalYearStart = fiscalYearStart;
  if (fiscalYearEnd !== undefined) settings.fiscalYearEnd = fiscalYearEnd;
  
  // Inventory Settings
  if (inventoryAlertThreshold !== undefined) settings.inventoryAlertThreshold = inventoryAlertThreshold;
  if (pricingStrategy !== undefined) settings.pricingStrategy = pricingStrategy;
  
  // Payment Settings
  if (enableOnlinePayments !== undefined) settings.enableOnlinePayments = enableOnlinePayments;
  if (paymentMethods !== undefined) settings.paymentMethods = paymentMethods;
  if (enableDiscounts !== undefined) settings.enableDiscounts = enableDiscounts;
  
  // Display Settings
  if (timezone !== undefined) settings.timezone = timezone;
  if (currencyPosition !== undefined) settings.currencyPosition = currencyPosition;
  if (decimalSeparator !== undefined) settings.decimalSeparator = decimalSeparator;
  if (thousandsSeparator !== undefined) settings.thousandsSeparator = thousandsSeparator;
  if (decimalPlaces !== undefined) settings.decimalPlaces = decimalPlaces;
  if (language !== undefined) settings.language = language;
  if (tableRowsPerPage !== undefined) settings.tableRowsPerPage = tableRowsPerPage;
  if (enableDarkMode !== undefined) settings.enableDarkMode = enableDarkMode;
  if (colorScheme !== undefined) settings.colorScheme = colorScheme;
  if (showGridLines !== undefined) settings.showGridLines = showGridLines;
  if (fontScale !== undefined) settings.fontScale = fontScale;
  
  // Receipt & Invoice Settings
  if (receiptFooter !== undefined) settings.receiptFooter = receiptFooter;
  if (invoiceNotes !== undefined) settings.invoiceNotes = invoiceNotes;
  
  const updatedSettings = await settings.save();
  res.status(200).json(updatedSettings);
});

// @desc    Upload logo
// @route   POST /api/settings/logo
// @access  Admin
const uploadLogo = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a file');
  }
  
  const settings = await Settings.getSingleton();
  
  // Delete old logo if it exists (check both fields)
  try {
    // Check logoUrl (legacy)
    if (settings.logoUrl && settings.logoUrl !== '') {
      const oldLogoPath = path.join(__dirname, '../../', settings.logoUrl);
      if (fs.existsSync(oldLogoPath)) {
        fs.unlinkSync(oldLogoPath);
      }
    }
    
    // Check companyLogo (new)
    if (settings.companyLogo && settings.companyLogo !== '' && 
        settings.companyLogo !== settings.logoUrl) {
      const oldLogoPath = path.join(__dirname, '../../', settings.companyLogo);
      if (fs.existsSync(oldLogoPath)) {
        fs.unlinkSync(oldLogoPath);
      }
    }
  } catch (error) {
    console.error('Error deleting old logo:', error);
  }
  
  // Save path relative to backend root
  const logoPath = `/uploads/logos/${req.file.filename}`;
  
  // Update both fields for compatibility
  settings.logoUrl = logoPath;
  settings.companyLogo = logoPath;
  
  await settings.save();
  
  res.status(200).json({
    message: 'Logo uploaded successfully',
    logoUrl: logoPath,
    companyLogo: logoPath
  });
});

// @desc    Change password
// @route   POST /api/settings/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide current and new password');
  }
  
  const user = await User.findById(req.user._id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  // Check if current password matches
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  
  if (!isMatch) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }
  
  // Hash new password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  
  await user.save();
  
  res.status(200).json({ message: 'Password updated successfully' });
});

module.exports = {
  getSettings,
  updateSettings,
  uploadLogo,
  changePassword
}; 