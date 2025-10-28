import { useRouter } from "next/navigation";
// localStorage is used directly
import { useCallback } from "react";

const useLogout = () => {
  const router = useRouter();

  const logout = useCallback(() => {
    try {
      // Remove userID from localStorage
      localStorage.removeItem("userID");

      // Force a clean navigation
      window.location.href = "/auth/create-account";

    } catch (error) {
      console.error("Error during logout:", error);

      // Fallback navigation
      window.location.href = "/auth/create-account";
    }
  }, [router]);

  return logout;
};

export default useLogout;
