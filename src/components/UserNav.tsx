"use client";

import { useAuth, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UserNav() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) return null;

  return (
    <div className="flex items-center gap-4">
      <UserButton />
    </div>
  );
}
