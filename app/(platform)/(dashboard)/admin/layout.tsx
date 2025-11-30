import { requireAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAdmin();
  } catch (error) {
    // Redirect non-admin users to the organization page
    redirect('/organization/default-org');
  }

  return <>{children}</>;
}

