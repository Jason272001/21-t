import { registerAction } from "@backend/actions/public";
import { ActionForm } from "@/components/forms/action-form";
import { TextField } from "@/components/forms/fields";
import { Logo } from "@/components/ui/logo";

export default function RegisterPage() {
  return (
    <main className="bg-page px-4 py-16 text-foreground">
      <section className="mx-auto max-w-md rounded-lg border border-line/10 bg-surface p-6">
        <Logo />
        <h1 className="mt-8 text-3xl font-black">Student registration</h1>
        <div className="mt-6">
          <ActionForm action={registerAction} submitLabel="Create account">
            <TextField name="name" label="Full name" required />
            <TextField name="email" label="Email" type="email" required />
            <TextField name="password" label="Password" type="password" required />
          </ActionForm>
        </div>
      </section>
    </main>
  );
}
