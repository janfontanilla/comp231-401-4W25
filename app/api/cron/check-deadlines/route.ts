import { NextResponse } from 'next/server';
import { checkDeadlines } from '@/lib/notifications';

// This endpoint should be called by a cron service (e.g., Vercel Cron, Upstash)
// Example: Call every hour to check for upcoming deadlines

export async function GET(request: Request) {
  try {
    // Optional: Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // If CRON_SECRET is set, verify the request
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.log('[CRON] Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[CRON] Checking deadlines...');
    const result = await checkDeadlines();
    console.log('[CRON] Result:', result);

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CRON_ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check deadlines' },
      { status: 500 }
    );
  }
}

// POST endpoint for manual triggering (admin only in production)
export async function POST(request: Request) {
  try {
    console.log('[CRON] Manual deadline check triggered');
    const result = await checkDeadlines();

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
      manual: true,
    });
  } catch (error) {
    console.error('[CRON_MANUAL_ERROR]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check deadlines' },
      { status: 500 }
    );
  }
}

