const mongoose = require('mongoose');

const settingsSchema = mongoose.Schema(
  {
    // Company Information (General Settings)
    companyName: {
      type: String,
      required: true,
      default: 'My Shop'
    },
    companyLogo: {
      type: String,
      default: ''
    },
    contactEmail: {
      type: String,
      default: ''
    },
    supportPhone: {
      type: String,
      default: ''
    },
    
    // Financial Settings (General Settings)
    defaultTaxRate: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 100
    },
    defaultDiscount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 100
    },
    currencyCode: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'PKR', 'INR']
    },
    invoicePrefix: {
      type: String,
      default: 'INV-'
    },
    fiscalYearStart: {
      type: String,
      default: '01-01', // January 1st
    },
    fiscalYearEnd: {
      type: String,
      default: '12-31', // December 31st
    },
    
    // Inventory Settings (General Settings)
    inventoryAlertThreshold: {
      type: Number,
      default: 10
    },
    pricingStrategy: {
      type: String,
      enum: ['fixed', 'tiered', 'dynamic', 'custom'],
      default: 'fixed'
    },
    
    // Payment Settings (General Settings)
    enableOnlinePayments: {
      type: Boolean,
      default: false
    },
    paymentMethods: {
      type: [String],
      default: ['cash', 'card'],
      enum: ['cash', 'card', 'online', 'bank', 'check', 'mobile']
    },
    enableDiscounts: {
      type: Boolean,
      default: true
    },
    
    // Display Settings
    dateFormat: {
      type: String,
      required: true,
      default: 'MM/DD/YYYY',
      enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'DD.MM.YYYY', 'YYYY/MM/DD']
    },
    timeFormat: {
      type: String,
      required: true,
      default: '12h',
      enum: ['12h', '24h', '12hour', '24hour']
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    currencyPosition: {
      type: String,
      enum: ['before', 'after'],
      default: 'before'
    },
    decimalSeparator: {
      type: String,
      enum: ['.', ','],
      default: '.'
    },
    thousandsSeparator: {
      type: String,
      enum: [',', '.', ' ', ''],
      default: ','
    },
    decimalPlaces: {
      type: Number,
      min: 0,
      max: 4,
      default: 2
    },
    language: {
      type: String,
      enum: ['en', 'es', 'fr', 'de', 'zh', 'ar', 'ur'],
      default: 'en'
    },
    tableRowsPerPage: {
      type: Number,
      default: 10
    },
    enableDarkMode: {
      type: Boolean,
      default: false
    },
    colorScheme: {
      type: String,
      enum: ['blue', 'green', 'purple', 'orange', 'red', 'teal', 'indigo'],
      default: 'blue'
    },
    showGridLines: {
      type: Boolean,
      default: true
    },
    fontScale: {
      type: Number,
      min: 0.8,
      max: 1.3,
      default: 1.0
    },
    
    // Receipt & Invoice Settings
    receiptFooter: {
      type: String,
      default: 'Thank you for your business!'
    },
    invoiceNotes: {
      type: String,
      default: ''
    },
    
    // Legacy fields
    logoUrl: {
      type: String,
      default: ''
    },
    defaultOrderType: {
      type: String,
      enum: ['walk_in', 'phone_delivery', 'website_order'],
      default: 'walk_in'
    }
  },
  {
    timestamps: true
  }
);

// Create singleton pattern to ensure only one settings document exists
settingsSchema.statics.getSingleton = async function() {
  const settings = await this.findOne();
  if (settings) {
    return settings;
  }
  
  return this.create({});
};

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings; 