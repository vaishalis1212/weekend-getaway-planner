import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

/**
 * Parse markdown content to extract structured data including tables
 */
function parseMarkdownContent(markdownContent) {
  const lines = markdownContent.split('\n');
  const elements = [];
  let currentTable = null;
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines outside tables
    if (!line && !inTable) continue;

    // Detect table start (line with |)
    if (line.includes('|') && !line.match(/^[\|\-\s]+$/)) {
      if (!inTable) {
        // Start new table
        currentTable = { headers: [], rows: [] };
        inTable = true;
      }

      // Parse table row
      const cells = line.split('|')
        .map(cell => cell.trim())
        .filter(cell => cell); // Remove empty first/last cells

      // Check if this is header row (next line is separator)
      const nextLine = lines[i + 1]?.trim();
      if (nextLine && nextLine.match(/^[\|\-\s]+$/)) {
        currentTable.headers = cells;
        i++; // Skip separator line
      } else {
        currentTable.rows.push(cells);
      }
    } else if (inTable && line.match(/^[\|\-\s]*$/)) {
      // Table separator - skip
      continue;
    } else if (inTable && !line.includes('|')) {
      // End of table
      elements.push({ type: 'table', data: currentTable });
      currentTable = null;
      inTable = false;

      // Process current line as text
      if (line) {
        if (line.startsWith('**') && line.endsWith('**')) {
          elements.push({ type: 'heading', text: line.replace(/\*\*/g, '') });
        } else {
          elements.push({ type: 'text', text: line });
        }
      }
    } else if (!inTable) {
      // Regular text outside table
      if (line.startsWith('**') && line.endsWith('**')) {
        elements.push({ type: 'heading', text: line.replace(/\*\*/g, '') });
      } else if (line.startsWith('###')) {
        elements.push({ type: 'subheading', text: line.replace(/###/g, '').trim() });
      } else {
        elements.push({ type: 'text', text: line });
      }
    }
  }

  // Close any open table
  if (inTable && currentTable) {
    elements.push({ type: 'table', data: currentTable });
  }

  return elements;
}

/**
 * Export itinerary as PDF with proper table formatting
 */
export async function exportToPDF(itineraryContent, destination, userPreferences) {
  try {
    console.log('exportToPDF called with:', { contentLength: itineraryContent?.length, destination });

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    let yPosition = 20;

    // Title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(99, 102, 241); // Primary color
    doc.text(`${destination} - Weekend Itinerary`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 12;

    // Dates and Budget
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);

    if (userPreferences?.startDate && userPreferences?.endDate) {
      doc.text(`Travel Dates: ${formatDate(userPreferences.startDate)} - ${formatDate(userPreferences.endDate)}`, margin, yPosition);
      yPosition += 6;
    }

    if (userPreferences?.budget) {
      doc.text(`Budget: ₹${userPreferences.budget.toLocaleString()}`, margin, yPosition);
      yPosition += 6;
    }

    yPosition += 5;
    doc.setTextColor(0, 0, 0);

    // Parse content
    const elements = parseMarkdownContent(itineraryContent);

    // Render each element
    for (const element of elements) {
      // Check page space
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      switch (element.type) {
        case 'heading':
          doc.setFontSize(14);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(79, 70, 229); // Secondary color
          doc.text(element.text, margin, yPosition);
          yPosition += 8;
          doc.setFont(undefined, 'normal');
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          break;

        case 'subheading':
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.text(element.text, margin, yPosition);
          yPosition += 7;
          doc.setFont(undefined, 'normal');
          doc.setFontSize(10);
          break;

        case 'text':
          const maxWidth = pageWidth - (margin * 2);
          const splitText = doc.splitTextToSize(element.text, maxWidth);

          splitText.forEach(line => {
            if (yPosition > 280) {
              doc.addPage();
              yPosition = 20;
            }
            doc.text(line, margin, yPosition);
            yPosition += 5;
          });
          yPosition += 2;
          break;

        case 'table':
          // Draw table manually with jsPDF
          const tableData = element.data;
          const cellPadding = 2;
          const rowHeight = 8;
          const colWidths = [15, 30, 40, 60, 25]; // Day, Time, Activity, Details, Cost
          let xPos = margin;

          // Check if we need a new page
          const tableHeight = (tableData.rows.length + 1) * rowHeight;
          if (yPosition + tableHeight > 280) {
            doc.addPage();
            yPosition = 20;
          }

          // Draw header row
          doc.setFillColor(99, 102, 241);
          doc.setTextColor(255, 255, 255);
          doc.setFont(undefined, 'bold');
          doc.setFontSize(9);

          xPos = margin;
          tableData.headers.forEach((header, i) => {
            doc.rect(xPos, yPosition, colWidths[i], rowHeight, 'F');
            doc.text(header, xPos + cellPadding, yPosition + 5.5);
            xPos += colWidths[i];
          });
          yPosition += rowHeight;

          // Draw data rows
          doc.setFont(undefined, 'normal');
          doc.setFontSize(8);
          doc.setTextColor(0, 0, 0);

          tableData.rows.forEach((row, rowIndex) => {
            // Alternate row colors
            if (rowIndex % 2 === 0) {
              doc.setFillColor(245, 247, 250);
              xPos = margin;
              colWidths.forEach(width => {
                doc.rect(xPos, yPosition, width, rowHeight, 'F');
                xPos += width;
              });
            }

            xPos = margin;
            row.forEach((cell, i) => {
              // Draw cell border
              doc.setDrawColor(200, 200, 200);
              doc.rect(xPos, yPosition, colWidths[i], rowHeight);

              // Draw text (truncate if too long)
              const maxChars = Math.floor(colWidths[i] / 1.5);
              const cellText = cell.length > maxChars ? cell.substring(0, maxChars - 2) + '..' : cell;
              doc.text(cellText, xPos + cellPadding, yPosition + 5.5);
              xPos += colWidths[i];
            });
            yPosition += rowHeight;
          });

          yPosition += 5; // Add spacing after table
          break;
      }
    }

    // Footer on all pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Generated by Weekend Getaway Planner - Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Save
    const filename = `${destination.replace(/\s/g, '_')}_Itinerary.pdf`;
    console.log('Saving PDF as:', filename);
    doc.save(filename);
    console.log('PDF saved successfully');
  } catch (error) {
    console.error('Error in exportToPDF:', error);
    throw new Error(`PDF generation failed: ${error.message}`);
  }
}

/**
 * Export itinerary as Word document with proper table formatting
 */
export async function exportToWord(itineraryContent, destination, userPreferences) {
  try {
    console.log('exportToWord called with:', { contentLength: itineraryContent?.length, destination });

    const children = [];

  // Title
  children.push(
    new Paragraph({
      text: `${destination} - Weekend Itinerary`,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 }
    })
  );

  // Travel Details
  if (userPreferences?.startDate && userPreferences?.endDate) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Travel Dates: ${formatDate(userPreferences.startDate)} - ${formatDate(userPreferences.endDate)}`,
            size: 22
          })
        ],
        spacing: { after: 100 }
      })
    );
  }

  if (userPreferences?.budget) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Budget: ₹${userPreferences.budget.toLocaleString()}`,
            size: 22
          })
        ],
        spacing: { after: 200 }
      })
    );
  }

  // Parse content
  const elements = parseMarkdownContent(itineraryContent);

  // Render each element
  for (const element of elements) {
    switch (element.type) {
      case 'heading':
        children.push(
          new Paragraph({
            text: element.text,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          })
        );
        break;

      case 'subheading':
        children.push(
          new Paragraph({
            text: element.text,
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 150, after: 100 }
          })
        );
        break;

      case 'text':
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: element.text,
                size: 22
              })
            ],
            spacing: { after: 100 }
          })
        );
        break;

      case 'table':
        // Create Word table
        const tableRows = [];

        // Define column widths (Day, Time, Activity, Details, Cost) - in DXA units (1/20th of a point)
        const columnWidths = [1000, 1800, 2200, 3200, 1300];

        // Header row
        if (element.data.headers.length > 0) {
          tableRows.push(
            new TableRow({
              children: element.data.headers.map((header, colIndex) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: header,
                          bold: true,
                          size: 22,
                          color: "FFFFFF"
                        })
                      ],
                      spacing: { before: 100, after: 100 }
                    })
                  ],
                  shading: {
                    fill: "6366F1"
                  },
                  width: {
                    size: columnWidths[colIndex] || 2000,
                    type: WidthType.DXA
                  },
                  margins: {
                    top: 100,
                    bottom: 100,
                    left: 100,
                    right: 100
                  }
                })
              )
            })
          );
        }

        // Data rows
        element.data.rows.forEach((row, index) => {
          tableRows.push(
            new TableRow({
              children: row.map((cell, colIndex) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: cell || '',
                          size: 22
                        })
                      ],
                      spacing: { before: 100, after: 100 }
                    })
                  ],
                  shading: index % 2 === 0 ? { fill: "F5F7FA" } : undefined,
                  width: {
                    size: columnWidths[colIndex] || 2000,
                    type: WidthType.DXA
                  },
                  margins: {
                    top: 100,
                    bottom: 100,
                    left: 100,
                    right: 100
                  }
                })
              )
            })
          );
        });

        children.push(
          new Table({
            rows: tableRows,
            width: {
              size: 9000,
              type: WidthType.DXA
            },
            columnWidths: columnWidths,
            borders: {
              top: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC" },
              bottom: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC" },
              left: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC" },
              right: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC" },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC" },
              insideVertical: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC" }
            },
            layout: "fixed"
          })
        );

        // Add spacing after table
        children.push(
          new Paragraph({
            text: "",
            spacing: { after: 200 }
          })
        );
        break;
    }
  }

  // Footer
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '\n\nGenerated by Weekend Getaway Planner',
          italics: true,
          size: 18,
          color: '999999'
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 }
    })
  );

  // Create document
  const doc = new Document({
    sections: [{
      properties: {},
      children: children
    }]
  });

    // Generate and save
    console.log('Generating Word document...');
    const blob = await Packer.toBlob(doc);
    const filename = `${destination.replace(/\s/g, '_')}_Itinerary.docx`;
    console.log('Saving Word document as:', filename);
    saveAs(blob, filename);
    console.log('Word document saved successfully');
  } catch (error) {
    console.error('Error in exportToWord:', error);
    throw new Error(`Word generation failed: ${error.message}`);
  }
}

/**
 * Share itinerary using Web Share API (mobile friendly)
 */
export async function shareItinerary(itineraryContent, destination, userPreferences) {
  const text = `Check out my ${destination} weekend itinerary!\n\n${itineraryContent}`;

  const shareData = {
    title: `${destination} - Weekend Itinerary`,
    text: text.substring(0, 500) + (text.length > 500 ? '...' : ''),
    url: window.location.href
  };

  if (navigator.share && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
      return { success: true };
    } catch (err) {
      if (err.name === 'AbortError') {
        return { success: false, error: 'Share cancelled' };
      }
      return { success: false, error: err.message };
    }
  } else {
    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(text);
      return { success: true, fallback: 'copied' };
    } catch (err) {
      return { success: false, error: 'Sharing not supported on this device' };
    }
  }
}

/**
 * Helper function to format dates
 */
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
