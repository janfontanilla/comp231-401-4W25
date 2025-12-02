import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AccessDenied } from '@/components/access-denied';
import { logAdminDenied, logUnauthorizedAccess } from '@/lib/access-log';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Not logged in - redirect to login and log attempt
  if (!user) {
    await logUnauthorizedAccess('/admin', undefined, undefined);
    redirect('/login?message=Please login to access admin features');
  }

  // Logged in but not admin - show access denied and log attempt
  if (user.role !== 'admin') {
    await logAdminDenied('/admin', user.id, user.email);
    return (
      <div className="w-full p-6">
        <AccessDenied 
          title="Admin Access Required"
          message="This section is restricted to administrators only. Please contact your system administrator if you believe you should have access."
          requiredRole="Admin"
        />
      </div>
    );
  }

  return <>{children}</>;
}

