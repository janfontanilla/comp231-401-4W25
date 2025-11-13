import { Footer } from "./_components/footer";
import BootstrapNavbar from "./_components/bootstrap-navbar";

const MarketingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full">
      <BootstrapNavbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default MarketingLayout;
