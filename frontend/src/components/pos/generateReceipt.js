import { jsPDF } from "jspdf";
import "jspdf-autotable";
import axios from "axios";

export const generateReceipt = async (transactionData) => {
  try {
    const {
      billNumber = 0,
      customerName = 'Walk in Customer',
      warehouse = 'Main Warehouse',
      items = [],
      subtotal = 0,
      discount = 0,
      tax = 0,
      total = 0,
      paymentMethod = 'Cash Payment',
      received = 0,
      returned = 0,
      paymentStatus = 'paid',
      date = new Date(),
      loanNumber = null,
    } = transactionData;

    if (!Array.isArray(items) || items.length === 0) {
      console.error("No items provided for receipt or invalid items array");
    }

    // Format date
    const formattedDate = date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [80, 200],
    });
    
    doc.setFont("helvetica");
    
    // Default company info
    let companyName = "Shop Management System";
    let logoUrl = null;
    
    // First try to get settings from API
    try {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5002';
      const response = await axios.get(`${baseUrl}/api/settings`);

      if (response.data) {
        const settings = response.data;
        companyName = settings.companyName || companyName;
        logoUrl = settings.logoUrl || settings.companyLogo || logoUrl;

        // If the logo is a relative path, prepend the API base URL
        if (logoUrl && !logoUrl.startsWith('http') && !logoUrl.startsWith('data:')) {
          logoUrl = `${baseUrl}${logoUrl}`;
        }
        
        console.log("Retrieved company settings from API:", { companyName, logoUrl });
      }
    } catch (error) {
      console.error("Error fetching company settings from API:", error);
      
      // Fallback to localStorage if API call fails
      try {
        const settingsData = localStorage.getItem('appSettings');
        if (settingsData) {
          const parsedSettings = JSON.parse(settingsData);
          companyName = parsedSettings.companyName || companyName;
          logoUrl = parsedSettings.companyLogo || parsedSettings.logoUrl || logoUrl;
          
          console.log("Retrieved company settings from localStorage:", { companyName, logoUrl });
        }
      } catch (localStorageError) {
        console.error("Error retrieving settings from localStorage:", localStorageError);
      }
    }
    
    // Start Y position
    let yPos = 10;
    const margin = 5;
    const pageWidth = doc.internal.pageSize.width;
    
    // Add logo if available
    if (logoUrl) {
      try {
        const logoWidth = 30;
        const logoHeight = 15;
        const logoX = (pageWidth - logoWidth) / 2;
        
        doc.addImage(logoUrl, 'JPEG', logoX, yPos, logoWidth, logoHeight);
        yPos += 20;
        
        console.log("Logo added successfully to receipt");
      } catch (error) {
        console.error("Error adding logo to receipt:", error);
        yPos = 10;
      }
    }
    
    // Add company name
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(companyName, pageWidth / 2, yPos, { align: "center" });
    yPos += 7;
    
    // Add receipt info
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Receipt #: " + billNumber, pageWidth / 2, yPos, { align: "center" });
    yPos += 5;
    
    doc.text(formattedDate, pageWidth / 2, yPos, { align: "center" });
    yPos += 5;
    
    // Add divider line
    doc.setDrawColor(0);
    doc.setLineWidth(0.1);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 5;
    
    // Customer details
    doc.setFontSize(8);
    doc.text("Customer: " + customerName, margin, yPos);
    yPos += 4;
    doc.text("Warehouse: " + warehouse, margin, yPos);
    yPos += 5;
    
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 5;

    // Items table header
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Item", margin, yPos);
    doc.text("Qty", pageWidth - 45, yPos, { align: "right" });
    doc.text("Price", pageWidth - 25, yPos, { align: "right" });
    doc.text("Total", pageWidth - 5, yPos, { align: "right" });
    yPos += 4;

    doc.setLineWidth(0.1);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 5;

    // List items
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    
    if (Array.isArray(items) && items.length > 0) {
      items.forEach((item) => {
        if (!item) return;
        
        const itemName = item.name || "Unknown Item";
        const quantity = item.quantity || 0;
        const price = item.price || 0;
        const amount = item.amount || (quantity * price) || 0;

        let displayName = itemName;
        if (displayName.length > 15) {
          displayName = displayName.substring(0, 12) + "...";
        }
        
        doc.text(displayName, margin, yPos);
        doc.text(`${quantity}x`, pageWidth - 45, yPos, { align: "right" });
        doc.text(`$${price.toFixed(2)}`, pageWidth - 25, yPos, { align: "right" });
        doc.text(`$${amount.toFixed(2)}`, pageWidth - 5, yPos, { align: "right" });
        yPos += 6;
      });
    } else {
      doc.text("No items in receipt", margin, yPos);
      yPos += 6;
    }

    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;
    
    // Summary section
    doc.setFontSize(8);
    
    doc.text("Subtotal:", margin, yPos);
    doc.text(`$${subtotal.toFixed(2)}`, pageWidth - margin, yPos, { align: "right" });
    yPos += 5;
    
    doc.text("Discount:", margin, yPos);
    doc.text(`$${discount.toFixed(2)}`, pageWidth - margin, yPos, { align: "right" });
    yPos += 5;
    
    doc.text("Tax:", margin, yPos);
    doc.text(`$${tax.toFixed(2)}`, pageWidth - margin, yPos, { align: "right" });
    yPos += 5;
    
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 5;
    
    // Total
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Total:", margin, yPos);
    doc.text(`$${total.toFixed(2)}`, pageWidth - margin, yPos, { align: "right" });
    yPos += 8;
    
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;
    
    // Payment details
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Payment Details", margin, yPos);
    yPos += 5;
    
    doc.setFontSize(8);
    doc.text("Method:", margin, yPos);
    doc.text(paymentMethod, pageWidth - margin, yPos, { align: "right" });
    yPos += 5;
    
    doc.text("Status:", margin, yPos);
    doc.text(paymentStatus.toUpperCase(), pageWidth - margin, yPos, { align: "right" });
    yPos += 5;
    
    // Payment method specific details
    if (paymentMethod === 'Cash Payment') {
      doc.text("Amount Received:", margin, yPos);
      doc.text(`$${received.toFixed(2)}`, pageWidth - margin, yPos, { align: "right" });
      yPos += 5;
      
      doc.text("Change:", margin, yPos);
      doc.text(`$${returned.toFixed(2)}`, pageWidth - margin, yPos, { align: "right" });
      yPos += 5;
    } 
    else if (paymentMethod === 'Card/Debit Payment') {
      doc.text("Amount Charged:", margin, yPos);
      doc.text(`$${total.toFixed(2)}`, pageWidth - margin, yPos, { align: "right" });
      yPos += 5;
    } 
    else if (paymentMethod === 'Loan Payment') {
      if (loanNumber) {
        doc.text("Loan Number:", margin, yPos);
        doc.text(loanNumber, pageWidth - margin, yPos, { align: "right" });
        yPos += 5;
      }
      
      doc.text("Amount Due:", margin, yPos);
      doc.text(`$${total.toFixed(2)}`, pageWidth - margin, yPos, { align: "right" });
      yPos += 5;
    }
    
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;
    
    // Footer
    doc.setFontSize(8);
    doc.text("Thank you for your purchase!", pageWidth / 2, yPos, { align: "center" });
    yPos += 5;
    doc.setFontSize(7);
    doc.text("Please keep this receipt for your records", pageWidth / 2, yPos, { align: "center" });
    
    // Save the PDF with proper name
    doc.save(`Receipt_${billNumber}_${Date.now()}.pdf`);
    return true;
  } catch (error) {
    console.error("Receipt generation failed:", error);
    alert("Receipt generation failed. Please try again or check the console for details.");
    return false;
  }
};