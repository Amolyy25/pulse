import { useAuthStore } from "../store/authStore";
import { logout as logoutApi } from "../api/auth";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const setAuth = useAuthStore((s) => s.setAuth);
  const storeLogout = useAuthStore((s) => s.logout);

  const isAuthenticated = !!accessToken && !!refreshToken;

  async function logout() {
    const token = useAuthStore.getState().refreshToken;
    if (token) {
      try {
        await logoutApi(token);
      } catch {
        // ignore
      }
    }
    storeLogout();
  }

  return { user, accessToken, refreshToken, isAuthenticated, setAuth, logout };
}
