import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div>
      <h2>Main Layout</h2>
      <Outlet />
    </div>
  );
}