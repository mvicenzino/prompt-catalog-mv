import React, { useEffect, useRef, useState } from 'react';
import { SignInButton, SignUpButton, useAuth } from '@clerk/clerk-react';
import { Navigate, Link } from 'react-router-dom';
import { Sparkles, Zap, Layout, Share2, ArrowRight, CheckCircle2 } from 'lucide-react';
import '../landing.css';

const LandingPage = () => {
    const { isSignedIn } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const observerRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        observerRef.current = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        const elements = document.querySelectorAll('.section-header, .feature-card');
        elements.forEach(el => observerRef.current.observe(el));

        return () => observerRef.current.disconnect();
    }, []);

    if (isSignedIn) {
        return <Navigate to="/app" replace />;
    }

    return (
        <div className="landing-page">
            {/* Navigation */}
            <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
                <div className="container nav-container">
                    <div className="logo">
                        <img src="/logo.svg" alt="PromptPal Logo" style={{ width: '32px', height: '32px', borderRadius: '6px' }} />
                        <span className="logo-text">Prompt<span className="text-accent">Pal</span></span>
                    </div>
                    <div className="nav-actions">
                        <SignInButton mode="modal">
                            <button className="btn btn-ghost">Sign In</button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                            <button className="btn btn-primary">Get Started</button>
                        </SignUpButton>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="hero-section">
                <div className="container hero-container">
                    <div className="hero-content">
                        <div className="hero-badge" style={{ background: 'rgba(255, 225, 53, 0.1)', borderColor: 'rgba(255, 225, 53, 0.2)' }}>
                            <Sparkles size={14} className="text-accent" />
                            <span className="text-accent">For Creative Families</span>
                        </div>
                        <h1 className="hero-title">
                            Turn Imagination into <span className="text-gradient">Art</span>,<br />
                            Showcase on Kidzart.
                        </h1>
                        <p className="hero-subtitle">
                            The perfect tool for parents and kids to create stunning digital artwork together. Capture every idea and share your gallery with the world.
                        </p>
                        <div className="hero-cta">
                            <SignUpButton mode="modal">
                                <button className="btn btn-primary btn-lg">
                                    Start Creating Together <ArrowRight size={20} />
                                </button>
                            </SignUpButton>
                            <p className="hero-note">Safe & Fun for All Ages</p>
                        </div>
                    </div>
                    <div className="hero-visual full-width-video">
                        <div className="visual-card video-card">
                            <div className="video-wrapper">
                                {/* Placeholder for the video - using a creative gradient background for now */}
                                <div className="video-placeholder-content">
                                    <div className="play-button">
                                        <div className="play-icon">▶</div>
                                    </div>
                                    <div className="video-text">
                                        <h3>See the Magic Happen</h3>
                                        <p>Watch how easy it is to create & share</p>
                                    </div>
                                </div>
                                {/* Ideally we would place the actual <video> tag here */}
                                {/* <video src="/path-to-video.mp4" controls poster="/poster.jpg" /> */}
                            </div>
                        </div>

                        {/* Animated Floating Cards - Updated for Art Theme */}
                        <div className="visual-card floating-card card-1 slide-in-1">
                            <Sparkles size={16} color="var(--accent-primary)" />
                            <span>Masterpiece Created!</span>
                        </div>
                        <div className="visual-card floating-card card-2 slide-in-2">
                            <Share2 size={16} color="#a855f7" />
                            <span>Shared to Kidzart</span>
                        </div>
                    </div>
                </div>
                <div className="hero-glow"></div>
            </header>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Everything you need to prompt better</h2>
                        <p>Built for power users, developers, and creatives.</p>
                    </div>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon icon-blue">
                                <Layout size={24} />
                            </div>
                            <h3>Organize Everything</h3>
                            <p>Categorize prompts with tags, collections, and smart filters. Never lose a great prompt again.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon icon-purple">
                                <Zap size={24} />
                            </div>
                            <h3>Instant Execution</h3>
                            <p>One-click to run your prompts in ChatGPT, Claude, Gemini, or Perplexity. We handle the copy-paste.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon icon-green">
                                <Share2 size={24} />
                            </div>
                            <h3>Share & Collaborate</h3>
                            <p>Share your best prompts with the community or keep them private. Build your personal knowledge base.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="container footer-container">
                    <div className="footer-brand">
                        <div className="logo" style={{ marginBottom: '1rem' }}>
                            <img src="/logo.svg" alt="PromptPal Logo" style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
                            <span className="logo-text">Prompt<span className="text-accent">Pal</span></span>
                        </div>
                        <p>&copy; 2025 PromptPal. All rights reserved.</p>
                    </div>
                    <div className="footer-links">
                        <Link to="/privacy">Privacy</Link>
                        <Link to="/terms">Terms</Link>
                        <a href="mailto:mvicenzino@gmail.com">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
