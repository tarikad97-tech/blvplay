import { useEffect, useState, type ReactNode } from "react";
import { Link, usePathname } from "../lib/router";

const NAV = [
  { to: "/", label: "الرئيسية" },
  { to: "/challenges", label: "التحديات" },
  { to: "/how-it-works", label: "كيف تعمل المنصة" },
  { to: "/about", label: "من نحن" }
];

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="BLV Play — الرئيسية">
      <span className="logo__mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 7.2l4.2 3-1.6 4.9H9.4L7.8 10.2z" fill="currentColor" />
        </svg>
      </span>
      <span className="logo__text" dir="ltr">BLV <b>Play</b></span>
    </Link>
  );
}

function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="header">
      <div className="container header__inner">
        <Logo />
        <nav className={open ? "nav is-open" : "nav"} aria-label="التنقل الرئيسي" id="main-nav">
          {NAV.map((item) => (
            <Link key={item.to} to={item.to} className={pathname === item.to ? "nav__link is-active" : "nav__link"}>
              {item.label}
            </Link>
          ))}
          <Link to="/play" className="btn btn--primary nav__cta">ابدأ اللعب</Link>
        </nav>
        <button
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="main-nav"
          aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
          onClick={() => setOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Logo />
          <p>منصتك لتحديات كرة القدم التفاعلية</p>
        </div>
        <FooterCol title="استكشف" links={[
          ["/", "الرئيسية"], ["/challenges", "التحديات"], ["/create", "صانع المحتوى"],
          ["/play", "وضع المشجع"], ["/football", "مركز المقالات"]
        ]} />
        <FooterCol title="معلومات" links={[
          ["/about", "من نحن"], ["/how-it-works", "كيف تعمل المنصة"], ["/faq", "الأسئلة الشائعة"], ["/contact", "اتصل بنا"]
        ]} />
        <FooterCol title="السياسات" links={[
          ["/privacy-policy", "سياسة الخصوصية"], ["/terms", "شروط الاستخدام"], ["/cookie-policy", "سياسة Cookies"]
        ]} />
      </div>
      <div className="container footer__bottom">
        <small>© {new Date().getFullYear()} BLV Play. جميع الحقوق محفوظة.</small>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div className="footer__col">
      <h2 className="footer__title">{title}</h2>
      <ul>
        {links.map(([to, label]) => (
          <li key={to}><Link to={to}>{label}</Link></li>
        ))}
      </ul>
    </div>
  );
}


export function SiteLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="site">
      <a href="#content" className="skip-link">
        تخطي إلى المحتوى
      </a>
      <Header />
      <main id="content" className="site__main">
        {children}
      </main>
      <Footer />
    </div>
  );
}
