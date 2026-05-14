import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { register as registerApi } from "../api/auth";
import { useAuthStore } from "../store/authStore";

const schema = z
  .object({
    username: z.string().min(3, "username must be at least 3 characters"),
    email: z.string().email("invalid email"),
    password: z.string().min(8, "password must be at least 8 characters"),
    confirm: z.string().min(8, "confirm your password"),
  })
  .refine((v) => v.password === v.confirm, {
    message: "passwords do not match",
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
          ?.error ?? "registration failed";
      setServerError(msg);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-pulse-50 text-ink-900 p-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm space-y-4 bg-white border border-pulse-100 p-8 rounded-2xl shadow-sm animate-slide-up"
      >
        <div className="text-center mb-2">
          <div className="w-14 h-14 mx-auto mb-2 rounded-2xl bg-gradient-to-br from-pulse-300 to-pulse-500 flex items-center justify-center text-2xl">
            ✨
          </div>
          <h1 className="text-2xl font-bold">Crée ton compte Pulse</h1>
        </div>

        <Field label="Pseudo" error={errors.username?.message}>
          <input
            type="text"
            {...register("username")}
            className="w-full px-3 py-2 rounded-xl bg-pulse-50 border border-pulse-100 focus:outline-none focus:border-pulse-400"
          />
        </Field>

        <Field label="Email" error={errors.email?.message}>
          <input
            type="email"
            {...register("email")}
            className="w-full px-3 py-2 rounded-xl bg-pulse-50 border border-pulse-100 focus:outline-none focus:border-pulse-400"
          />
        </Field>

        <Field label="Mot de passe" error={errors.password?.message}>
          <input
            type="password"
            {...register("password")}
            className="w-full px-3 py-2 rounded-xl bg-pulse-50 border border-pulse-100 focus:outline-none focus:border-pulse-400"
          />
        </Field>

        <Field label="Confirmation" error={errors.confirm?.message}>
          <input
            type="password"
            {...register("confirm")}
            className="w-full px-3 py-2 rounded-xl bg-pulse-50 border border-pulse-100 focus:outline-none focus:border-pulse-400"
          />
        </Field>

        {serverError && <p className="text-red-500 text-sm">{serverError}</p>}

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? "Création…" : "Créer mon compte"}
        </button>

        <p className="text-sm text-muted text-center">
          Déjà un compte ?{" "}
          <Link to="/login" className="text-pulse-500 font-medium hover:underline">
            Se connecter
          </Link>
        </p>
      </form>
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
      <label className="block text-sm mb-1 text-ink-700">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
