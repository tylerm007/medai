import {
  UserIcon,
  ClipboardIcon,
  ClockIcon,
  BeakerIcon,
  ArchiveBoxIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  AdjustmentsHorizontalIcon,
  Squares2X2Icon,
  CubeIcon,
  ScaleIcon,
  Cog6ToothIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
  const { logout } = useAuth();
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 overflow-y-auto">
      <div className="p-4">
        {/* Logo */}
        <div className="flex justify-center items-center mb-8">
          <Image
            src="/medai_logo.png"
            alt="MedAI Logo"
            width={90}
            height={90}
            className="h-10 w-auto object-contain"
            priority
          />
        </div>

        <nav className="space-y-8">
          {/* Dashboard */}
          <div>
            <SidebarItem
              name="Patient"
              icon={UserIcon}
              href="/patient"
            />
          </div>
          {/* Patient Management */}
          <SidebarSection title="Patient Management">
            <SidebarItem
              name="Search Patient"
              icon={MagnifyingGlassIcon}
              href="/search-patient"
            />
            <SidebarItem
              name="Blood Sugar Readings"
              icon={ClipboardIcon}
              href="/blood-sugar-readings"
            />
            <SidebarItem name="History" icon={ClockIcon} href="/history-readings" />
            <SidebarItem
              name="Patient Labs"
              icon={BeakerIcon}
              href="/patient-labs"
            />
            <SidebarItem
              name="Medications"
              icon={ArchiveBoxIcon}
              href="/medications"
            />
            <SidebarItem
              name="Recommendations"
              icon={LightBulbIcon}
              href="/recommendations"
            />
          </SidebarSection>

          {/* Drug Management */}
          <SidebarSection title="Drug Management">
            <SidebarItem
              name="Contraindication"
              icon={ExclamationTriangleIcon}
              href="/contraindication"
            />
            <SidebarItem
              name="Drug Dosage"
              icon={AdjustmentsHorizontalIcon}
              href="/drug-dosage"
            />
            <SidebarItem name="Drugs" icon={Squares2X2Icon} href="/drugs" />
            <SidebarItem name="Drug Unit" icon={CubeIcon} href="/drug-unit" />
            <SidebarItem
              name="Insulin Rules"
              icon={ScaleIcon}
              href="/insulin-rules"
            />
          </SidebarSection>

          {/* Settings */}
          <SidebarSection title="Settings">
            <SidebarItem
              name="Settings"
              icon={Cog6ToothIcon}
              href="/settings"
            />
            <SidebarItem
              name="About"
              icon={InformationCircleIcon}
              href="/about"
            />
            <SidebarItem
              name="Logout"
              icon={ArrowRightOnRectangleIcon}
              onClick={logout}
            />
          </SidebarSection>
        </nav>
      </div>
    </aside>
  );
}

// SidebarSection Component
function SidebarSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="text-gray-400 uppercase tracking-wide text-xs font-semibold px-3 mb-3">
        {title}
      </h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

// SidebarItem Component
function SidebarItem({
  name,
  icon: Icon,
  href,
  onClick,
}: {
  name: string;
  icon: any;
  href?: string;
  onClick?: () => void;
}) {
  const isButton = typeof onClick === "function";

  if (isButton) {
    return (
      <button
        onClick={onClick}
        className="flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-medical-secondary/10 rounded-lg transition-colors group"
      >
        <Icon className="h-5 w-5 mr-3 flex-shrink-0 text-medical-primary" />
        <span className="truncate text-left">{name}</span>
      </button>
    );
  }

  return (
    <a
      href={href}
      className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-medical-secondary/10 rounded-lg transition-colors group"
    >
      <Icon className="h-5 w-5 mr-3 flex-shrink-0 text-medical-primary" />
      <span className="truncate">{name}</span>
    </a>
  );
}
