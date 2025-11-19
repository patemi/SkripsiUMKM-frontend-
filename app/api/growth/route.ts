import { NextResponse } from 'next/server';
import { getGrowthData } from '@/lib/mockData';

export async function GET() {
  try {
    const growthData = getGrowthData();
    return NextResponse.json(growthData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch growth data' },
      { status: 500 }
    );
  }
}
