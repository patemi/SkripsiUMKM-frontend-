import { NextResponse } from 'next/server';
import { mockUMKM, mockActivityLogs } from '@/lib/mockData';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { action, reason } = await request.json();
    const umkmIndex = mockUMKM.findIndex(u => u.id === params.id);
    
    if (umkmIndex === -1) {
      return NextResponse.json(
        { error: 'UMKM not found' },
        { status: 404 }
      );
    }

    mockUMKM[umkmIndex].status = action === 'approve' ? 'approved' : 'rejected';
    mockUMKM[umkmIndex].updatedAt = new Date();

    // Log the activity
    const activityLog = {
      id: Date.now().toString(),
      adminId: 'admin1', // In production, get from session
      adminName: 'Admin User',
      umkmId: params.id,
      umkmNama: mockUMKM[umkmIndex].nama,
      action: action === 'approve' ? 'approved' as const : 'rejected' as const,
      reason,
      timestamp: new Date(),
    };
    mockActivityLogs.push(activityLog);

    return NextResponse.json({
      message: `UMKM ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      umkm: mockUMKM[umkmIndex],
      log: activityLog,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to verify UMKM' },
      { status: 500 }
    );
  }
}
