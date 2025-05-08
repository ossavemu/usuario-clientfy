import {
  createFranchise,
  deleteFranchiseByEmail,
  findFranchiseByEmail,
  findFranchiseById,
  getAllFranchises,
} from '@/dal/admin';
import { jsonError, jsonSuccess } from '@/lib/api/jsonResponse';
import { requireParam } from '@/lib/api/requireParam';
import { transporter } from '@/lib/email/setup';
import { deleteFranchiseContract } from '@/lib/s3/franchises/delete';
import { uploadFranchiseContract } from '@/lib/s3/franchises/upload';
import fontkit from '@pdf-lib/fontkit';
import { Buffer } from 'buffer';
import fs from 'fs';
import path from 'path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function GET() {
  const franquicias = await getAllFranchises();
  return jsonSuccess({ success: true, franquicias });
}

export async function POST(request: Request) {
  try {
    const {
      name,
      personOrCompanyName,
      stateId,
      email,
      contractedInstances,
      signatureType,
      signatureData,
    } = await request.json();
    if (!name || !personOrCompanyName || !stateId || !email) {
      return jsonError('Incomplete data', 400);
    }
    const existsId = await findFranchiseById(stateId);
    if (existsId.length > 0) {
      return jsonError('ID already exists', 400);
    }
    const existsEmail = await findFranchiseByEmail(email);
    if (existsEmail.length > 0) {
      return jsonError('Email already exists', 400);
    }
    await createFranchise({
      name,
      personOrCompanyName,
      stateId,
      email,
      contractedInstances,
    });
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    const page = pdfDoc.addPage();
    const { height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    page.drawText('CONTRATO DE FRANQUICIA (placeholder)', {
      x: 50,
      y: height - 50,
      size: 18,
      font,
    });
    page.drawText(`Nombre de la franquicia: ${name}`, {
      x: 50,
      y: height - 80,
      size: 12,
      font,
    });
    page.drawText(`Persona o empresa: ${personOrCompanyName}`, {
      x: 50,
      y: height - 100,
      size: 12,
      font,
    });
    page.drawText(`ID: ${stateId}`, { x: 50, y: height - 120, size: 12, font });
    page.drawText(`Email: ${email}`, {
      x: 50,
      y: height - 140,
      size: 12,
      font,
    });
    page.drawText(`Instancias contratadas: ${contractedInstances}`, {
      x: 50,
      y: height - 160,
      size: 12,
      font,
    });
    page.drawText('Firma:', { x: 50, y: height - 200, size: 12, font });
    if (signatureType === 'draw' || signatureType === 'upload') {
      const png = await pdfDoc.embedPng(signatureData);
      const pngDims = png.scale(0.5);
      page.drawImage(png, {
        x: 120,
        y: height - 240,
        width: pngDims.width,
        height: pngDims.height,
      });
    } else {
      const fontPath = path.join(process.cwd(), 'public', 'raw_cal.ttf');
      const fontBytes = fs.readFileSync(fontPath);
      pdfDoc.registerFontkit(fontkit);
      const caligraphicFont = await pdfDoc.embedFont(fontBytes);
      const fontSize = 36;
      const signatureWidth = caligraphicFont.widthOfTextAtSize(
        signatureData,
        fontSize,
      );
      const pageWidth = page.getWidth();
      const x = (pageWidth - signatureWidth) / 2;
      page.drawText(signatureData, {
        x,
        y: height - 260,
        size: fontSize,
        font: caligraphicFont,
        color: rgb(0.2, 0.2, 0.2),
      });
    }
    const pdfBytes = await pdfDoc.save();
    await transporter.sendMail({
      from: `ClientFy <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Franchise Contract',
      text: 'Adjunto tu contrato',
      attachments: [
        { filename: 'contrato.pdf', content: Buffer.from(pdfBytes) },
      ],
    });
    const uploadResult = await uploadFranchiseContract(
      Buffer.from(pdfBytes),
      email,
    );
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
    return jsonSuccess({
      success: true,
      pdfBase64,
      contractUrl: uploadResult.url,
    });
  } catch {
    return jsonError('Error creating franchise', 500);
  }
}

export async function DELETE(request: Request) {
  let email;
  try {
    const { searchParams } = new URL(request.url);
    email = requireParam({ email: searchParams.get('email') }, 'email');
  } catch {
    return jsonError('Falta el parámetro requerido: email', 400);
  }
  try {
    await deleteFranchiseContract(email);
    await deleteFranchiseByEmail(email);
    return jsonSuccess({ success: true });
  } catch {
    return jsonError('Error al eliminar franquicia', 500);
  }
}
