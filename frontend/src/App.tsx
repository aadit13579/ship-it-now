import { Analytics } from "@vercel/analytics/react";
import TransitBoard from "./components/TransitBoard";

export default function App() {
  return (
    <>
      <TransitBoard />
      <Analytics />
    </>
  );
}