/**
 * AuroraBackground — fixed-position, full-viewport layer of soft drifting
 * gradient blobs that create a premium "alive" feeling behind all content.
 *
 * Pointer-events: none — never blocks clicks.
 * z-index: -10 (behind everything).
 */
export default function AuroraBackground() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      style={{
        background:
          'radial-gradient(1200px 600px at 20% 0%, rgba(99,102,241,0.07), transparent 60%),' +
          'radial-gradient(1000px 500px at 100% 30%, rgba(168,85,247,0.06), transparent 60%),' +
          'radial-gradient(900px 700px at 50% 100%, rgba(236,72,153,0.05), transparent 60%)',
      }}
    >
      {/* Slow drifting blobs */}
      <div
        className="aurora-blob"
        style={{
          width: 480,
          height: 480,
          top: '-10%',
          left: '5%',
          background:
            'radial-gradient(circle at 30% 30%, rgba(99,102,241,0.55), rgba(99,102,241,0) 70%)',
          animationDelay: '0s',
        }}
      />
      <div
        className="aurora-blob"
        style={{
          width: 420,
          height: 420,
          top: '20%',
          right: '8%',
          background:
            'radial-gradient(circle at 60% 40%, rgba(168,85,247,0.5), rgba(168,85,247,0) 70%)',
          animationDelay: '-7s',
        }}
      />
      <div
        className="aurora-blob"
        style={{
          width: 520,
          height: 520,
          bottom: '-10%',
          left: '40%',
          background:
            'radial-gradient(circle at 50% 50%, rgba(236,72,153,0.4), rgba(236,72,153,0) 70%)',
          animationDelay: '-14s',
        }}
      />

      {/* Subtle dot grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            'radial-gradient(rgba(99,102,241,0.18) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage:
            'radial-gradient(ellipse 80% 60% at 50% 50%, #000 30%, transparent 80%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 60% at 50% 50%, #000 30%, transparent 80%)',
        }}
      />
    </div>
  );
}
