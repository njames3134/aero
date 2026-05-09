import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  const linkClass = (path: string) =>
    `px-4 py-2 rounded-lg ${
      location.pathname === path
        ? "bg-blue-500 text-white"
        : "text-gray-600 hover:bg-gray-200"
    }`;

  return (
    <div className="flex gap-4 p-4 border-b">
      <Link to="/" className={linkClass("/")}>
        Dashboard
      </Link>

      <Link to="/activities" className={linkClass("/activities")}>
        Activities
      </Link>
    </div>
  );
}
