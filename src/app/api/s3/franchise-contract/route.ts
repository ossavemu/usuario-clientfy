import { jsonSuccess } from '@/lib/api/jsonResponse';
import { requireParam } from '@/lib/api/requireParam';
import { deleteFranchiseContract } from '@/lib/s3/franchises/delete';
import { getFranchiseContractUrl } from '@/lib/s3/franchises/url';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = requireParam({ email: searchParams.get('email') }, 'email');
  try {
    const url = await getFranchiseContractUrl(email);
    return jsonSuccess({ url });
  } catch {
    return jsonSuccess({ url: null });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = requireParam({ email: searchParams.get('email') }, 'email');
  try {
    await deleteFranchiseContract(email);
    return jsonSuccess({ success: true });
  } catch {
    return jsonSuccess({ success: false });
  }
}
