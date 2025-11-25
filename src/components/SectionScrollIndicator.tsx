import { ChevronDown } from "lucide-react";

const SectionScrollIndicator = () => {
  return (
    <div className="flex justify-center py-1 md:hidden">
      <div className="animate-bounce">
        <ChevronDown className="w-8 h-8 text-primary" />
      </div>
    </div>
  );
};

export default SectionScrollIndicator;
