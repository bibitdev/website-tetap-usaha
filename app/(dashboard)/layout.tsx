import Sidebar from "@/app/components/Sidebar";
import TopNav from "@/app/components/TopNav";
import StockModal from "@/app/components/StockModal";
import Providers from "@/app/components/Providers";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="flex w-full min-h-screen bg-surface-50">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopNav />
          <main className="flex-1 px-4 lg:px-8 py-4 lg:py-6 space-y-4 lg:space-y-6">{children}</main>
        </div>
        <StockModal />
      </div>
    </Providers>
  );
}
