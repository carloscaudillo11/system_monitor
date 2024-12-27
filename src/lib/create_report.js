import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import markdownIt from 'markdown-it';

const markdownToPdf = async (markdownContent) => {
  const md = new markdownIt();
  const htmlContent = md.render(markdownContent);

  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([600, 800]);

  const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);


  const lines = htmlContent.split('\n');
  let yPosition = 750;

  // Escribir el contenido en el PDF
  lines.forEach((line) => {
    page.drawText(line, {
      x: 20,
      y: yPosition,
      font: font,
      size: 12,
      color: rgb(0, 0, 0),
      maxWidth: 560,
      lineHeight: 14,
    });
    yPosition -= 16;

    if (yPosition < 40) {
      const newPage = pdfDoc.addPage([600, 800]);
      page = newPage;
      yPosition = 750;
    }
  });

  // Guardamos y retornamos el PDF generado
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync('output.pdf', pdfBytes);
  return pdfBytes;
};

export default markdownToPdf;
