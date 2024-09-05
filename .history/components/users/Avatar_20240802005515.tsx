import React from "react";
import styles from "./Avatar.module.css";
import Image from "next/image";

export function Avatar({
  name,
  otherStyles,
}: {
  name: string;
  otherStyles: string;
}) {
  return (
    <div
      className={`${styles.avatar} ${otherStyles} h-9 w-9`}
      data-tooltip={name}
    >
      <Image
        src={`https://api.adorable.io/avatars/56/${name}.png`}
        layout="fill"
        className={styles.avatar_picture}
        alt={name}
      />
    </div>
  );
}
