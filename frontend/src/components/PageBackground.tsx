function PageBackground() {
    return (
      <>
        <div className="fixed inset-0 z-0 pointer-events-none" style={{
          background: `
            radial-gradient(ellipse 80% 50% at 10% 20%, rgba(99,102,241,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 90% 80%, rgba(139,92,246,0.06) 0%, transparent 60%),
            #04040a
          `
        }} />
        <div className="fixed inset-0 z-0 pointer-events-none" style={{
          backgroundImage: `
            linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} />
      </>
    )
  }
  
  export default PageBackground