import { LoginForm } from "@/components/forms/login-form";
import { Logo } from "@/components/ui/logo";

export default function LoginPage() {
  return (
    <main className="bg-page px-4 py-16 text-foreground">
      <section className="mx-auto max-w-md rounded-lg border border-line/10 bg-surface p-6">
        <Logo />
        <h1 className="mt-8 text-3xl font-black">Login</h1>
        <p className="mt-2 text-sm text-muted">Student, instructor, and admin portals use secure role-based access.</p>
        <LoginForm />
      </section>
    </main>
  );
}
