import Link from "next/link";
import { ExternalLink, Mail, Phone } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { brand } from "@/lib/brand";
import { getLanguage } from "@/lib/i18n-server";

export async function Footer() {
  const {
    messages: { nav, footer },
  } = await getLanguage();
  return (
    <footer className="border-t border-white/10 bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-6">
        <div>
          <Logo />
          <p className="mt-4 max-w-md text-sm leading-7">{footer.tagline}</p>
          <div className="mt-5 flex gap-3">
            <a
              href={brand.facebookUrl}
              className="rounded-lg border border-white/10 p-2"
              aria-label="Facebook"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
            <a
              href={`mailto:${brand.supportEmail}`}
              className="rounded-lg border border-white/10 p-2"
              aria-label="Email"
            >
              <Mail className="h-4 w-4" />
            </a>
            <a
              href={`tel:${brand.phone}`}
              className="rounded-lg border border-white/10 p-2"
              aria-label="Phone"
            >
              <Phone className="h-4 w-4" />
            </a>
          </div>
        </div>
        <FooterLinks
          title={footer.learn}
          links={[
            [nav.articles, "/articles"],
            [nav.courses, "/courses"],
            [footer.schedule, "/schedule"],
            [footer.faq, "/faq"],
          ]}
        />
        <FooterLinks
          title={footer.portals}
          links={[
            [footer.student, "/student"],
            [footer.instructor, "/instructor"],
            [footer.admin, "/admin"],
            [footer.register, "/register"],
          ]}
        />
        <FooterLinks
          title={footer.legal}
          links={[
            [footer.privacy, "/privacy"],
            [footer.terms, "/terms"],
            [footer.refund, "/refund-policy"],
            [nav.contact, "/contact"],
          ]}
        />
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} 21st Century Technology. {footer.copyright}
      </div>
    </footer>
  );
}

function FooterLinks({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h3 className="font-bold text-white">{title}</h3>
      <div className="mt-4 grid gap-2 text-sm">
        {links.map(([label, href]) => (
          <Link key={href} href={href} className="hover:text-cyan-200">
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
