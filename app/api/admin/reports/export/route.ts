import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { DEFAULT_ORG_ID } from '@/lib/constants';
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    const endDate = endDateParam ? new Date(endDateParam) : new Date();
    const startDate = startDateParam
      ? new Date(startDateParam)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get report data
    const auditLogs = await db.auditLog.findMany({
      where: {
        orgId: DEFAULT_ORG_ID,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const boards = await db.board.findMany({
      where: {
        orgId: DEFAULT_ORG_ID,
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
    });

    const cards = await db.card.findMany({
      where: {
        list: {
          board: {
            orgId: DEFAULT_ORG_ID,
          },
        },
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        assignedToId: true,
      },
    });

    if (format === 'csv') {
      // Generate CSV
      const csvData = [
        ['Report Type', 'ID', 'Title', 'Action', 'User', 'Date'],
        ...auditLogs.map((log) => [
          log.entityType,
          log.entityId,
          log.entityTitle,
          log.action,
          log.userName,
          new Date(log.createdAt).toLocaleString(),
        ]),
      ];

      const csv = Papa.unparse(csvData);

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="mytracker-report-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else if (format === 'pdf') {
      // Generate PDF
      const doc = new jsPDF();
      let yPos = 20;

      doc.setFontSize(16);
      doc.text('MyTracker Performance Report', 14, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.text(
        `Date Range: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
        14,
        yPos
      );
      yPos += 10;

      doc.text(`Total Boards: ${boards.length}`, 14, yPos);
      yPos += 5;
      doc.text(`Total Cards: ${cards.length}`, 14, yPos);
      yPos += 10;

      doc.setFontSize(12);
      doc.text('Recent Activity', 14, yPos);
      yPos += 5;

      doc.setFontSize(8);
      auditLogs.slice(0, 20).forEach((log) => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(
          `${log.action} ${log.entityType}: ${log.entityTitle} by ${log.userName}`,
          14,
          yPos
        );
        yPos += 5;
      });

      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="mytracker-report-${new Date().toISOString().split('T')[0]}.pdf"`,
        },
      });
    }

    return NextResponse.json(
      { error: 'Invalid format. Use csv or pdf' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[ADMIN_REPORTS_EXPORT_ERROR]', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

