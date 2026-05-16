import { NavLink } from "./ui/nav-link";

export default function Navbar() {
  return (
    <div className="flex gap-4 border-b border-zinc-800 p-4">
      <NavLink to="/">
        Dashboard
      </NavLink>

      <NavLink to="/activities">
        Activities
      </NavLink>
    </div>
  );
}
