import { Hourglass } from "lucide-react";

export default function AvaiableSoon() {
  return (
    <div className="text-center">
      <Hourglass className="w-16 h-16 text-purple-500 mx-auto mb-4" />
      <h1 className="text-2xl font-semibold">Feature Available Soon...</h1>
    </div>
  );
}
