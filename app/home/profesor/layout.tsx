import Sidebar from "@/app/components/adminManagement/sideBar/sideBar";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 p-4 ">{children}</main>
    </div>
  );
}