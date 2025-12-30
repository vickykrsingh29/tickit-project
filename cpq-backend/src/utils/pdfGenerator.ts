import PDFDocument from "pdfkit";
import { Quote } from "../models/Quote";
import * as path from 'path';
import fetch from 'node-fetch'; // Import fetch
import fs from 'fs';

export const generateQuotePDF = async (quote: Quote): Promise<Buffer> => {
  return new Promise(async (resolve, reject) => { // Add async to the promise callback
    try {
      const doc = new PDFDocument({
        margin: 20,
        size: "A4",
        bufferPages: true // Enable buffer pages for header/footer
      });

      // Create a buffer to store the PDF
      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      // Define header function (drawn on every page)
      const drawHeader = async () => { // Add async here
        // Company Header
        const logoUrl = "https://tickitfiles.blob.core.windows.net/images/ebizlogo.png";
        try {
          const response = await fetch(logoUrl);
          const imageBuffer = await response.buffer();
          doc.image(imageBuffer, doc.page.width - 150, 30, { width: 100, align: 'right' });
        } catch (fetchError) {
          console.error("Error fetching logo:", fetchError);
          // Handle the error appropriately (e.g., use a placeholder image)
          reject(fetchError); // Reject the promise if logo fetch fails
          return; // Important: Exit the drawHeader function
        }
      };

      // Define footer function (drawn as a single block on every page)
      const drawFooter = () => {
        const pages = doc.bufferedPageRange();
        for (let i = 0; i < pages.count; i++) {
          doc.switchToPage(i);
          // Position footer 120px from bottom
          const footerY = doc.page.height - 80;
          doc.save();

          // Draw all footer lines as one block with fixed y coordinates
          doc.fontSize(10)
             .fillColor('red')
             .font("Helvetica-Bold")
             .text("E.Biz Solution Pvt. Ltd.", 50, footerY, {
               align: 'center',
               width: doc.page.width - 100,
               lineBreak: false
             });

          doc.fillColor('black')
             .font("Helvetica")
             .text(
               "Marketing & Correspondence Office: 5th Floor, Magnus Tower, Sector-73, Noida 201307 (Uttar Pradesh)",
               50, footerY + 12, {
                 align: 'center',
                 width: doc.page.width - 100,
                 lineBreak: false
               }
             );

          doc.font("Helvetica")
             .text("Phone: 0120-3115833 / 3116073; Mobile: 9810138655",
                   50, footerY + 24, {
                     align: 'center',
                     width: doc.page.width - 100,
                     lineBreak: false
                   }
             );

          doc.font("Helvetica")
             .text(
               "Registered Office: 330, 3rd Floor, Plot No: 1, Vardhman Sunrise Plaza, Near Abhyant Apartment, Vasundhara Enclave, Delhi-110096",
               50, footerY + 36, {
                 align: 'center',
                 width: doc.page.width - 100,
                 lineBreak: false
               }
             );

          doc.restore();
        }
      };

      // Content generation with page break checking
      const generateContent = async () => { // Add async here
        // Initial header
        await drawHeader(); // Await the drawHeader function

        // Reference number and date
        const invoiceDate = new Date(quote.invoiceDate);
        const formattedDate = `${('0' + invoiceDate.getDate()).slice(-2)}/${('0' + (invoiceDate.getMonth() + 1)).slice(-2)}/${invoiceDate.getFullYear()}`;

        doc.fontSize(12)
           .font("Helvetica-Bold")
           .text(`Ref: ${quote.refNo}`, 50, 80, { align: "right" })
           .fontSize(10)
           .font("Helvetica")
           .text(`Date: ${formattedDate}`, 50, 95, { align: "right" });

        doc.moveDown(1);

        // Subject line
        doc.fontSize(11)
           .font("Helvetica-Bold")
           .text("Subject: Proposal for " + quote.customer.name, { underline: true });

        doc.moveDown();

        // Customer details section
        doc.fontSize(10)
           .font("Helvetica")
           .text("To,")
           .font("Helvetica-Bold")
          //  .text(quote.customer.pocName)
           .font("Helvetica")
          //  .text(quote.customer.pocDesignation)
           .text(quote.customer.name)
           .text(quote.customer.billingStreetAddress)
           .text(`${quote.customer.billingCity}, ${quote.customer.billingState} - ${quote.customer.billingPin}`)
           .text(quote.customer.gstNumber ? `GSTIN: ${quote.customer.gstNumber}` : " ");

        doc.moveDown(2);

        // Price Offer Header
        doc.fontSize(12)
           .font("Helvetica-Bold")
           .text("Price Offer (Budgetary)", { underline: true });

        doc.moveDown();

        // Table header
        const tableTop = doc.y + 10;
        const tableWidth = 520;
        const leftStart = 40;

        // Define columns with a new GST% column
        const columns = [
          { header: "S.No.", x: leftStart, width: 40 },
          { header: "Description", x: leftStart + 50, width: 200 },
          { header: "Qty", x: leftStart + 260, width: 40 },
          { header: "Unit Price", x: leftStart + 310, width: 80 },
          { header: "GST%", x: leftStart + 390, width: 50 },
          { header: "Amount", x: leftStart + 440, width: 80 }
        ];

        // Draw table header
        doc.rect(leftStart, tableTop - 5, tableWidth, 20).fill("#f0f0f0");
        doc.fillColor("#000000").font("Helvetica-Bold");

        columns.forEach((column) => {
          doc.text(column.header, column.x, tableTop);
        });

        // Table content
        let yPos = tableTop + 30;
        doc.font("Helvetica");

        // Helper function to check if we need a new page
        const checkForNewPage = (height: number) => {
          if (yPos + height > doc.page.height - 150) { // Leave space for footer
            doc.addPage();
            drawHeader();
            yPos = 100; // Reset Y position after new page
            return true;
          }
          return false;
        };

        // Draw table lines and content
        const drawTableLine = (x: number, y: number, width: number) => {
          doc.moveTo(x, y).lineTo(x + width, y).stroke();
        };

        quote.items.forEach((item, index) => {
          const description = `${item.productName}${item.description ? '\n' + item.description : ''}`;
          const descriptionHeight = doc.heightOfString(description, {
            width: columns[1].width,
            align: 'left'
          });

          if (checkForNewPage(descriptionHeight + 20)) {
            // Redraw table header on new page
            doc.rect(leftStart, yPos - 5, tableWidth, 20).fill("#f0f0f0");
            doc.fillColor("#000000").font("Helvetica-Bold");
            columns.forEach((column) => {
              doc.text(column.header, column.x, yPos);
            });
            yPos += 30;
          }

          doc.font("Helvetica");
          doc.text((index + 1).toString(), columns[0].x, yPos);
          doc.text(description, columns[1].x, yPos, {
            width: columns[1].width,
            align: 'left'
          });
          doc.text(item.quantity.toString(), columns[2].x, yPos);
          doc.text(`INR ${item.unitPrice.toFixed(2)}`, columns[3].x, yPos);
          // Draw GST% column – assuming item.tax holds the GST percentage
          doc.text(`${item.tax.toFixed(2)}%`, columns[4].x, yPos);
          doc.text(`INR ${item.amount.toFixed(2)}`, columns[5].x, yPos);

          yPos += Math.max(descriptionHeight, 20) + 10;
          drawTableLine(leftStart, yPos - 5, tableWidth);
        });

        // Totals section
        yPos += 20;
        if (checkForNewPage(100)) {
          yPos += 20;
        }

        const totalSection = [
          { label: "Total Amount:", value: `INR ${quote.totalAmount.toFixed(2)}` }
        ];

        totalSection.forEach((item) => {
          doc.font("Helvetica-Bold")
             .text(item.label, leftStart + 300, yPos)
             .text(item.value, leftStart + 400, yPos);
          yPos += 20;
        });

        // Terms and Conditions
        yPos += 20;
        if (checkForNewPage(200)) {
          yPos += 20;
        }

        doc.fontSize(11)
           .font("Helvetica-Bold")
           .text("Terms & Conditions:", leftStart, yPos);

        yPos += 20;
        doc.fontSize(9).font("Helvetica");
        const terms = [
          "1. Prices: The above quoted prices are exclusive of GST and shall be charged extra as applicable.",
          "2. Payment: 100% Advance",
          "3. Delivery: Within 4 weeks from the date of order",
          "4. Warranty: One year from the date of dispatch",
          "5. Validity of Offer: 30 days from the date of quotation"
        ];

        terms.forEach(term => {
          if (checkForNewPage(30)) {
            yPos += 20;
          }
          doc.text(term, leftStart, yPos, { width: tableWidth });
          yPos += 20;
        });
      };

      // Generate content
      await generateContent(); // Await the generateContent function

      // Draw header and footer on all pages
      // (Header is drawn during content generation and footer now on every page)
      drawFooter();

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate a PDF for an order
 * @param order The order data
 * @returns A buffer containing the PDF document
 */
export const generateOrderPDF = async (order: any): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      // Create a document
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];
      
      // Collect PDF data chunks
      doc.on('data', (chunk) => buffers.push(chunk));
      
      // Resolve with the complete PDF when done
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      
      // Define header function
      const drawHeader = async () => {
        try {
          // Try to add company logo if available
          const logoPath = path.join(__dirname, '../../public/logo.png');
          if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 50, 45, { width: 150 });
          }
        } catch (error) {
          console.error('Error adding logo:', error);
        }
        
        // Add title and order number
        doc.fontSize(20)
           .text('ORDER', 400, 45, { align: 'right' })
           .fontSize(10)
           .text(`Order No: ${order.orderNumber}`, 400, 70, { align: 'right' })
           .text(`Date: ${new Date(order.orderDate).toLocaleDateString()}`, 400, 85, { align: 'right' })
           .text(`Status: ${order.status}`, 400, 100, { align: 'right' });
      };
      
      // Define footer function
      const drawFooter = () => {
        const pageCount = doc.bufferedPageRange().count;
        for (let i = 0; i < pageCount; i++) {
          doc.switchToPage(i);
          
          // Draw footer on each page
          const pageHeight = doc.page.height;
          
          // Add horizontal line
          doc.moveTo(50, pageHeight - 100)
             .lineTo(550, pageHeight - 100)
             .stroke();
          
          // Add footer text
          doc.fontSize(10)
             .text(
               `Order #${order.orderNumber} - Generated on ${new Date().toLocaleDateString()}`,
               50,
               pageHeight - 90,
               { align: 'center' }
             )
             .text(
               'Thank you for your business!',
               50,
               pageHeight - 70,
               { align: 'center' }
             )
             .text(
               `Page ${i + 1} of ${pageCount}`,
               50,
               pageHeight - 50,
               { align: 'center' }
             );
        }
      };
      
      // Define content generation function
      const generateContent = async () => {
        // Draw header
        await drawHeader();
        
        // Add horizontal line
        doc.moveTo(50, 120)
           .lineTo(550, 120)
           .stroke();
        
        // Add company, customer, and POC information
        const leftStart = 50;
        const rightStart = 300;
        let yPos = 140;
        
        // Company information (from)
        doc.fontSize(12)
           .text('From:', leftStart, yPos);
        
        yPos += 20;
        
        doc.fontSize(10)
           .text(order.companyName || 'Company Name', leftStart, yPos)
           .moveDown();
        
        // Customer information (bill to)
        yPos = 140;
        
        doc.fontSize(12)
           .text('Bill To:', rightStart, yPos);
        
        yPos += 20;
        
        if (order.customer) {
          doc.fontSize(10)
             .text(order.customer.name, rightStart, yPos);
          
          if (order.customer.email) {
            doc.text(order.customer.email, rightStart, yPos + 15);
          }
          
          if (order.customer.phone) {
            doc.text(order.customer.phone, rightStart, yPos + 30);
          }
          
          // Format billing address
          const billingAddress = [
            order.billingStreetAddress,
            order.billingAddressLine2,
            [order.billingCity, order.billingState, order.billingPin].filter(Boolean).join(', '),
            order.billingCountry
          ].filter(Boolean).join('\n');
          
          doc.text(billingAddress, rightStart, yPos + 45);
        }
        
        // Move down for shipping address
        yPos = 240;
        
        // Add shipping address if different from billing
        if (!order.sameAsBilling) {
          doc.fontSize(12)
             .text('Ship To:', leftStart, yPos);
          
          yPos += 20;
          
          // Format shipping address
          const shippingAddress = [
            order.shippingStreetAddress,
            order.shippingAddressLine2,
            [order.shippingCity, order.shippingState, order.shippingPin].filter(Boolean).join(', '),
            order.shippingCountry
          ].filter(Boolean).join('\n');
          
          doc.fontSize(10)
             .text(shippingAddress, leftStart, yPos);
        }
        
        // Add POC information
        yPos = 240;
        
        if (order.poc) {
          doc.fontSize(12)
             .text('Contact Person:', rightStart, yPos);
          
          yPos += 20;
          
          doc.fontSize(10)
             .text(order.poc.name, rightStart, yPos);
          
          if (order.poc.email) {
            doc.text(order.poc.email, rightStart, yPos + 15);
          }
          
          if (order.poc.phone) {
            doc.text(order.poc.phone, rightStart, yPos + 30);
          }
          
          if (order.poc.designation) {
            doc.text(order.poc.designation, rightStart, yPos + 45);
          }
          
          if (order.poc.department) {
            doc.text(order.poc.department, rightStart, yPos + 60);
          }
        }
        
        // Move down for order details
        yPos = 340;
        
        // Add order details
        doc.fontSize(12)
           .text('Order Details', leftStart, yPos);
        
        yPos += 20;
        
        // Add payment and delivery information
        doc.fontSize(10)
           .text(`Payment Terms: ${order.paymentTerms || 'N/A'}`, leftStart, yPos)
           .text(`Delivery Method: ${order.deliveryMethod || 'N/A'}`, leftStart + 250, yPos);
        
        if (order.expectedDeliveryDate) {
          doc.text(`Expected Delivery: ${new Date(order.expectedDeliveryDate).toLocaleDateString()}`, leftStart, yPos + 15);
        }
        
        // Move down for items table
        yPos += 40;
        
        // Table header
        const tableWidth = 500;
        
        doc.rect(leftStart, yPos, tableWidth, 20).fill('#f0f0f0');
        
        doc.fillColor('#000000')
           .fontSize(10)
           .text('Item', leftStart + 10, yPos + 5)
           .text('Description', leftStart + 150, yPos + 5)
           .text('Qty', leftStart + 300, yPos + 5)
           .text('Unit Price', leftStart + 350, yPos + 5)
           .text('Tax', leftStart + 400, yPos + 5)
           .text('Amount', leftStart + 450, yPos + 5);
        
        yPos += 25;
        
        // Table rows
        if (order.items && order.items.length > 0) {
          order.items.forEach((item: any, i: number) => {
            // Check if we need a new page
            const checkForNewPage = (height: number) => {
              if (yPos + height > doc.page.height - 150) { // Leave space for footer
                doc.addPage();
                drawHeader();
                yPos = 120; // Reset Y position after new page
                return true;
              }
              return false;
            };
            
            // Draw table line
            const drawTableLine = (x: number, y: number, width: number) => {
              doc.moveTo(x, y)
                 .lineTo(x + width, y)
                 .stroke();
            };
            
            // Check for new page
            checkForNewPage(60);
            
            // Draw item row
            doc.fontSize(10)
               .text(item.productName, leftStart + 10, yPos)
               .text(item.description || '', leftStart + 150, yPos, { width: 140 })
               .text(item.quantity.toString(), leftStart + 300, yPos)
               .text(`$${item.unitPrice.toFixed(2)}`, leftStart + 350, yPos)
               .text(`${item.taxRate}%`, leftStart + 400, yPos)
               .text(`$${item.totalAmount.toFixed(2)}`, leftStart + 450, yPos);
            
            // Calculate row height based on description length
            const descriptionHeight = doc.heightOfString(item.description || '', { width: 140 });
            const rowHeight = Math.max(descriptionHeight, 20);
            
            yPos += rowHeight + 5;
            
            // Draw line after row
            drawTableLine(leftStart, yPos - 2, tableWidth);
          });
        } else {
          doc.text('No items', leftStart + 10, yPos);
          yPos += 20;
        }
        
        // Add additional costs if any
        const hasAdditionalCosts = 
          order.liquidatedDamagesAmount > 0 ||
          order.freightChargeAmount > 0 ||
          order.transitInsuranceAmount > 0 ||
          order.installationAmount > 0 ||
          order.securityDepositAmount > 0 ||
          order.liaisoningAmount > 0;
        
        if (hasAdditionalCosts) {
          yPos += 20;
          
          // Check if we need a new page
          if (yPos > doc.page.height - 200) {
            doc.addPage();
            drawHeader();
            yPos = 120;
          }
          
          doc.fontSize(12)
             .text('Additional Costs', leftStart, yPos);
          
          yPos += 20;
          
          // Table header
          doc.rect(leftStart, yPos, tableWidth, 20).fill('#f0f0f0');
          
          doc.fillColor('#000000')
             .fontSize(10)
             .text('Cost Type', leftStart + 10, yPos + 5)
             .text('Inclusive', leftStart + 300, yPos + 5)
             .text('Amount', leftStart + 450, yPos + 5);
          
          yPos += 25;
          
          // Liquidated damages
          if (order.liquidatedDamagesAmount > 0) {
            doc.text('Liquidated Damages', leftStart + 10, yPos)
               .text(order.liquidatedDamagesInclusive ? 'Yes' : 'No', leftStart + 300, yPos)
               .text(`$${order.liquidatedDamagesAmount.toFixed(2)}`, leftStart + 450, yPos);
            yPos += 20;
          }
          
          // Freight charge
          if (order.freightChargeAmount > 0) {
            doc.text('Freight Charge', leftStart + 10, yPos)
               .text(order.freightChargeInclusive ? 'Yes' : 'No', leftStart + 300, yPos)
               .text(`$${order.freightChargeAmount.toFixed(2)}`, leftStart + 450, yPos);
            yPos += 20;
          }
          
          // Transit insurance
          if (order.transitInsuranceAmount > 0) {
            doc.text('Transit Insurance', leftStart + 10, yPos)
               .text(order.transitInsuranceInclusive ? 'Yes' : 'No', leftStart + 300, yPos)
               .text(`$${order.transitInsuranceAmount.toFixed(2)}`, leftStart + 450, yPos);
            yPos += 20;
          }
          
          // Installation
          if (order.installationAmount > 0) {
            doc.text('Installation', leftStart + 10, yPos)
               .text(order.installationInclusive ? 'Yes' : 'No', leftStart + 300, yPos)
               .text(`$${order.installationAmount.toFixed(2)}`, leftStart + 450, yPos);
            yPos += 20;
          }
          
          // Security deposit
          if (order.securityDepositAmount > 0) {
            doc.text('Security Deposit', leftStart + 10, yPos)
               .text(order.securityDepositInclusive ? 'Yes' : 'No', leftStart + 300, yPos)
               .text(`$${order.securityDepositAmount.toFixed(2)}`, leftStart + 450, yPos);
            yPos += 20;
          }
          
          // Liaisoning
          if (order.liaisoningAmount > 0) {
            doc.text('Liaisoning', leftStart + 10, yPos)
               .text(order.liaisoningInclusive ? 'Yes' : 'No', leftStart + 300, yPos)
               .text(`$${order.liaisoningAmount.toFixed(2)}`, leftStart + 450, yPos);
            yPos += 20;
          }
        }
        
        // Add totals
        yPos += 20;
        
        // Check if we need a new page
        if (yPos > doc.page.height - 200) {
          doc.addPage();
          drawHeader();
          yPos = 120;
        }
        
        doc.fontSize(10)
           .text('Subtotal:', leftStart + 350, yPos)
           .text(`$${order.subtotal.toFixed(2)}`, leftStart + 450, yPos);
        
        yPos += 20;
        
        doc.text('Tax:', leftStart + 350, yPos)
           .text(`$${order.taxAmount.toFixed(2)}`, leftStart + 450, yPos);
        
        yPos += 20;
        
        doc.text('Discount:', leftStart + 350, yPos)
           .text(`$${order.discountAmount.toFixed(2)}`, leftStart + 450, yPos);
        
        yPos += 20;
        
        // Draw line before total
        doc.moveTo(leftStart + 350, yPos)
           .lineTo(leftStart + 500, yPos)
           .stroke();
        
        yPos += 5;
        
        // Add total
        doc.fontSize(12)
           .text('Total:', leftStart + 350, yPos)
           .text(`$${order.totalAmount.toFixed(2)}`, leftStart + 450, yPos);
        
        // Add terms and conditions
        yPos += 40;
        
        // Check if we need a new page
        if (yPos > doc.page.height - 200) {
          doc.addPage();
          drawHeader();
          yPos = 120;
        }
        
        doc.fontSize(12)
           .text('Terms and Conditions', leftStart, yPos);
        
        yPos += 20;
        
        const terms = [
          '1. Payment is due according to the terms specified in this order.',
          '2. Delivery dates are approximate and subject to change.',
          '3. All prices are subject to applicable taxes.',
          '4. Warranty terms as specified in the product documentation.',
          '5. Returns must be authorized and may be subject to restocking fees.'
        ];
        
        terms.forEach(term => {
          // Check if we need a new page
          if (yPos + 30 > doc.page.height - 150) {
            doc.addPage();
            drawHeader();
            yPos = 120;
          }
          
          doc.fontSize(10)
             .text(term, leftStart, yPos, { width: tableWidth });
          
          yPos += 20;
        });
        
        // Add notes if available
        if (order.notes) {
          yPos += 20;
          
          // Check if we need a new page
          if (yPos + 50 > doc.page.height - 150) {
            doc.addPage();
            drawHeader();
            yPos = 120;
          }
          
          doc.fontSize(12)
             .text('Notes', leftStart, yPos);
          
          yPos += 20;
          
          doc.fontSize(10)
             .text(order.notes, leftStart, yPos, { width: tableWidth });
        }
      };
      
      // Generate content
      generateContent().then(() => {
        // Draw footer on all pages
        drawFooter();
        
        // End the document
        doc.end();
      }).catch(error => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};