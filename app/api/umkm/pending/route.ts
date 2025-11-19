import { NextResponse } from 'next/server';
import { getPendingUMKM } from '@/lib/mockData';

export async function GET() {
  try {
    const pendingUMKM = getPendingUMKM();
    return NextResponse.json(pendingUMKM);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch pending UMKM' },
      { status: 500 }
    );
  }
}
