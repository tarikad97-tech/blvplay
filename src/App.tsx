import type { ReactNode } from "react";
import { ResultProvider } from "./context/ResultContext";
import { SiteLayout } from "./layout/SiteLayout";
import { matchPath, usePathname } from "./lib/router";
import { CreatorSession } from "./pages/CreatorSession";
import { FanPlay } from "./pages/FanPlay";
import { ModeSelect } from "./pages/ModeSelect";
import { Results } from "./pages/Results";
import { Challenges } from "./pages/site/Challenges";
import { Contact } from "./pages/site/Contact";
import { ArticlePage, Football } from "./pages/site/Football";
import { About, Faq, HowItWorks, NotFound } from "./pages/site/Info";
import { Landing } from "./pages/site/Landing";
import { CookiePolicy, Privacy, Terms } from "./pages/site/Legal";

interface Route {
  path: string;
  /** "bare" pages are full-screen (camera studios, games) with no site header/footer. */
  layout: "site" | "bare";
  render: (params: Record<string, string>) => ReactNode;
}

const ROUTES: readonly Route[] = [
  { path: "/", layout: "site", render: () => <Landing /> },
  { path: "/challenges", layout: "site", render: () => <Challenges /> },
  { path: "/create", layout: "site", render: () => <ModeSelect mode="creator" /> },
  { path: "/create/:id", layout: "bare", render: (p) => <CreatorSession key={p.id} id={p.id} /> },
  { path: "/play", layout: "site", render: () => <ModeSelect mode="fan" /> },
  { path: "/play/:id", layout: "bare", render: (p) => <FanPlay key={p.id} id={p.id} /> },
  { path: "/results", layout: "site", render: () => <Results /> },
  { path: "/how-it-works", layout: "site", render: () => <HowItWorks /> },
  { path: "/about", layout: "site", render: () => <About /> },
  { path: "/contact", layout: "site", render: () => <Contact /> },
  { path: "/football", layout: "site", render: () => <Football /> },
  { path: "/football/:slug", layout: "site", render: (p) => <ArticlePage slug={p.slug} /> },
  { path: "/faq", layout: "site", render: () => <Faq /> },
  { path: "/privacy-policy", layout: "site", render: () => <Privacy /> },
  { path: "/terms", layout: "site", render: () => <Terms /> },
  { path: "/cookie-policy", layout: "site", render: () => <CookiePolicy /> }
];

function Routes() {
  const pathname = usePathname();
  for (const route of ROUTES) {
    const params = matchPath(route.path, pathname);
    if (!params) continue;
    const page = route.render(params);
    return route.layout === "site" ? <SiteLayout>{page}</SiteLayout> : <>{page}</>;
  }
  return <SiteLayout><NotFound /></SiteLayout>;
}

export function App() {
  return (
    <ResultProvider>
      <Routes />
    </ResultProvider>
  );
}
