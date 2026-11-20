/** Issue 1 intentionally has no authentication, owner data, published portfolio or chatbot. */
const principles = [
  { title: 'Content', detail: 'Typed content and reusable portfolio information.' },
  { title: 'Composition', detail: 'Safe responsive visual layouts, independent of stored content.' },
  { title: 'Publishing', detail: 'Explicit, versioned publication separated from private drafts.' },
] as const;
export default function HomePage() {
  return <>
    <header className="site-header"><span className="brand">Gilded<span>In</span></span><span className="phase">Foundation / Issue 2</span></header>
    <main id="main" className="main-wrap">
      <section className="hero" aria-labelledby="hero-title">
        <span className="eyebrow">A NEW FOUNDATION FOR DISTINCTIVE PORTFOLIOS</span>
        <h1 id="hero-title">Your story.<br /><span>Your space.</span></h1>
        <p>GildedIn is being engineered as a free, accessible portfolio platform. This installation is the architectural foundation, not an active publishing service.</p>
        <div className="status-line" role="status"><span className="dot" aria-hidden="true" /> Sign-in, editing and publishing are not yet available.</div>
      </section>
      <section className="modules" aria-label="Future product engines">
        {principles.map((item,index) => <article className="module" key={item.title}>
          <span className="module-index">0{index+1} / ENGINE</span><h2>{item.title}</h2><p>{item.detail}</p>
        </article>)}
      </section>
      <p className="foundation-note">No private portfolio data or production providers are connected in Issue 2.</p>
    </main>
    <footer className="footer">GildedIn · Specification-led architecture · <a href="/login">Account availability</a></footer>
  </>;
}
