import React from 'react';
import { SignInButton, SignUpButton, useAuth } from '@clerk/clerk-react';
import { Navigate, Link } from 'react-router-dom';
import { Sparkles, Zap, Layout, Share2, ArrowRight, CheckCircle2 } from 'lucide-react';
import '../landing.css';

const LandingPage = () => {
    const { isSignedIn } = useAuth();

    if (isSignedIn) {
        return <Navigate to="/app" replace />;
    }

    return (
        <div className="landing-page">
            {/* Navigation */}
            <nav className="landing-nav">
                <div className="container nav-container">
                    <div className="logo">
                        <div className="logo-icon">
                            <Sparkles size={20} color="white" />
                        </div>
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
                        <div className="hero-badge">
                            <Zap size={14} />
                            <span>Supercharge your AI workflow</span>
                        </div>
                        <h1 className="hero-title">
                            Master Your <span className="text-gradient">Prompts</span>,<br />
                            Unleash Creativity.
                        </h1>
                        <p className="hero-subtitle">
                            The ultimate library for managing, organizing, and running your AI prompts.
                            Stop rewriting the same commands—build your personal catalog today.
                        </p>
                        <div className="hero-cta">
                            <SignUpButton mode="modal">
                                <button className="btn btn-primary btn-lg">
                                    Start for Free <ArrowRight size={20} />
                                </button>
                            </SignUpButton>
                            <p className="hero-note">No credit card required</p>
                        </div>
                    </div>
                    <div className="hero-visual">
                        <div className="visual-card main-card">
                            <div className="card-header">
                                <div className="dot red"></div>
                                <div className="dot yellow"></div>
                                <div className="dot green"></div>
                            </div>
                            <div className="card-body">
                                <div className="prompt-preview">
                                    <span className="tag">#coding</span>
                                    <h3>React Component Generator</h3>
                                    <p>Create a responsive React component with Tailwind CSS...</p>
                                    <div className="btn-row">
                                        <button className="btn-sm btn-primary">Run with ChatGPT</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="visual-card floating-card card-1">
                            <CheckCircle2 size={16} color="var(--primary)" />
                            <span>Prompt Saved!</span>
                        </div>
                        <div className="visual-card floating-card card-2">
                            <Layout size={16} color="#a855f7" />
                            <span>Organized</span>
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
                        <span className="logo-text">Prompt<span className="text-accent">Pal</span></span>
                        <p>&copy; 2024 PromptPal. All rights reserved.</p>
                    </div>
                    <div className="footer-links">
                        <a href="#">Privacy</a>
                        <a href="#">Terms</a>
                        <a href="#">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
