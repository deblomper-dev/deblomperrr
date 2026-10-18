import { About } from "@/app/sections/About";
import { Approach } from "@/app/sections/Approach";
import { Contact } from "@/app/sections/Contact";
import { Hero } from "@/app/sections/Hero";
import { SelectedWork } from "@/app/sections/SelectedWork";

export function HomePage() {
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
