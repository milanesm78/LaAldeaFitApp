import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { LanguageToggle } from "@/components/LanguageToggle";

export function RegisterPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute right-4 top-4">
        <LanguageToggle />
      </div>
      <div className="flex w-full flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">JavierFitness</h1>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
