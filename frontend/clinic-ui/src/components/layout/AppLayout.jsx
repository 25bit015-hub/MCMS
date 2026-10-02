import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen">

      <Sidebar />

      <div className="ml-64 min-h-screen">

        <Topbar />

        <main className="min-h-[calc(100vh-72px)] p-8">
          {children}
        </main>

      </div>
    </div>
  );
}