import { createReader } from "@keystatic/core/reader";
import config from "../../../keystatic.config";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FadeInObserver from "@/components/FadeInObserver";

export default async function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const reader = createReader(process.cwd(), config);
  const siteSettings = await reader.singletons.siteSettings.read();

  const enabledRoutes = siteSettings?.enabledRoutes ?? {
    blog: true,
    projects: true,
    contact: true,
  };

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <Nav enabledRoutes={enabledRoutes} />
      <main id="main">{children}</main>
      <Footer />
      <FadeInObserver />
    </>
  );
}
