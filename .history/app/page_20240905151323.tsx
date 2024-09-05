import dynamic from "next/dynamic";

const App = dynamic(() => import("../components/C"), { ssr: false });
