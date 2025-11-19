import { NextResponse } from 'next/server';
import { mockUMKM } from '@/lib/mockData';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const umkm = mockUMKM.find(u => u.id === params.id);
    if (!umkm) {
      return NextResponse.json(
        { error: 'UMKM not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(umkm);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch UMKM' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const index = mockUMKM.findIndex(u => u.id === params.id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'UMKM not found' },
        { status: 404 }
      );
    }
    mockUMKM[index] = {
      ...mockUMKM[index],
      ...data,
      updatedAt: new Date(),
    };
    return NextResponse.json(mockUMKM[index]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update UMKM' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const index = mockUMKM.findIndex(u => u.id === params.id);
    if (index === -1) {
      return NextResponse.json(
        { error: 'UMKM not found' },
        { status: 404 }
      );
    }
    mockUMKM.splice(index, 1);
    return NextResponse.json({ message: 'UMKM deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete UMKM' },
      { status: 500 }
    );
  }
}
