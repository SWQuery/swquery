import { History } from "@/components/Molecules/Demo/History";
import { Navbar } from "@/components/Molecules/Navbar";

export const DemoPage = () => {
  return (
    <div className="relative min-h-screen text-white overflow-hidden bg-black">
      <Navbar />

      <History />
    </div>
  );
};
