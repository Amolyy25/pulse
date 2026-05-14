import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { register as registerApi } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import { SvgDefs } from "../components/SvgDefs";

const schema = z
  .object({
    username: z.string().min(3, "minimum 3 caractères"),
    email: z.string().email("email invalide"),
    password: z.string().min(8, "minimum 8 caractères"),
    confirm: z.string().min(8, "confirmer le mot de passe"),
  })
  .refine((v) => v.password === v.confirm, {
    message: "les mots de passe diffèrent",
    path: ["confirm"],
  });

type FormValues = z.infer<typeof schema>;

export default function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      const data = await registerApi({
        username: values.username,
        email: values.email,
        password: values.password,
      });
      setAuth(data.user, data.access_token, data.refresh_token);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "création impossible";
      setServerError(msg);
    }
  }

  return (
    <div className="app-bg min-h-screen relative">
      <SvgDefs />
      <div className="blob" style={{ width: 360, height: 360, background: "var(--grad-rose)", top: -120, right: -80 }} />
      <div className="blob" style={{ width: 320, height: 320, background: "linear-gradient(135deg, #e2d4ff, #c8b5ff)", bottom: -90, left: -120 }} />

      <div className="relative z-10 min-h-screen grid sm:grid-cols-2">
        <div className="hidden sm:flex flex-col justify-between p-10 lg:p-14">
          <div>
            <div className="eyebrow">Bienvenue</div>
            <h1 className="display-xl text-[3.6rem] leading-[0.95] mt-2 max-w-md">
              Crée ton <span className="flourish">rituel</span>.
            </h1>
          </div>
          <p className="font-display italic text-ink-soft text-lg max-w-sm">
            "Commence petit. Reviens demain. Recommence."
          </p>
        </div>

        <div
          className="flex items-center justify-center p-4 sm:p-10"
          style={{
            paddingTop: "max(env(safe-area-inset-top), 1rem)",
            paddingBottom: "max(env(safe-area-inset-bottom), 1rem)",
          }}
        >
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full max-w-sm card p-6 sm:p-7 animate-slide-up"
          >
            <div className="mb-5">
              <div className="eyebrow">Inscription</div>
              <h2 className="display text-2xl mt-1">Nouveau compte</h2>
            </div>

            <div className="space-y-3.5">
              <Field label="Pseudo" error={errors.username?.message}>
                <input type="text" autoComplete="username" {...register("username")} className="input" />
              </Field>
              <Field label="Email" error={errors.email?.message}>
                <input type="email" autoComplete="email" {...register("email")} className="input" />
              </Field>
              <Field label="Mot de passe" error={errors.password?.message}>
                <input type="password" autoComplete="new-password" {...register("password")} className="input" />
              </Field>
              <Field label="Confirmation" error={errors.confirm?.message}>
                <input type="password" autoComplete="new-password" {...register("confirm")} className="input" />
              </Field>

              {serverError && (
                <div className="text-sm text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                  {serverError}
                </div>
              )}

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center">
                {isSubmitting ? "…" : "Créer mon compte"}
              </button>

              <p className="text-sm text-muted text-center pt-1">
                Déjà un compte ?{" "}
                <Link to="/login" className="text-rose-500 font-semibold hover:underline">
                  Se connecter
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <p className="text-rose-500 text-xs mt-1.5">{error}</p>}
    </div>
  );
}
