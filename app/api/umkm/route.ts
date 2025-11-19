import { NextResponse } from 'next/server';
import { mockUMKM } from '@/lib/mockData';

export async function GET() {
  try {
    return NextResponse.json(mockUMKM);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch UMKM data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    // In production, save to database
    const newUMKM = {
      ...data,
      id: Date.now().toString(),
      status: 'pending',
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockUMKM.push(newUMKM);
    return NextResponse.json(newUMKM, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create UMKM' },
      { status: 500 }
    );
  }
}
