"use client";
import { useMemo } from "react";
import Image from "next/image";

import { getShapeInfo } from "@/lib/utils";

const LeftSidebar = ({ allShapes }: { allShapes: Array<any> }) => {
  console.log("All shapes:", allShapes); // Debugging line

  // Memoize shapes rendering
  const memoizedShapes = useMemo(
    () => (
      <section>
        <div className="flex flex-col">
          {allShapes?.map((shape: any) => {
            const info = getShapeInfo(shape[1]?.type);

            return (
              <div
                key={shape[1]?.objectId}
                className="group my-1 flex items-center gap-2 px-5 py-2.5 hover:cursor-pointer hover:bg-primary-green hover:text-primary-black"
              >
                <Image
                  src={info?.icon || "/default-icon.png"} // Fallback icon
                  alt="Layer"
                  width={16}
                  height={16}
                  className="group-hover:invert"
                />
                <h3 className="text-sm font-semibold capitalize">
                  {info.name || "Unnamed Shape"} // Fallback name
                </h3>
              </div>
            );
          })}
        </div>
      </section>
    ),
    [allShapes]
  );

  return memoizedShapes;
};

export default LeftSidebar;
