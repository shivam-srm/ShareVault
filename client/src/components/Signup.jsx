import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { registerUser } from "../redux/slice/auth/authThunk";

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({ email: "", fullname: "", password: "" });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.fullname || !formData.password) {
      toast.error("Please fill all the fields");
      return;
    }
    try {
      const result = await dispatch(registerUser(formData));
      if (result.error) {
        toast.error(result.payload);
      } else {
        toast.success("Account created — welcome to ShareVault!");
        navigate("/login");
      }
    } catch (err) {
      toast.error("Error during registration");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] aurora-bg flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg pointer-events-none" />

      <div className="relative w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left — pitch */}
        <div className="hidden lg:block animate-fade-up">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--primary-text)] mb-8 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" d="M19 12H5M12 19l-7-7 7-7" /></svg>
            Back to home
          </Link>

          <h1 className="text-5xl xl:text-6xl font-display font-bold leading-tight mb-6">
            Join <span className="gradient-text">ShareVault</span> in seconds.
          </h1>
          <p className="text-lg text-[var(--text-muted)] max-w-md mb-10">
            Free forever. No credit card. Unlimited beautiful shareable links.
          </p>

          <div className="space-y-4">
            {[
              { icon: "✨", text: "Free forever plan, no strings attached" },
              { icon: "🚀", text: "Faster uploads with your own dashboard" },
              { icon: "💎", text: "Priority support & premium themes" },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-4 glass rounded-2xl p-4 hover-lift animate-fade-up stagger-${i + 2}`}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: "var(--primary-soft)" }}>{item.icon}</div>
                <p className="font-medium">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — form */}
        <div className="glass-strong rounded-3xl p-8 sm:p-10 shadow-2xl animate-scale-in relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-40" style={{ background: "var(--gradient-aurora)" }} />

          <div className="relative">
            <div className="lg:hidden mb-4">
              <Link to="/" className="text-sm text-[var(--text-muted)]">← Back</Link>
            </div>
            <h2 className="text-3xl font-display font-bold mb-2">Create account</h2>
            <p className="text-[var(--text-muted)] mb-8">Start sharing in under a minute.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-[var(--text-dim)] mb-2">Full name</label>
                <input
                  className="input-premium"
                  type="text"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  placeholder="Jane Doe"
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-[var(--text-dim)] mb-2">Email</label>
                <input
                  className="input-premium"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-[var(--text-dim)] mb-2">Password</label>
                <input
                  className="input-premium"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-premium w-full mt-2 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" d="M5 12h14M13 5l7 7-7 7" /></svg>
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-sm text-center text-[var(--text-muted)]">
              Already have an account?{" "}
              <Link to="/login" className="text-[var(--primary-text)] font-semibold hover:underline">Log in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
