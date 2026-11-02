import { Nav } from './sections/Nav';
import { Hero } from './sections/Hero';
import { LiveDemo } from './sections/LiveDemo';
import { Orchestra } from './sections/Orchestra';
import { Features } from './sections/Features';
import { Builder } from './sections/Builder';
import { Install } from './sections/Install';
import { Never } from './sections/Never';
import { Finale } from './sections/Finale';
import { Footer } from './sections/Footer';
import { useLenis } from './lib/useLenis';

export default function App() {
  useLenis();

  return (
    <div>
      <div className="grain" aria-hidden="true" />
      <Nav />
      <main>
        <Hero />
        <LiveDemo />
        <Orchestra />
        <Features />
        <Builder />
        <Install />
        <Never />
        <Finale />
      </main>
      <Footer />
    </div>
  );
}
