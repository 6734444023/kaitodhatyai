/* eslint-disable @typescript-eslint/no-explicit-any */
import { Facebook } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../providers/AuthProvider";
import "./index.css";

/* ----------------- Admin Login Page ----------------- */
export const AdminLoginPage: React.FC = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // no-op: could redirect if already signed in from auth context watch
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="title">Admin Sign In</h2>
        <form onSubmit={onSubmit} className="form">
          <label className="label">
            <span className="label-text">Email</span>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="label">
            <span className="label-text">Password</span>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && <div className="error">{error}</div>}

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <hr />
        <p style={{ marginTop: "12px" }}>ไม่มีรหัสผ่าน? ติดต่อขอรหัสได้ที่</p>
        <a
          href="https://www.facebook.com/profile.php?id=61584432652391"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline flex items-center gap-2 text-blue-600 border-blue-600 hover:bg-blue-50"
        >
          <Facebook size={18} /> ติดต่อผู้ดูแลระบบ (Facebook)
        </a>
      </div>
    </div>
  );
};
