import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail } from "@/components/icons";

export default function SignUpSuccessPage() {
  return (
    <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="p-8 shadow-xl border-border/50 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
          <Mail className="w-8 h-8 text-primary" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-3">
          Check your email
        </h1>
        
        <p className="text-muted-foreground mb-6">
          We've sent you a confirmation link to verify your email address. Please check your inbox and click the link to complete your registration.
        </p>

        <div className="p-4 rounded-lg bg-muted/50 border border-border mb-6">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Didn't receive an email?</strong>
            <br />
            Check your spam folder or wait a few minutes for it to arrive.
          </p>
        </div>

        <Button asChild className="w-full h-12">
          <Link href="/auth/login">
            Back to Sign In
          </Link>
        </Button>
      </Card>

      <div className="mt-6 text-center">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
