import Image from "next/image";
import searchNotFound from "@/assets/not-found.png";

type NotFoundProps = {
  title?: string;
  description?: string;
};

const NotFound = ({ title, description }: NotFoundProps) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex items-center justify-center mb-4 mt-16">
        <Image
          src={searchNotFound}
          alt="No results found"
          width={320}
          height={180}
          className="w-full h-[180px] object-cover rounded-lg"
        />
      </div>
      <h2 className="text-2xl font-medium mb-2 text-center">{title}</h2>
      <p className="text-sm text-gray-400 text-center">{description}</p>
    </div>
  );
};

export default NotFound;
