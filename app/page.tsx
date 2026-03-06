import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { CodeDemo } from "@/components/CodeDemo";
import { TokenComparison } from "@/components/TokenComparison";
import { CTA } from "@/components/CTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <CodeDemo />
      <Features />
      <TokenComparison />
      <CTA />
    </>
  );
}
