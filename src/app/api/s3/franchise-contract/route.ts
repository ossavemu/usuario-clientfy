import { deleteFranchiseContract } from '@/lib/s3/franchises/delete';
import { getFranchiseContractUrl } from '@/lib/s3/franchises/url';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  if (!email) return NextResponse.json({ url: null });
  try {
    const url = await getFranchiseContractUrl(email);
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ url: null });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  if (!email) return NextResponse.json({ success: false });
  try {
    await deleteFranchiseContract(email);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false });
  }
}
