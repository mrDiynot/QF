'use client';

const MESH_SVG =
  "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")";

export function LoginPageBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Deep purple orb — top right */}
      <div
        className="absolute -top-48 -right-48 w-[750px] h-[750px] rounded-full animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(109,40,217,0.45), transparent 70%)',
          filter: 'blur(90px)',
          animationDuration: '8s',
        }}
      />
      {/* Violet orb — bottom left */}
      <div
        className="absolute -bottom-48 -left-48 w-[700px] h-[700px] rounded-full animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(76,29,149,0.5), transparent 70%)',
          filter: 'blur(90px)',
          animationDuration: '10s',
          animationDelay: '2s',
        }}
      />
      {/* Subtle orange accent — bottom right (reduced) */}
      <div
        className="absolute bottom-0 right-0 w-[350px] h-[350px] rounded-full animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(255,87,34,0.12), transparent 70%)',
          filter: 'blur(80px)',
          animationDuration: '12s',
          animationDelay: '4s',
        }}
      />
      {/* Mesh grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: MESH_SVG }}
      />
    </div>
  );
}
