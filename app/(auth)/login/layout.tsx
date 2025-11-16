import { Footer } from "../../(marketing)/_components/footer";

const MarketingLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="h-full">
            <main>{children}</main>
            <Footer />
        </div>
    );
};

export default MarketingLayout;