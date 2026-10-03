import { useEffect } from "react";
import { About } from "@/app/sections/About";
import { Approach } from "@/app/sections/Approach";
import { Contact } from "@/app/sections/Contact";
import { Hero } from "@/app/sections/Hero";
import { SelectedWork } from "@/app/sections/SelectedWork";
import { site } from "@/lib/data/site";

export function HomePage() {
  useEffect(() => {
    document.title = `${site.name} — Backend & Systems Infrastructure Engineer`;
  }, []);

  return (
    <>
      <Hero />
      <SelectedWork />
      <Approach />
      <About />
      <Contact />
    </>
  );
}

export default HomePage;
