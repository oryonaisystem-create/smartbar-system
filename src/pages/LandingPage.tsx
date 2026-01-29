import { useState, useEffect } from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { Hero } from '../components/landing/Hero';
import { About } from '../components/landing/About';
import { Features } from '../components/landing/Features';
import { HowItWorks } from '../components/landing/HowItWorks';
import { Pricing } from '../components/landing/Pricing';
import { DownloadSection } from '../components/landing/DownloadSection';
import { Contact } from '../components/landing/Contact';
import { LandingFooter } from '../components/landing/LandingFooter';

export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-sky-500/30 font-sans">
            <LandingNavbar scrolled={scrolled} />

            <main>
                <Hero />
                <About />
                <Features />
                <HowItWorks />
                <Pricing />
                <DownloadSection />
                <Contact />
            </main>

            <LandingFooter />
        </div>
    );
}
