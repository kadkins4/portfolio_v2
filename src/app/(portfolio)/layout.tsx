import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FadeInObserver from "@/components/FadeInObserver";

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="skip-link">Skip to main content</a>
      <Nav />
      <main id="main">{children}</main>
      <Footer />
      <FadeInObserver />
    </>
  );
}
