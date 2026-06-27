import PDFDocument from 'pdfkit';

export function buildInvoicePDF(booking, stream) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  
  doc.pipe(stream);


  doc.fillColor('#f59e0b').fontSize(24).text('QUICK DRIVE Rentals', 50, 45);
  doc.fillColor('#718096').fontSize(10).text('Premium Rental Infrastructure', 50, 75);
  
  doc.fillColor('#000000').fontSize(18).text('INVOICE', 400, 45, { align: 'right' });
  doc.fontSize(9).text(`Invoice Ref: INV-${booking._id.toString().slice(-6).toUpperCase()}`, 400, 70, { align: 'right' });
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 400, 85, { align: 'right' });

  
  doc.moveTo(50, 110).lineTo(550, 110).strokeColor('#2d3748').lineWidth(1).stroke();

 
  doc.fillColor('#a0aec0').fontSize(10).text('Billed To:', 50, 130);
  doc.fillColor('#000000').fontSize(11).text(booking.user_name, 50, 145);
  doc.fillColor('#000000').fontSize(10).text(`Contact: ${booking.user_contact_number}`, 50, 160);

  doc.fillColor('#a0aec0').fontSize(10).text('Operator Details:', 350, 130);
  doc.fillColor('#000000').fontSize(11).text(booking.owner_name, 350, 145);
  doc.fillColor('#000000').fontSize(10).text(`Contact: ${booking.owner_contact_number}`, 350, 160);

 
  doc.moveTo(50, 190).lineTo(550, 190).strokeColor('#2d3748').stroke();


  doc.fillColor('#f59e0b').fontSize(10).text('Reservation Description', 50, 210);
  doc.text('Rate / Day', 300, 210, { width: 70, align: 'right' });
  doc.text('Days', 400, 210, { width: 50, align: 'right' });
  doc.text('Total', 480, 210, { width: 70, align: 'right' });

  doc.moveTo(50, 225).lineTo(550, 225).strokeColor('#1a1d26').lineWidth(0.5).stroke();


  const carDescription = `${booking.vehicle_name} ${booking.vehicle_model} (${booking.vehicle_year}) \nReg: ${booking.vehicle_number}`;
  const perDayRate = `INR ${booking.total_rent_cost / booking.total_days}`;

  doc.fillColor('#000000').fontSize(10).text(carDescription, 50, 240, { width: 230 });
  doc.text(perDayRate, 300, 240, { width: 70, align: 'right' });
  doc.text(booking.total_days.toString(), 400, 240, { width: 50, align: 'right' });
  doc.text(`INR ${booking.total_rent_cost}`, 480, 240, { width: 70, align: 'right' });

 
  doc.moveTo(50, 300).lineTo(550, 300).strokeColor('#2d3748').lineWidth(1).stroke();

 
  doc.fillColor('#34d399').fontSize(14).text(`Grand Total Paid: INR ${booking.total_rent_cost}`, 50, 320, { align: 'right' });
  
  doc.fillColor('#a0aec0').fontSize(9).text(`Gateway Transaction Reference ID: ${booking.payment_id}`, 50, 360);


  doc.fillColor('#718096').fontSize(8).text('This is an electronically generated receipt confirmation statement requiring no signature authorization profiles.', 50, 750, { align: 'center', width: 500 });


  doc.end();
}