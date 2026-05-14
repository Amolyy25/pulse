import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { useAuthStore } from "../store/authStore";

const schema = z.object({
  email: z.string().email("invalid email"),
  password: z.string().min(1, "password required"),
});

type FormValues = z.infer<typeof schema>;

export default function Login() {
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
      const data = await login(values);
      setAuth(data.user, data.access_token, data.refresh_token);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "login failed";
      setServerError(msg);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-pulse-50 text-ink-900 p-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm space-y-4 bg-white border border-pulse-100 p-8 rounded-2xl shadow-sm animate-slide-up"
      >
        <div className="text-center mb-4">
          <div className="w-14 h-14 mx-auto mb-2 rounded-2xl bg-gradient-to-br from-pulse-300 to-pulse-500 flex items-center justify-center text-2xl">
            💗
          </div>
          <h1 className="text-2xl font-bold text-ink-900">Pulse</h1>
          <p className="text-sm text-muted">Bon retour parmi nous.</p>
        </div>

        <div>
          <label className="block text-sm mb-1 text-ink-700">Email</label>
          <input
            type="email"
            {...register("email")}
            className="w-full px-3 py-2 rounded-xl bg-pulse-50 border border-pulse-100 focus:outline-none focus:border-pulse-400"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1 text-ink-700">Mot de passe</label>
          <input
            type="password"
            {...register("password")}
            className="w-full px-3 py-2 rounded-xl bg-pulse-50 border border-pulse-100 focus:outline-none focus:border-pulse-400"
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        {serverError && <p className="text-red-500 text-sm">{serverError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full"
        >
          {isSubmitting ? "Connexion…" : "Se connecter"}
        </button>

        <p className="text-sm text-muted text-center">
          Pas de compte ?{" "}
          <Link to="/register" className="text-pulse-500 font-medium hover:underline">
            Créer
          </Link>
        </p>
      </form>
    </div>
  );
}
