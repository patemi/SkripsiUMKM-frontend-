import { NextResponse } from 'next/server';
import { getTopFavoriteUMKM } from '@/lib/mockData';

export async function GET() {
  try {
    const topUMKM = getTopFavoriteUMKM(5);
    return NextResponse.json(topUMKM);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch top UMKM' },
      { status: 500 }
    );
  }
}
