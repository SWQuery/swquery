import { Navbar } from "@/components/Molecules/Navbar";

export const VideoDemoPage = () => {
  return (
    <div className="relative min-h-screen text-white overflow-hidden bg-black">
      <Navbar />

      <div className="flex justify-center items-center h-screen">
        <iframe
          width="1400"
          height="787.5"
          src="https://www.youtube.com/embed/lPINErkE43M?si=oDtayZWvLCQhRQTq"
          title="Video Demo"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};
