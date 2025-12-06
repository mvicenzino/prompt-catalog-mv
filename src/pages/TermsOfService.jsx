import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import '../landing.css';

const TermsOfService = () => {
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
                <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Terms of Service</h1>
                <div style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                    <p style={{ marginBottom: '1.5rem' }}>Last updated: December 05, 2025</p>

                    <h2 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>1. Agreement to Terms</h2>
                    <p>By accessing our website at PromptPal, you agree to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>

                    <h2 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>2. Use License</h2>
                    <p>Permission is granted to temporarily download one copy of the materials (information or software) on PromptPal's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
                    <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', margin: '1rem 0' }}>
                        <li>modify or copy the materials;</li>
                        <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
                        <li>attempt to decompile or reverse engineer any software contained on PromptPal's website;</li>
                        <li>remove any copyright or other proprietary notations from the materials; or</li>
                        <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
                    </ul>

                    <h2 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>3. Disclaimer</h2>
                    <p>The materials on PromptPal's website are provided on an 'as is' basis. PromptPal makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>

                    <h2 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>4. Limitations</h2>
                    <p>In no event shall PromptPal or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on PromptPal's website, even if PromptPal or a PromptPal authorized representative has been notified orally or in writing of the possibility of such damage.</p>

                    <h2 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>5. Accuracy of Materials</h2>
                    <p>The materials appearing on PromptPal's website could include technical, typographical, or photographic errors. PromptPal does not warrant that any of the materials on its website are accurate, complete or current. PromptPal may make changes to the materials contained on its website at any time without notice.</p>

                    <h2 style={{ color: 'var(--text-primary)', marginTop: '2rem', marginBottom: '1rem' }}>6. Governing Law</h2>
                    <p>These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.</p>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
