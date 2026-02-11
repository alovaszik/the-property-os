"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "@/components/icons";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "An unknown error occurred";

  return (
    <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="p-8 shadow-xl border-border/50 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-6">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-3">
          Authentication Error
        </h1>
        
        <p className="text-muted-foreground mb-6">
          {error}
        </p>

        <div className="space-y-3">
          <Button asChild className="w-full h-12">
            <Link href="/auth/login">
              Try Again
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="w-full h-12 bg-transparent">
            <Link href="/">
              Back to Home
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md">
        <Card className="p-8 shadow-xl border-border/50 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </Card>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
