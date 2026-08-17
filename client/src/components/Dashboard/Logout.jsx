import { useDispatch } from "react-redux";
import { logoutUser } from "../../redux/slice/auth/authSlice";
import { useEffect } from "react";

const Logout = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const logoutUserFromStorage = async () => {
      await dispatch(logoutUser());
      window.location.href = "/login";
    };
    logoutUserFromStorage();
  }, [dispatch]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center animate-fade-in">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[var(--gradient-aurora)] shadow-[var(--shadow-glow)] animate-float" />
        <h1 className="text-2xl font-bold font-display bg-clip-text text-transparent bg-[var(--gradient-aurora)]">
          Signing you out…
        </h1>
        <p className="text-[var(--text-muted,#94a3b8)] text-sm mt-2">See you again soon on ShareVault</p>
      </div>
    </div>
  );
};

export default Logout;
