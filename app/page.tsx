import Scene from "@/components/3d_components/Scene";

export default function Home() {
  return (
     <>
      {/* 3D Scene */}
      <div className="fixed top-0 left-0 w-full h-screen">
        <Scene />
      </div>

      {/* Scroll Space */}
      <div style={{ height: "300vh" }} />
    </>
  );
}
