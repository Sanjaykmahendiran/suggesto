import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useCallback } from "react";

const useLogout = () => {
  const router = useRouter();

  const logout = useCallback(() => {
    try {
      // Clear all cookies
      Cookies.remove("userID");
      
      // Force a clean navigation to avoid hook order issues
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