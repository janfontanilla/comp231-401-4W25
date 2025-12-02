"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { UserCheck, AlertCircle, Clock, ArrowRight } from "lucide-react";

function GuestJoinForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState("");
  const [inviteInfo, setInviteInfo] = useState<any>(null);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const validateInvite = async () => {
      if (!token) {
        setError("No invite token provided");
        setIsValidating(false);
        return;
      }

      try {
        const response = await fetch(`/api/guest/invite/validate?token=${token}`);
        const data = await response.json();

        if (data.valid) {
          setIsValid(true);
          setInviteInfo(data.invite);
        } else {
          setError(data.error || "Invalid invite");
        }
      } catch (err) {
        setError("Failed to validate invite");
      } finally {
        setIsValidating(false);
      }
    };

    validateInvite();
  }, [token]);

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      const response = await fetch("/api/guest/invite/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to the board or main page
        if (data.boardId) {
          router.push(`/board/${data.boardId}`);
        } else {
          router.push("/organization/default-org");
        }
      } else {
        setError(data.error || "Failed to join");
      }
    } catch (err) {
      setError("Failed to join");
    } finally {
      setIsJoining(false);
    }
  };

  if (isValidating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Validating your invite...</p>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invite</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
        <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <UserCheck className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re Invited!</h2>
        <p className="text-gray-600 mb-4">
          You&apos;ve been invited to view projects on MyTracker as a guest.
        </p>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Clock className="h-4 w-4" />
            <span>
              Expires: {new Date(inviteInfo.expiresAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          <p className="text-xs text-gray-400">
            {inviteInfo.remainingUses} use{inviteInfo.remainingUses !== 1 ? 's' : ''} remaining
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-blue-800 mb-2">As a guest, you can:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>✓ View project boards and progress</li>
            <li>✓ See task summaries</li>
            <li>✓ Submit feedback</li>
          </ul>
          <p className="text-xs text-blue-600 mt-2 italic">
            Note: Guests cannot edit or modify any content.
          </p>
        </div>

        <button
          onClick={handleJoin}
          disabled={isJoining}
          className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {isJoining ? "Joining..." : "Join as Guest"}
          <ArrowRight className="h-4 w-4" />
        </button>

        <p className="mt-4 text-sm text-gray-500">
          Have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login instead
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function GuestJoinPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <GuestJoinForm />
    </Suspense>
  );
}

