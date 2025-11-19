import { NextResponse } from 'next/server';
import { getStatistics } from '@/lib/mockData';

export async function GET() {
  try {
    const stats = getStatistics();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
