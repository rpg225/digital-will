import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, FilePlus, RefreshCcw, Menu } from "lucide-react";
import { motion } from "framer-motion";

const links = [
  { to: "/", label: "Dashboard", icon: <Home size={20} /> },
  { to: "/create", label: "Create Will", icon: <FilePlus size={20} /> },
  { to: "/execute", label: "Execute Will", icon: <RefreshCcw size={20} /> },
  { to: "/mywill", label: "My Will", icon: <Menu size={20} /> },
];

const Sidebar = () => {
  const { pathname } = useLocation();

  return (
    <motion.aside
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="
        w-64 min-h-screen 
        bg-gradient-to-b from-[#0B1B34] to-[#0a0f17]
        border-r border-gold/20
        shadow-xl p-6
        flex flex-col
      "
    >

      {/* Brand / Logo */}
      <div className="mb-10">
        <h1 className="text-gold font-serif text-3xl tracking-wider">
          Digital Will
        </h1>
        <p className="text-slate/70 text-sm mt-1">
          Estate Dashboard
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col space-y-2">
        {links.map(link => {
          const isActive = pathname === link.to;

          return (
            <Link
              key={link.to}
              to={link.to}
              className={`
                group flex items-center gap-3 px-4 py-2 rounded-xl
                transition-all duration-300
                ${isActive 
                    ? "bg-gold text-navy font-semibold shadow-gold/30 shadow-md" 
                    : "text-slate/80 hover:bg-white/5 hover:text-gold"}
              `}
            >
              <span
                className={`transition-colors duration-300 ${
                  isActive ? "text-navy" : "text-gold group-hover:text-gold"
                }`}
              >
                {link.icon}
              </span>

              <span className="tracking-wide">{link.label}</span>
            </Link>
          );
        })}
      </nav>

    </motion.aside>
  );
};

export default Sidebar;
