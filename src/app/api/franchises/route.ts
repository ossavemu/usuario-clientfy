import { transporter } from '@/lib/email/setup';
import { deleteFranchiseContract } from '@/lib/s3/franchises/delete';
import { uploadFranchiseContract } from '@/lib/s3/franchises/upload';

import { executeQuery } from '@/lib/turso/client';
import type { ResultSet } from '@libsql/client';
import fontkit from '@pdf-lib/fontkit';
import { Buffer } from 'buffer';
import fs from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function GET() {
  try {
    const result = await executeQuery<ResultSet>(
      'SELECT * FROM franchises ORDER BY created_at DESC',
    );
    return NextResponse.json({ success: true, franquicias: result.rows });
  } catch {
    return NextResponse.json(
      {
        success: false,
        franquicias: [],
        message: 'Error fetching franchises',
      },
      { status: 500 },
    );
  }
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
      return NextResponse.json(
        { success: false, message: 'Incomplete data' },
        { status: 400 },
      );
    }
    const existsId = await executeQuery<ResultSet>(
      'SELECT id FROM franchises WHERE state_id = ?',
      [stateId],
    );
    if (existsId.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'ID already exists' },
        { status: 400 },
      );
    }
    const existsEmail = await executeQuery<ResultSet>(
      'SELECT id FROM franchises WHERE email = ?',
      [email],
    );
    if (existsEmail.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Email already exists' },
        { status: 400 },
      );
    }
    await executeQuery(
      'INSERT INTO franchises (name, person_or_company_name, state_id, email, contracted_instances) VALUES (?, ?, ?, ?, ?)',
      [name, personOrCompanyName, stateId, email, contractedInstances],
    );
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
    return NextResponse.json({
      success: true,
      pdfBase64,
      contractUrl: uploadResult.url,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: 'Error creating franchise' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  if (!email)
    return NextResponse.json(
      { success: false, message: 'Email requerido' },
      { status: 400 },
    );
  try {
    await deleteFranchiseContract(email);
    await executeQuery('DELETE FROM franchises WHERE email = ?', [email]);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Error al eliminar franquicia' },
      { status: 500 },
    );
  }
}
