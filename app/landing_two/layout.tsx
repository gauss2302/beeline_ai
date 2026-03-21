import "@fontsource/geist-sans/latin.css";

export default function LandingTwoLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen font-geist"
      style={{
        // Color system (HSL)
        ["--lt-bg" as string]: "260 87% 3%",
        ["--lt-foreground" as string]: "40 6% 95%",
        ["--lt-primary" as string]: "121 95% 76%",
        ["--lt-primary-foreground" as string]: "0 0% 5%",
        ["--lt-hero-heading" as string]: "40 10% 96%",
        ["--lt-hero-sub" as string]: "40 6% 82%",
        ["--lt-muted" as string]: "240 4% 16%",
        ["--lt-border" as string]: "240 4% 20%"
      }}
    >
      {children}
    </div>
  );
}
