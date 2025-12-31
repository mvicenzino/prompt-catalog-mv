import { useEffect, useRef, useState } from 'react';
import { SignInButton, SignUpButton, useAuth } from '@clerk/clerk-react';
import { Navigate, Link } from 'react-router-dom';
import {
    Sparkles,
    Zap,
    Layout,
    Share2,
    ArrowRight,
    Library,
    Layers,
    MousePointerClick,
    FolderOpen,
    Play,
    ChevronDown,
    Star,
    Mail,
    Twitter,
    Github,
    Linkedin,
    PenTool,
    Check,
    Crown,
    Infinity
} from 'lucide-react';
import '../landing.css';

const LandingPage = () => {
    const { isSignedIn } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);
    const [email, setEmail] = useState('');
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

        const elements = document.querySelectorAll('.section-header, .feature-card, .step-card, .testimonial-card, .faq-item, .logo-item');
        elements.forEach(el => observerRef.current.observe(el));

        return () => observerRef.current.disconnect();
    }, []);

    if (isSignedIn) {
        return <Navigate to="/app" replace />;
    }

    const handleNewsletterSubmit = (e) => {
        e.preventDefault();
        setEmail('');
        alert('Thanks for subscribing!');
    };

    const faqs = [
        {
            question: "What is PromptPal?",
            answer: "PromptPal is your personal AI prompt library. It helps you save, organize, and instantly run your favorite prompts with ChatGPT. Think of it as a bookmark manager specifically designed for AI prompts."
        },
        {
            question: "Is PromptPal free to use?",
            answer: "Yes! PromptPal offers a generous free tier with up to 25 prompts, 3 collections, and one-click execution. For power users, our Pro plan at $7.99/month unlocks unlimited prompts, AI-powered collections, and advanced features. We also offer lifetime access for a one-time payment of $99."
        },
        {
            question: "What's included in the Pro plan?",
            answer: "Pro gives you unlimited prompts, unlimited collections, AI-powered auto-organization, prompt versioning, shareable links, priority support, and full Chrome extension features. You can pay monthly or get lifetime access with a one-time payment."
        },
        {
            question: "Can I share my prompts with others?",
            answer: "Pro users can create shareable links for any prompt. Share your best prompts with colleagues, friends, or the broader community. You control what's public and what stays private."
        },
        {
            question: "How do AI-generated collections work?",
            answer: "Our AI analyzes your saved prompts and automatically suggests collections based on themes, categories, and use cases. It's like having a smart assistant that organizes your prompt library for you. This feature is available on the Pro plan."
        }
    ];

    return (
        <div className="landing-page">
            {/* Navigation */}
            <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
                <div className="container nav-container">
                    <div className="logo">
                        <img src="/logo.svg" alt="PromptPal Logo" style={{ width: '32px', height: '32px', borderRadius: '6px' }} />
                        <span className="logo-text">Prompt<span className="text-accent">Pal</span></span>
                    </div>
                    <div className="nav-links-desktop">
                        <a href="#features">Features</a>
                        <a href="#pricing">Pricing</a>
                        <a href="#faq">FAQ</a>
                    </div>
                    <div className="nav-actions">
                        <SignInButton mode="modal">
                            <button className="btn btn-primary">Sign In</button>
                        </SignInButton>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="hero-section hero-minimal">
                <div className="hero-glow-bg"></div>
                <div className="container hero-container">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Your prompts.<br />
                            <span className="text-gradient">Organized.</span>
                        </h1>
                        <p className="hero-subtitle">
                            Save, organize, and run your AI prompts with one click.
                        </p>
                        <div className="hero-cta">
                            <SignUpButton mode="modal">
                                <button className="btn btn-primary btn-lg">
                                    Get Started Free
                                </button>
                            </SignUpButton>
                            <p className="hero-note">No credit card required</p>
                        </div>
                    </div>

                    {/* Product Preview - One Clear Image */}
                    <div className="hero-product">
                        {/* Main Window First */}
                        <div className="product-window">
                            <div className="product-header">
                                <div className="window-dots">
                                    <span></span><span></span><span></span>
                                </div>
                                <span className="window-title">PromptPal</span>
                            </div>
                            <div className="product-body">
                                <div className="product-sidebar">
                                    <div className="sidebar-item active"><Library size={14} /><span>Prompts</span></div>
                                    <div className="sidebar-item"><Layers size={14} /><span>Collections</span></div>
                                    <div className="sidebar-item"><Star size={14} /><span>Favorites</span></div>
                                </div>
                                <div className="product-main">
                                    <div className="prompt-row">
                                        <div className="prompt-icon"></div>
                                        <div className="prompt-text">
                                            <div className="text-line"></div>
                                            <div className="text-line short"></div>
                                        </div>
                                        <button className="run-btn"><Play size={10} /></button>
                                    </div>
                                    <div className="prompt-row">
                                        <div className="prompt-icon purple"></div>
                                        <div className="prompt-text">
                                            <div className="text-line"></div>
                                            <div className="text-line short"></div>
                                        </div>
                                        <button className="run-btn"><Play size={10} /></button>
                                    </div>
                                    <div className="prompt-row">
                                        <div className="prompt-icon green"></div>
                                        <div className="prompt-text">
                                            <div className="text-line"></div>
                                            <div className="text-line short"></div>
                                        </div>
                                        <button className="run-btn"><Play size={10} /></button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Workflow Connections Container */}
                        <div className="workflow-connections">
                            {/* Node 1 - Top Left */}
                            <div className="workflow-node node-1">
                                <div className="node-card">
                                    <div className="node-icon"><Sparkles size={14} /></div>
                                    <span>AI organized</span>
                                    <div className="card-connector right"></div>
                                </div>
                                <svg className="curved-line" viewBox="0 0 80 40" preserveAspectRatio="none">
                                    <path d="M 0 20 Q 40 35, 80 20" className="curve-path" />
                                </svg>
                                <div className="window-dot"></div>
                            </div>

                            {/* Node 2 - Top Right */}
                            <div className="workflow-node node-2">
                                <div className="window-dot"></div>
                                <svg className="curved-line" viewBox="0 0 80 40" preserveAspectRatio="none">
                                    <path d="M 0 20 Q 40 5, 80 20" className="curve-path" />
                                </svg>
                                <div className="node-card">
                                    <div className="card-connector left"></div>
                                    <div className="node-icon success"><Play size={12} /></div>
                                    <span>Run in ChatGPT</span>
                                </div>
                            </div>

                            {/* Node 3 - Middle Left */}
                            <div className="workflow-node node-3">
                                <div className="node-card">
                                    <div className="node-icon blue"><PenTool size={12} /></div>
                                    <span>Build prompts</span>
                                    <div className="card-connector right"></div>
                                </div>
                                <svg className="curved-line" viewBox="0 0 80 30" preserveAspectRatio="none">
                                    <path d="M 0 15 Q 40 0, 80 15" className="curve-path" />
                                </svg>
                                <div className="window-dot"></div>
                            </div>

                            {/* Node 4 - Middle Right */}
                            <div className="workflow-node node-4">
                                <div className="window-dot"></div>
                                <svg className="curved-line" viewBox="0 0 80 30" preserveAspectRatio="none">
                                    <path d="M 0 15 Q 40 30, 80 15" className="curve-path" />
                                </svg>
                                <div className="node-card">
                                    <div className="card-connector left"></div>
                                    <div className="node-icon purple"><FolderOpen size={12} /></div>
                                    <span>Save to collection</span>
                                </div>
                            </div>

                            {/* Node 5 - Bottom Center */}
                            <div className="workflow-node node-5">
                                <div className="window-dot"></div>
                                <svg className="curved-line vertical" viewBox="0 0 30 50" preserveAspectRatio="none">
                                    <path d="M 15 0 Q 0 25, 15 50" className="curve-path" />
                                </svg>
                                <div className="node-card">
                                    <div className="card-connector top"></div>
                                    <div className="node-icon star"><Star size={12} fill="#FFE135" color="#FFE135" /></div>
                                    <span>Add to favorites</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* How It Works Section */}
            <section className="how-it-works-section" id="how-it-works">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Simple & Powerful</span>
                        <h2>How PromptPal Works</h2>
                        <p>Get started in seconds. Be productive forever.</p>
                    </div>
                    <div className="steps-grid">
                        <div className="step-card">
                            <div className="step-number">1</div>
                            <div className="step-icon">
                                <FolderOpen size={32} fill="#FFE135" color="#FFE135" />
                            </div>
                            <h3>Save Your Prompts</h3>
                            <p>Copy prompts from anywhere. Add tags for easy searching.</p>
                        </div>
                        <div className="step-connector">
                            <ArrowRight size={28} />
                        </div>
                        <div className="step-card">
                            <div className="step-number">2</div>
                            <div className="step-icon">
                                <Layout size={32} fill="#FFE135" color="#FFE135" />
                            </div>
                            <h3>Organize with AI</h3>
                            <p>Let AI auto-organize your prompts into smart collections.</p>
                        </div>
                        <div className="step-connector">
                            <ArrowRight size={28} />
                        </div>
                        <div className="step-card">
                            <div className="step-number">3</div>
                            <div className="step-icon">
                                <Play size={32} fill="#FFE135" color="#FFE135" />
                            </div>
                            <h3>Run Instantly</h3>
                            <p>One click to open your prompt in any AI platform.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section" id="features">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Powerful Features</span>
                        <h2>Everything You Need to Prompt Better</h2>
                        <p>Built for developers, creators, and anyone who uses AI daily.</p>
                    </div>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">
                                <Library size={28} fill="#FFE135" color="#FFE135" />
                            </div>
                            <h3>Unlimited Library</h3>
                            <p>Save unlimited prompts. Never lose a great idea again.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <Sparkles size={28} fill="#FFE135" color="#FFE135" />
                            </div>
                            <h3>AI Collections</h3>
                            <p>Auto-organize prompts into smart, themed collections.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <MousePointerClick size={28} fill="#FFE135" color="#FFE135" />
                            </div>
                            <h3>One-Click Run</h3>
                            <p>Execute prompts instantly on any AI platform.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <Share2 size={28} fill="#FFE135" color="#FFE135" />
                            </div>
                            <h3>Share Anywhere</h3>
                            <p>Create shareable links. Collaborate with your team.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <Star size={28} fill="#FFE135" color="#FFE135" />
                            </div>
                            <h3>Quick Favorites</h3>
                            <p>Star your best prompts for instant access.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <Zap size={28} fill="#FFE135" color="#FFE135" />
                            </div>
                            <h3>Prompt Builder</h3>
                            <p>Create structured prompts with our guided builder.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="pricing-section" id="pricing">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Simple Pricing</span>
                        <h2>Choose Your Plan</h2>
                        <p>Start free, upgrade when you need more.</p>
                    </div>
                    <div className="pricing-grid">
                        {/* Free Plan */}
                        <div className="pricing-card">
                            <div className="pricing-header">
                                <h3>Free</h3>
                                <div className="pricing-price">
                                    <span className="price">$0</span>
                                    <span className="period">forever</span>
                                </div>
                                <p className="pricing-desc">Perfect for getting started</p>
                            </div>
                            <ul className="pricing-features">
                                <li><Check size={16} /> Up to 25 prompts</li>
                                <li><Check size={16} /> 3 collections</li>
                                <li><Check size={16} /> One-click run to ChatGPT</li>
                                <li><Check size={16} /> Basic search</li>
                                <li><Check size={16} /> Favorites</li>
                            </ul>
                            <SignUpButton mode="modal">
                                <button className="btn btn-ghost btn-full">Get Started</button>
                            </SignUpButton>
                        </div>

                        {/* Pro Plan */}
                        <div className="pricing-card featured">
                            <div className="pricing-badge">Most Popular</div>
                            <div className="pricing-header">
                                <h3><Crown size={20} /> Pro</h3>
                                <div className="pricing-price">
                                    <span className="price">$7.99</span>
                                    <span className="period">/month</span>
                                </div>
                                <p className="pricing-desc">For power users</p>
                            </div>
                            <ul className="pricing-features">
                                <li><Check size={16} /> <strong>Unlimited</strong> prompts</li>
                                <li><Check size={16} /> <strong>Unlimited</strong> collections</li>
                                <li><Check size={16} /> AI-powered organization</li>
                                <li><Check size={16} /> Prompt versioning</li>
                                <li><Check size={16} /> Shareable links</li>
                                <li><Check size={16} /> Chrome extension</li>
                                <li><Check size={16} /> Priority support</li>
                            </ul>
                            <SignUpButton mode="modal">
                                <button className="btn btn-primary btn-full">Start Free Trial</button>
                            </SignUpButton>
                        </div>

                        {/* Lifetime Plan */}
                        <div className="pricing-card">
                            <div className="pricing-header">
                                <h3><Infinity size={20} /> Lifetime</h3>
                                <div className="pricing-price">
                                    <span className="price">$99</span>
                                    <span className="period">one-time</span>
                                </div>
                                <p className="pricing-desc">Pay once, use forever</p>
                            </div>
                            <ul className="pricing-features">
                                <li><Check size={16} /> Everything in Pro</li>
                                <li><Check size={16} /> One-time payment</li>
                                <li><Check size={16} /> Lifetime updates</li>
                                <li><Check size={16} /> Early access to new features</li>
                                <li><Check size={16} /> Founder badge</li>
                            </ul>
                            <SignUpButton mode="modal">
                                <button className="btn btn-ghost btn-full">Get Lifetime Access</button>
                            </SignUpButton>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials-section">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Loved by Creators</span>
                        <h2>What Our Users Say</h2>
                        <p>Join thousands who've transformed their AI workflow.</p>
                    </div>
                    <div className="testimonials-grid">
                        <div className="testimonial-card">
                            <div className="testimonial-quote">"Finally, one place for everything."</div>
                            <div className="testimonial-stars">
                                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#FFE135" color="#FFE135" />)}
                            </div>
                            <p className="testimonial-text">I used to have prompts scattered across Notion, Google Docs, and random text files. PromptPal finally gave me one place for everything. The one-click execution is a game-changer.</p>
                            <div className="testimonial-author">
                                <div className="author-avatar" style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>S</div>
                                <div className="author-info">
                                    <strong>Sarah Chen</strong>
                                    <span>Content Creator • TechFlow Media</span>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial-card featured">
                            <div className="testimonial-quote">"AI collections organized my chaos automatically."</div>
                            <div className="testimonial-stars">
                                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#FFE135" color="#FFE135" />)}
                            </div>
                            <p className="testimonial-text">As a developer, I have dozens of coding prompts I use daily. PromptPal's tagging and search make it instant to find exactly what I need. The AI collections feature is brilliant.</p>
                            <div className="testimonial-author">
                                <div className="author-avatar" style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>M</div>
                                <div className="author-info">
                                    <strong>Marcus Rodriguez</strong>
                                    <span>Full-Stack Developer • Stripe</span>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial-card">
                            <div className="testimonial-quote">"Our team's standard for AI collaboration."</div>
                            <div className="testimonial-stars">
                                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#FFE135" color="#FFE135" />)}
                            </div>
                            <p className="testimonial-text">The shareable links feature is perfect for my team. I create prompt templates and share them with everyone. It's become our standard way of collaborating on AI tasks.</p>
                            <div className="testimonial-author">
                                <div className="author-avatar" style={{ background: 'linear-gradient(135deg, #22c55e, #84cc16)' }}>J</div>
                                <div className="author-info">
                                    <strong>Jamie Park</strong>
                                    <span>Marketing Manager • Notion</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="faq-section" id="faq">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Got Questions?</span>
                        <h2>Frequently Asked Questions</h2>
                        <p>Everything you need to know about PromptPal.</p>
                    </div>
                    <div className="faq-list">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className={`faq-item ${openFaq === index ? 'open' : ''}`}
                                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                            >
                                <div className="faq-question">
                                    <h3>{faq.question}</h3>
                                    <ChevronDown size={20} className="faq-icon" />
                                </div>
                                <div className="faq-answer">
                                    <p>{faq.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-card">
                        <div className="cta-glow"></div>
                        <h2>Ready to Master Your Prompts?</h2>
                        <p>Join thousands of creators who've transformed their AI workflow.</p>
                        <SignUpButton mode="modal">
                            <button className="btn btn-primary btn-lg">
                                Get Started Free <ArrowRight size={20} />
                            </button>
                        </SignUpButton>
                        <p className="cta-note">No credit card required • Free plan available</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="container">
                    <div className="footer-grid">
                        <div className="footer-brand">
                            <div className="logo" style={{ marginBottom: '1rem' }}>
                                <img src="/logo.svg" alt="PromptPal Logo" style={{ width: '28px', height: '28px', borderRadius: '4px' }} />
                                <span className="logo-text">Prompt<span className="text-accent">Pal</span></span>
                            </div>
                            <p className="brand-description">Your personal AI prompt library. Save, organize, and run prompts instantly.</p>
                            <div className="social-links">
                                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                                    <Twitter size={18} />
                                </a>
                                <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                                    <Github size={18} />
                                </a>
                                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                                    <Linkedin size={18} />
                                </a>
                            </div>
                        </div>
                        <div className="footer-column">
                            <h4>Product</h4>
                            <a href="#features">Features</a>
                            <a href="#how-it-works">How It Works</a>
                            <a href="#faq">FAQ</a>
                        </div>
                        <div className="footer-column">
                            <h4>Legal</h4>
                            <Link to="/privacy">Privacy Policy</Link>
                            <Link to="/terms">Terms of Service</Link>
                            <a href="mailto:mvicenzino@gmail.com">Contact</a>
                        </div>
                        <div className="footer-column newsletter">
                            <h4>Stay Updated</h4>
                            <p>Get the latest tips and updates.</p>
                            <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
                                <div className="input-group">
                                    <Mail size={16} className="input-icon" />
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary btn-sm">Subscribe</button>
                            </form>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; 2025 PromptPal. All rights reserved.</p>
                        <p className="made-with">Made with ❤️ for the AI community</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
