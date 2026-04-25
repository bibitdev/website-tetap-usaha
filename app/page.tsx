import Sidebar from "./components/Sidebar";
import TopNav from "./components/TopNav";
import SummaryCards from "./components/SummaryCards";
import ProductTable from "./components/ProductTable";
import StockModal from "./components/StockModal";
import Providers from "./components/Providers";

export default function Home() {
  return (
    <Providers>
      <div className="flex w-full min-h-screen bg-surface-50">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopNav />
          <main className="flex-1 px-8 py-6 space-y-6">
            <SummaryCards />
            <ProductTable />
          </main>
        </div>
        <StockModal />
      </div>
    </Providers>
  );
}
