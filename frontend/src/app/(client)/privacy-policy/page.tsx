import React from 'react';

export default function PrivacyPolicyPage() {
    return (
        <div className="pt-32 pb-24 px-6 max-w-4xl mx-auto min-h-screen text-white">
            <h1 className="text-4xl md:text-5xl font-light tracking-wide mb-12">
                Privacy Policy
            </h1>

            <div className="prose prose-invert prose-lg max-w-none space-y-8 font-light text-white/80">
                <section>
                    <h2 className="text-2xl text-white font-normal mb-4">1. Introduction</h2>
                    <p>
                        Welcome to 1931 Co., Ltd. ("we," "our," or "us"). We are committed to protecting your privacy and ensuring your personal information is handled in a safe and responsible manner. This policy outlines how we collect, use, and protect your data.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl text-white font-normal mb-4">2. Information We Collect</h2>
                    <p>
                        We may collect personal information that you voluntarily provide to us when you:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Contact us via our website form or email.</li>
                        <li>Subscribe to our newsletter (if applicable).</li>
                        <li>Apply for a job or career opportunity.</li>
                    </ul>
                    <p className="mt-4">
                        This information may include your name, email address, phone number, and any other details you choose to provide.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl text-white font-normal mb-4">3. Cookies</h2>
                    <p>
                        We use cookies to improve your experience on our website. Cookies are small data files stored on your device that help us understand how you interact with our site. You can choose to accept or decline cookies through our Cookie Consent banner or your browser settings.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl text-white font-normal mb-4">4. How We Use Your Information</h2>
                    <p>
                        We use the information we collect to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Respond to your inquiries and provide customer support.</li>
                        <li>Improve our website and services.</li>
                        <li>Send you updates or promotional materials (only if you have opted in).</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl text-white font-normal mb-4">5. Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us at:
                    </p>
                    <p className="mt-2 text-white">
                        <strong>1931 Co., Ltd.</strong><br />
                        160/78 Moo 5, Bang Kruai-Sai Noi Rd.<br />
                        Bang Kruai, Nonthaburi 11130, Thailand<br />
                        Email: contact@1931.co.th (Example)
                    </p>
                </section>

                <p className="text-sm opacity-50 pt-8 border-t border-white/10">
                    Last updated: December 2025
                </p>
            </div>
        </div>
    );
}
