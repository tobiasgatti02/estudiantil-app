import SidebarStudent from "@/app/components/alumnos/SidebarStudent";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row">
      <SidebarStudent />
      <main className="flex-1 p-4 ">{children}</main>
    </div>
  );
}