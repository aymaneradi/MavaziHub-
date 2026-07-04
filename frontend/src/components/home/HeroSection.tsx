function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-visual" aria-hidden="true">
        <div className="fabric-panel fabric-panel-left" />
        <div className="model-card">
          <div className="dress-shape" />
        </div>
        <div className="fabric-panel fabric-panel-right" />
      </div>

      <div className="shipping-strip">
        <span>Kostenloser Versand ab 75 EUR</span>
        <span>Kunden bewerten uns mit 5 Sternen</span>
      </div>
    </section>
  )
}

export default HeroSection
