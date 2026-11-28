/** Issue 8 design-system showcase. Issue 9 will implement public marketing/onboarding. */
import {PlatformShell} from '../../ui/design/platform-shell.tsx';
import {TechnicalFrame} from '../../ui/design/technical-frame.tsx';
import {IntroHeading} from '../../ui/design/intro.tsx';
const foundations=[
  {index:'01',title:'Typed content',description:'Professional stories have a safe home in reusable, owner-controlled fields.'},
  {index:'02',title:'Creative composition',description:'Arrange structured content with bounded responsive building blocks, without writing scripts.'},
  {index:'03',title:'Deliberate publishing',description:'Private drafts stay private until an explicit validated release is activated.'}
] as const;
export default function HomePage(){
  return <PlatformShell><main id="main" className="gi-main">
    <section className="gi-hero-grid" aria-labelledby="gi-intro-heading">
      <div className="gi-hero-copy"><p className="gi-eyebrow">PORTFOLIOS WITH A POINT OF VIEW</p>
        <div id="gi-intro-heading"><IntroHeading title="Your story." accent="Your space."/></div>
        <p className="gi-lead">A place to shape your professional work with clarity, ownership, and a little cinematic depth. Real content first. Everything else is an enhancement.</p>
        <div className="gi-hero-actions"><a className="gi-link-button" href="#gi-foundations">Explore the foundations</a>
          <a className="gi-button gi-button-secondary" href="/login">Account availability</a></div>
        <p className="gi-small-copy">Keyboard navigation, reduced-motion settings and readable content are supported without WebGL.</p>
      </div>
      <TechnicalFrame as="article" className="gi-hero-sidebar" variant="precision-02">
        <span className="gi-status-pill">Implementation preview</span>
        <h2>A framework, not a finished service.</h2>
        <p>The visual language and safe composition engine are being built against GildedIn’s specifications. Registration, live editing and public publishing are not enabled here.</p>
        <div className="gi-stage-note">Issue 8 implements shared appearance and progressive motion. No portfolio is automatically published, and no real user data is used in this showcase.</div>
      </TechnicalFrame>
    </section>
    <section id="gi-vision" className="gi-feature-section" aria-labelledby="gi-vision-heading">
      <p className="gi-eyebrow">QUIETLY CAPABLE DESIGN</p><h2 className="gi-section-heading" id="gi-vision-heading">Precision without noise.</h2>
      <p className="gi-feature-intro">The same technical language works as a calm static page, a responsive portfolio, or a measured cinematic experience.</p>
      <div id="gi-foundations" className="gi-feature-grid">
        {foundations.map(x=><TechnicalFrame key={x.index} as="article" className="gi-feature-card">
          <span className="gi-feature-index">{x.index} / FOUNDATION</span><h3>{x.title}</h3><p>{x.description}</p>
        </TechnicalFrame>)}
      </div>
    </section>
  </main></PlatformShell>;
}
