import type {Metadata} from 'next';
import {PlatformShell} from '../../ui/design/platform-shell.tsx';
import {TechnicalFrame} from '../../ui/design/technical-frame.tsx';
import {IntroHeading} from '../../ui/design/intro.tsx';
import {requireTenancyRepository} from '../../bootstrap/identity-runtime.ts';
import {loadServerEnvironment} from '../../server/config/server.ts';
import type {PublicDirectoryItem} from '../../domain/tenancy/ports.ts';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'GildedIn — Make your work yours',
  description:'Create a thoughtful professional portfolio with reusable content, responsive composition and explicit publication.',
  robots:{index:false,follow:false}}; // Production launch and verified public indexing are later gates.
const features=[
  {index:'01',title:'Start with your story',description:'Introduce yourself without needing a project, job title from an employer, or technical setup.'},
  {index:'02',title:'Shape it your way',description:'Build with safe responsive components and reusable, typed content. Visual canvas controls are being introduced in stages.'},
  {index:'03',title:'You decide when it is public',description:'Create a private draft first; publication requires a separate reviewed action. Gilden is opt-in, not assumed.'}
] as const;
async function publishedExamples():Promise<PublicDirectoryItem[]>{
  try{const env=loadServerEnvironment();
    return (await (await requireTenancyRepository()).directory(env.APP_CANONICAL_ORIGIN)).slice(0,3);
  }catch{return [];} // Missing provider is not evidence of an eligible published example.
}
export default async function HomePage(){
  const examples=await publishedExamples();
  return <PlatformShell><main id="main" className="gi-main">
    <section className="gi-hero-grid" aria-labelledby="gi-intro-heading">
      <div className="gi-hero-copy"><p className="gi-eyebrow">PORTFOLIOS BUILT AROUND YOU</p>
        <div id="gi-intro-heading"><IntroHeading title="Your story." accent="Your space."/></div>
        <p className="gi-lead">A portfolio that reflects your work, your thinking and the professional you are becoming. Start simple; build something distinctive as you go.</p>
        <div className="gi-hero-actions"><a className="gi-link-button" href="/dashboard/onboarding">Create your portfolio</a>
          <a className="gi-button gi-button-secondary" href="/#gi-foundations">See how it works</a></div>
        <p className="gi-small-copy">Sign in with Google or GitHub. No password, payment card or automatically published profile.</p>
      </div>
      <TechnicalFrame as="article" className="gi-hero-sidebar" variant="precision-02">
        <span className="gi-status-pill">YOUR STARTING POINT</span><h2>Make it professional. Make it personal.</h2>
        <p>Begin with a name, a role and a short introduction. Add projects when you have them. Choose a clean starting design and edit your private draft.</p>
        <div className="gi-stage-note">Public publishing, media uploads and full visual canvas editing are released only after their separate security and reliability checks.</div>
      </TechnicalFrame>
    </section>
    <section id="gi-vision" className="gi-feature-section" aria-labelledby="gi-vision-heading">
      <p className="gi-eyebrow">BUILT FOR CLARITY</p><h2 className="gi-section-heading" id="gi-vision-heading">A place for your work to speak.</h2>
      <p className="gi-feature-intro">Design freedom with readable content, accessible navigation and a static fallback whenever visual effects are unavailable.</p>
      <div id="gi-foundations" className="gi-feature-grid">
        {features.map(x=><TechnicalFrame key={x.index} as="article" className="gi-feature-card">
          <span className="gi-feature-index">{x.index} / THE EXPERIENCE</span><h3>{x.title}</h3><p>{x.description}</p>
        </TechnicalFrame>)}
      </div>
    </section>
    <section id="gi-portfolios" className="gi-feature-section" aria-labelledby="gi-portfolios-heading">
      <p className="gi-eyebrow">RELEASED WORK ONLY</p><h2 className="gi-section-heading" id="gi-portfolios-heading">Published portfolios</h2>
      {examples.length?<div className="gi-feature-grid">{examples.map(e=><TechnicalFrame key={e.portfolioId} as="article" className="gi-feature-card">
        <span className="gi-feature-index">PUBLIC PORTFOLIO</span><h3>{e.title}</h3>
        <a href={e.canonicalUrl}>View published portfolio</a></TechnicalFrame>)}</div>:
        <div className="gi-owner-panel"><p>No eligible published portfolios are available to feature right now.</p>
          <p>Unlisted, unpublished and owner-disabled drafts never appear here. <a href="/dashboard/onboarding">Start your own private draft.</a></p></div>}
    </section>
  </main></PlatformShell>;
}
