import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default async function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <Header />
      <main id="main" style={{ paddingTop: "80px" }}>
        {children}
      </main>
      <Footer />
    </>
  );
}
