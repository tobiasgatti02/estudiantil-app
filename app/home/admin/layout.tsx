import Sidebar from "@/app/components/adminManagement/sideBar/sideBar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full">
      <Sidebar />
      
      <main className="flex-1 p-4 min-h-full ">{children}</main>
    </div>
  );
}
