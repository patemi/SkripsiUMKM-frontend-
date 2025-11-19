import { NextResponse } from 'next/server';
import { mockActivityLogs } from '@/lib/mockData';

export async function GET() {
  try {
    return NextResponse.json(mockActivityLogs.sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    ));
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 }
    );
  }
}
