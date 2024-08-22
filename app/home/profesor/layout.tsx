import SidebarTeacher from "@/app/components/adminManagement/sideBar/sideBarTeacher";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row">
      <SidebarTeacher />
      <main className="flex-1 p-4 ">{children}</main>
    </div>
  );
}