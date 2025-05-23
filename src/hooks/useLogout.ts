import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const useLogout = () => {
  const router = useRouter();

  const logout = () => {
    Cookies.remove("userID");
    router.push("/");
  };

  return logout;
};

export default useLogout;
