import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { gestionSections } from "../config/gestionPages";

type GestionSidebarNavProps = {
  onNavigate?: () => void;
};

export default function GestionSidebarNav({
  onNavigate,
}: GestionSidebarNavProps) {
  const location = useLocation();
  const activeSection = gestionSections.find((section) =>
    section.actions.some((action) => action.path === location.pathname),
  );
  const [selectedSection, setSelectedSection] = useState<string>();
  const expandedSection = selectedSection ?? activeSection?.title;

  const toggleSection = (sectionTitle: string) => {
    setSelectedSection(
      expandedSection === sectionTitle ? "" : sectionTitle,
    );
  };

  return (
    <div className="space-y-2">
      <NavLink
        to="/gestion"
        end
        onClick={onNavigate}
        className={({ isActive }) =>
          [
            "flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition",
            isActive
              ? "bg-lime-400 text-black"
              : "text-gray-300 hover:bg-white/[0.06] hover:text-white",
          ].join(" ")
        }
      >
        <i className="ri-dashboard-line text-xl" />
        Dashboard
      </NavLink>

      {gestionSections.map((section) => {
        const isExpanded = expandedSection === section.title;
        const isActive = section.actions.some(
          (action) => action.path === location.pathname,
        );

        return (
          <div key={section.title}>
            <button
              type="button"
              onClick={() => toggleSection(section.title)}
              aria-expanded={isExpanded}
              className={[
                "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold transition",
                isActive
                  ? "bg-lime-400/10 text-lime-300"
                  : "text-gray-300 hover:bg-white/[0.06] hover:text-white",
              ].join(" ")}
            >
              <i className={`${section.icon} text-xl`} />
              <span className="flex-1">{section.title}</span>
              <i
                className={[
                  "ri-arrow-down-s-line text-lg transition-transform",
                  isExpanded ? "rotate-180" : "",
                ].join(" ")}
              />
            </button>

            {isExpanded && (
              <div className="ml-6 mt-1 space-y-1 border-l border-white/10 pl-3">
                {section.actions.map((action) => (
                  <NavLink
                    key={action.path}
                    to={action.path}
                    onClick={() => {
                      setSelectedSection(section.title);
                      onNavigate?.();
                    }}
                    className={({ isActive: isActionActive }) =>
                      [
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
                        isActionActive
                          ? "bg-lime-400 text-black"
                          : "text-gray-400 hover:bg-white/[0.06] hover:text-white",
                      ].join(" ")
                    }
                  >
                    <i className={`${action.icon} text-lg`} />
                    <span>{action.title}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
