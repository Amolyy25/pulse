import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import { SvgDefs } from "../components/SvgDefs";

const schema = z.object({
  email: z.string().email("email invalide"),
  password: z.string().min(1, "mot de passe requis"),
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
          ?.error ?? "connexion impossible";
      setServerError(msg);
    }
  }

  return (
    <div className="app-bg min-h-screen relative">
      <SvgDefs />
      <div className="blob" style={{ width: 360, height: 360, background: "var(--grad-amber)", top: -100, left: -90 }} />
      <div className="blob" style={{ width: 320, height: 320, background: "var(--grad-rose)", bottom: -80, right: -120 }} />

      <div className="relative z-10 min-h-screen grid sm:grid-cols-2">
        {/* Editorial left */}
        <div className="hidden sm:flex flex-col justify-between p-10 lg:p-14">
          <div>
            <div className="eyebrow">Pulse</div>
            <h1 className="display-xl text-[3.6rem] leading-[0.95] mt-2 max-w-md">
              Tes <span className="flourish">habitudes</span>,<br />en douceur.
            </h1>
          </div>
          <p className="font-display italic text-ink-soft text-lg max-w-sm">
            "On devient ce qu'on répète. Choisis ce qui te ressemble."
          </p>
        </div>

        {/* Form right */}
        <div className="flex items-center justify-center p-6 sm:p-10">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full max-w-sm card p-7 animate-slide-up relative overflow-hidden"
          >
            <div className="sm:hidden mb-5">
              <div className="eyebrow">Pulse</div>
              <h1 className="display text-3xl mt-1">Bon retour</h1>
            </div>
            <div className="hidden sm:block mb-5">
              <div className="eyebrow">Connexion</div>
              <h2 className="display text-2xl mt-1">Bon retour</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                  className="input"
                />
                {errors.email && (
                  <p className="text-rose-500 text-xs mt-1.5">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="label">Mot de passe</label>
                <input
                  type="password"
                  autoComplete="current-password"
                  {...register("password")}
                  className="input"
                />
                {errors.password && (
                  <p className="text-rose-500 text-xs mt-1.5">{errors.password.message}</p>
                )}
              </div>

              {serverError && (
                <div className="text-sm text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                  {serverError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full justify-center"
              >
                {isSubmitting ? "…" : "Se connecter"}
              </button>

              <p className="text-sm text-muted text-center pt-1">
                Pas de compte ?{" "}
                <Link to="/register" className="text-rose-500 font-semibold hover:underline">
                  En créer un
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
