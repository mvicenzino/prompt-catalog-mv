import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import '../landing.css';

const PrivacyPolicy = () => {
    return (
        <div className="landing-page">
            <nav className="landing-nav" style={{ position: 'relative', background: 'var(--bg-app)' }}>
                <div className="container nav-container">
                    <Link to="/" className="btn btn-ghost">
                        <ArrowLeft size={20} /> Back to Home
                    </Link>
                </div>
            </nav>
            <div className="container" style={{ padding: '4rem 2rem', maxWidth: '800px' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Privacy Policy</h1>
                <div style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                    <p style={{ marginBottom: '1.5rem' }}>Last updated: December 05, 2025</p>

                    <h2 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>1. Introduction</h2>
                    <p>Welcome to PromptPal. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>

                    <h2 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>2. Data We Collect</h2>
                    <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
                    <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', margin: '1rem 0' }}>
                        <li>Identity Data includes first name, last name, username or similar identifier.</li>
                        <li>Contact Data includes email address.</li>
                        <li>Technical Data includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
                        <li>Usage Data includes information about how you use our website, products and services (including your saved prompts).</li>
                    </ul>

                    <h2 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>3. How We Use Your Data</h2>
                    <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
                    <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', margin: '1rem 0' }}>
                        <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                        <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                        <li>Where we need to comply with a legal obligation.</li>
                    </ul>

                    <h2 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>4. Data Security</h2>
                    <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.</p>

                    <h2 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>5. Contact Us</h2>
                    <p>If you have any questions about this privacy policy or our privacy practices, please contact us at: mvicenzino@gmail.com</p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
