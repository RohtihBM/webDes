"use client";

import { useMemo } from "react";
import Image from "next/image";
import { getShapeInfo } from "@/lib/utils";

const LeftSidebar = ({ allShapes }: { allShapes: Array<any> }) => {
  // memoize the result of this function so that it doesn't change on every render but only when there are new shapes
  const memoizedShapes = useMemo(
    () => (
      <section className="bg-gray-900 text-gray-100 p-4 rounded-lg shadow-md">
        <div className="flex flex-col space-y-2">
          {allShapes?.map((shape: any) => {
            const info = getShapeInfo(shape[1]?.type);

            return (
              <div
                key={shape[1]?.objectId}
                className="group flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
              >
                <Image
                  src={info?.icon}
                  alt="Layer"
                  width={20}
                  height={20}
                  className="group-hover:invert transition-transform transform group-hover:scale-110"
                />
                <h3 className="text-sm font-medium capitalize">{info.name}</h3>
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
