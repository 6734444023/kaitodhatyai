import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../providers/AuthProvider";

/* ----------------- Admin Route Guard ----------------- */
export default function AdminRouteGuard({
  children,
}: {
  children?: React.ReactNode;
}) {
  const authCtx = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (authCtx.loading || authCtx.isAdmin === null) {
    return (
      <div className="center-screen">
        <div className="spinner" aria-hidden />
        <div className="muted">Checking access…</div>
      </div>
    );
  }

  if (!authCtx.user) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  if (!authCtx.isAdmin) {
    return (
      <div className="center-screen">
        <div className="card">
          <h3>ไม่มีสิทธิ์เข้าถึง</h3>
          <p className="muted">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
          <button
            className="btn btn-primary mt-2"
            onClick={() => navigate("/admin-login")}
          >
            กลับหน้าเข้าสู่ระบบของแอดมิน
          </button>
        </div>
      </div>
    );
  }

  return <>{children ?? <Outlet />}</>;
}
