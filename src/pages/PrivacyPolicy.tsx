import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <SiteHeader />
      <main className="p-4">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <span className="text-xs uppercase tracking-[0.4em] text-green-300">Privacy Policy • Effective January 28, 2026</span>
          </div>

          <header className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-green-400">ZIGMA / PRIVACY POLICY</p>
            <h1 className="text-4xl font-bold text-white leading-tight">Privacy Policy</h1>
            <p className="text-muted-foreground text-lg max-w-3xl">
              At ZIGMA, we are committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, share, and protect your data when you use our AI-powered prediction market intelligence platform.
            </p>
            <div className="bg-gray-900 border border-green-500/30 p-4 rounded-xl">
              <p className="text-xs text-muted-foreground uppercase tracking-[0.3em]">Our Privacy Principles</p>
              <div className="grid gap-2 md:grid-cols-3 mt-2">
                <div className="text-sm text-green-200">Transparency</div>
                <div className="text-sm text-green-200">Minimization</div>
                <div className="text-sm text-green-200">Security</div>
                <div className="text-sm text-green-200">Control</div>
                <div className="text-sm text-green-200">Compliance</div>
                <div className="text-sm text-green-200">Protection</div>
              </div>
            </div>
          </header>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">📋 Information We Collect</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">1. Account Information</p>
                <p className="text-sm text-muted-foreground mb-2">When you create an account, we collect:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Email Address</strong>: For account verification and communication</li>
                  <li>• <strong>Username</strong>: Your chosen display name</li>
                  <li>• <strong>Wallet Address</strong>: Solana wallet for token transactions</li>
                  <li>• <strong>Profile Data</strong>: Optional information you choose to provide</li>
                </ul>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">2. Transaction Data</p>
                <p className="text-sm text-muted-foreground mb-2">We collect information related to:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Token Holdings</strong>: $ZIGMA token balances and transactions</li>
                  <li>• <strong>API Usage</strong>: Request counts, endpoints used, response times</li>
                  <li>• <strong>Chat Sessions</strong>: Topics discussed, session duration, costs</li>
                  <li>• <strong>Platform Interactions</strong>: Features used, signals viewed, portfolio data</li>
                </ul>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">3. Technical Data</p>
                <p className="text-sm text-muted-foreground mb-2">Automatically collected information includes:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>IP Address</strong>: For security and geographic analysis</li>
                  <li>• <strong>Device Information</strong>: Browser, operating system, device type</li>
                  <li>• <strong>Usage Patterns</strong>: Pages visited, time spent, click patterns</li>
                  <li>• <strong>Performance Data</strong>: Load times, error rates, system interactions</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">💡 How We Use Your Information</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">1. Service Provision</p>
                <p className="text-sm text-muted-foreground">Your data enables us to:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Authenticate Users</strong>: Verify identity and authorize access</li>
                  <li>• <strong>Provide Features</strong>: Deliver signals, chat, and analytics</li>
                  <li>• <strong>Process Transactions</strong>: Handle token transfers and API calls</li>
                  <li>• <strong>Maintain Accounts</strong>: Manage user profiles and preferences</li>
                </ul>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">2. Platform Improvement</p>
                <p className="text-sm text-muted-foreground">We use data to:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Analyze Usage</strong>: Understand feature adoption and user behavior</li>
                  <li>• <strong>Optimize Performance</strong>: Improve speed, reliability, and user experience</li>
                  <li>• <strong>Develop Features</strong>: Create new services based on user needs</li>
                  <li>• <strong>Fix Issues</strong>: Identify and resolve technical problems</li>
                </ul>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">3. Communication</p>
                <p className="text-sm text-muted-foreground">We contact you for:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Service Updates</strong>: Important announcements and maintenance notices</li>
                  <li>• <strong>Account Information</strong>: Security alerts, balance changes, transaction confirmations</li>
                  <li>• <strong>Marketing</strong>: Platform news, feature updates, promotional content (with consent)</li>
                  <li>• <strong>Support</strong>: Responses to inquiries and assistance requests</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">🔄 Data Sharing and Disclosure</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">1. Third-Party Service Providers</p>
                <p className="text-sm text-muted-foreground">We share data with trusted partners for:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Blockchain Infrastructure</strong>: Solana network validators and nodes</li>
                  <li>• <strong>Cloud Services</strong>: AWS, Google Cloud for hosting and storage</li>
                  <li>• <strong>Analytics Tools</strong>: Google Analytics, Mixpanel for usage analysis</li>
                  <li>• <strong>Communication Platforms</strong>: Discord, SendGrid for community and email</li>
                </ul>
              </div>
              <div className="bg-gray-950 border border-yellow-500/20 p-6 rounded-2xl">
                <p className="text-lg text-yellow-200 font-semibold mb-3">2. Public Information</p>
                <p className="text-sm text-muted-foreground">Some information is publicly available:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Governance Votes</strong>: On-chain voting records are public</li>
                  <li>• <strong>Token Holdings</strong>: Blockchain balances are publicly visible</li>
                  <li>• <strong>Community Posts</strong>: Public Discord messages and forum posts</li>
                  <li>• <strong>Market Data</strong>: Prediction market information and signals</li>
                </ul>
              </div>
              <div className="bg-gray-950 border border-red-500/20 p-6 rounded-2xl">
                <p className="text-lg text-red-200 font-semibold mb-3">3. Legal Requirements</p>
                <p className="text-sm text-muted-foreground">We may disclose data when:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Required by Law</strong>: Court orders, subpoenas, legal processes</li>
                  <li>• <strong>Protect Rights</strong>: Prevent fraud, enforce terms, protect safety</li>
                  <li>• <strong>Regulatory Compliance</strong>: Respond to government inquiries</li>
                  <li>• <strong>Emergency Situations</strong>: Protect life, prevent imminent harm</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">🍪 Cookies and Tracking Technologies</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">1. Essential Cookies</p>
                <p className="text-sm text-muted-foreground">Required for platform functionality:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Authentication</strong>: Maintain login sessions</li>
                  <li>• <strong>Security</strong>: Prevent fraud and abuse</li>
                  <li>• <strong>Preferences</strong>: Remember user settings and choices</li>
                  <li>• <strong>State Management</strong>: Track application state</li>
                </ul>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">2. Analytics Cookies</p>
                <p className="text-sm text-muted-foreground">Help us understand usage:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Google Analytics</strong>: Website traffic and user behavior</li>
                  <li>• <strong>Mixpanel</strong>: Feature usage and user journeys</li>
                  <li>• <strong>Hotjar</strong>: User interaction and feedback</li>
                  <li>• <strong>Custom Analytics</strong>: Platform-specific metrics</li>
                </ul>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">3. Cookie Management</p>
                <p className="text-sm text-muted-foreground">You can control cookies through:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Browser Settings</strong>: Block or delete cookies</li>
                  <li>• <strong>Preference Center</strong>: Customize cookie choices</li>
                  <li>• <strong>Opt-Out Links</strong>: Unsubscribe from marketing emails</li>
                  <li>• <strong>Do Not Track</strong>: Browser DNT signal respect</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">🔒 Data Security Measures</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">1. Technical Protections</p>
                <p className="text-sm text-muted-foreground">We implement:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Encryption</strong>: AES-256 encryption for data at rest and in transit</li>
                  <li>• <strong>Access Controls</strong>: Role-based access and least privilege principles</li>
                  <li>• <strong>Network Security</strong>: Firewalls, DDoS protection, intrusion detection</li>
                  <li>• <strong>Regular Audits</strong>: Security assessments and penetration testing</li>
                </ul>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">2. Organizational Measures</p>
                <p className="text-sm text-muted-foreground">Our practices include:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Employee Training</strong>: Privacy and security awareness programs</li>
                  <li>• <strong>Data Minimization</strong>: Collect only necessary information</li>
                  <li>• <strong>Retention Policies</strong>: Delete data when no longer needed</li>
                  <li>• <strong>Incident Response</strong>: Procedures for security breaches</li>
                </ul>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">3. Blockchain Security</p>
                <p className="text-sm text-muted-foreground">For blockchain-related data:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Wallet Security</strong>: Non-custodial approach, user controls keys</li>
                  <li>• <strong>Transaction Privacy</strong>: On-chain data is public by design</li>
                  <li>• <strong>Smart Contract Audits</strong>: Third-party security reviews</li>
                  <li>• <strong>Network Monitoring</strong>: Suspicious activity detection</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">👤 Your Privacy Rights</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">1. Access and Portability</p>
                <p className="text-sm text-muted-foreground">You can:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Request Access</strong>: Obtain copies of your personal data</li>
                  <li>• <strong>Data Portability</strong>: Receive data in machine-readable format</li>
                  <li>• <strong>Account Export</strong>: Download your account information</li>
                  <li>• <strong>Transaction History</strong>: Access your transaction records</li>
                </ul>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">2. Correction and Deletion</p>
                <p className="text-sm text-muted-foreground">You may:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Update Information</strong>: Correct inaccurate personal data</li>
                  <li>• <strong>Delete Account</strong>: Remove your account and associated data</li>
                  <li>• <strong>Withdraw Consent</strong>: Revoke permission for data processing</li>
                  <li>• <strong>Limit Processing</strong>: Restrict certain data uses</li>
                </ul>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">3. Exercise Rights</p>
                <p className="text-sm text-muted-foreground">To exercise your rights:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Account Settings</strong>: Self-service options in your dashboard</li>
                  <li>• <strong>Email Request</strong>: privacy@zigma.ai</li>
                  <li>• <strong>Data Protection Officer</strong>: dpo@zigma.ai</li>
                  <li>• <strong>Support Form</strong>: Submit requests through our help center</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">👶 Children's Privacy</h2>
            </div>
            <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
              <p className="text-lg text-green-200 font-semibold mb-3">Age Restriction</p>
              <p className="text-sm text-muted-foreground">Our Service is intended for:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Adults Only</strong>: Users 18 years or older</li>
                <li>• <strong>No Child Data</strong>: We do not knowingly collect information from children</li>
                <li>• <strong>Age Verification</strong>: We may verify age when required</li>
                <li>• <strong>Parental Consent</strong>: Not applicable as we don't serve children</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-3">
                If we discover we've collected child data, we immediately delete the information and notify parents if contact information is available.
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">📊 Data Retention</h2>
            </div>
            <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
              <p className="text-lg text-green-200 font-semibold mb-3">Retention Principles</p>
              <p className="text-sm text-muted-foreground">We keep data based on:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Legal Requirements</strong>: Retention periods mandated by law</li>
                <li>• <strong>Business Needs</strong>: Data necessary for service provision</li>
                <li>• <strong>User Preferences</strong>: Choices made by users</li>
                <li>• <strong>Security Considerations</strong>: Data needed for fraud prevention</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-3">
                <strong>Typical Retention Periods:</strong>
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Account Data</strong>: Retained while account is active</li>
                <li>• <strong>Transaction Records</strong>: 7 years for tax and compliance</li>
                <li>• <strong>Support Communications</strong>: 2 years for service improvement</li>
                <li>• <strong>Analytics Data</strong>: 25 months for trend analysis</li>
                <li>• <strong>Marketing Data</strong>: Until user unsubscribes</li>
              </ul>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">🔄 Policy Changes</h2>
            </div>
            <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
              <p className="text-lg text-green-200 font-semibold mb-3">Updates and Modifications</p>
              <p className="text-sm text-muted-foreground">We may update this policy for:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Legal Changes</strong>: New laws or regulations</li>
                <li>• <strong>Service Evolution</strong>: New features or capabilities</li>
                <li>• <strong>Business Changes</strong>: Mergers, acquisitions, or strategic shifts</li>
                <li>• <strong>User Feedback</strong>: Requests for clarification or improvement</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-3">
                <strong>Notification Process:</strong>
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Email Notice</strong>: For significant changes</li>
                <li>• <strong>Platform Announcement</strong>: In-app notifications</li>
                <li>• <strong>Website Update</strong>: Prominent posting of new policy</li>
                <li>• <strong>Blog Post</strong>: Explanation of changes and rationale</li>
              </ul>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">🛡️ Security Incident Response</h2>
            </div>
            <div className="bg-gray-950 border border-red-500/20 p-6 rounded-2xl">
              <p className="text-lg text-red-200 font-semibold mb-3">Incident Detection and Response</p>
              <p className="text-sm text-muted-foreground">We monitor for:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Unauthorized Access</strong>: Suspicious login attempts or data access</li>
                <li>• <strong>Data Breaches</strong>: Unauthorized data disclosure or theft</li>
                <li>• <strong>System Compromise</strong>: Malware infections or system intrusions</li>
                <li>• <strong>Privacy Violations</strong>: Improper data handling or disclosure</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-3">
                In case of incidents, we will notify users within 72 hours for significant breaches via email and platform notices with guidance on protective steps.
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">📞 Contact Information</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">Privacy Inquiries</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Email</strong>: privacy@zigma.ai</li>
                  <li>• <strong>Data Protection Officer</strong>: dpo@zigma.ai</li>
                  <li>• <strong>Response Time</strong>: Within 30 days for most requests</li>
                </ul>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">Complaints and Concerns</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Internal Review</strong>: privacy@zigma.ai</li>
                  <li>• <strong>Regulatory Authorities</strong>: Contact your local data protection authority</li>
                  <li>• <strong>Third-Party Mediation</strong>: Available in some jurisdictions</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">🌐 Jurisdiction-Specific Information</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">European Union (GDPR)</p>
                <p className="text-sm text-muted-foreground">EU users have additional rights:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Right to be Forgotten</strong>: Complete data deletion</li>
                  <li>• <strong>Data Portability</strong>: Transfer data to other services</li>
                  <li>• <strong>Profiling Objection</strong>: Limit automated decision-making</li>
                  <li>• <strong>Supervisory Authority</strong>: Contact local data protection authority</li>
                </ul>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-6 rounded-2xl">
                <p className="text-lg text-green-200 font-semibold mb-3">California (CCPA/CPRA)</p>
                <p className="text-sm text-muted-foreground">California residents may:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Opt-Out of Sale</strong>: Prevent data sharing for marketing</li>
                  <li>• <strong>Access Rights</strong>: Know what data is collected</li>
                  <li>• <strong>Deletion Rights</strong>: Request personal data removal</li>
                  <li>• <strong>Non-Discrimination</strong>: No penalty for privacy rights exercise</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-green-400 rounded-full" />
              <h2 className="text-2xl font-semibold text-white">🎯 Key Takeaways</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-gray-950 border border-green-500/20 p-4 rounded-xl">
                <p className="text-sm text-green-300 uppercase tracking-[0.3em] mb-2">Our Commitment</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Privacy First: User privacy guides our decisions</li>
                  <li>• Transparency: Clear disclosure of practices</li>
                  <li>• Security: Robust protection of your data</li>
                  <li>• Control: User rights and choices respected</li>
                </ul>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-4 rounded-xl">
                <p className="text-sm text-green-300 uppercase tracking-[0.3em] mb-2">Your Rights</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Access: View and download your data</li>
                  <li>• Correction: Update inaccurate information</li>
                  <li>• Deletion: Remove data when appropriate</li>
                  <li>• Objection: Limit certain data uses</li>
                </ul>
              </div>
              <div className="bg-gray-950 border border-green-500/20 p-4 rounded-xl">
                <p className="text-sm text-green-300 uppercase tracking-[0.3em] mb-2">Our Practices</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Minimization: Collect only necessary data</li>
                  <li>• Security: Industry-standard protections</li>
                  <li>• Compliance: Follow global privacy laws</li>
                  <li>• Improvement: Continuously enhance privacy measures</li>
                </ul>
              </div>
            </div>
          </section>

          <footer className="text-center py-8 border-t border-green-500/20">
            <p className="text-sm text-muted-foreground">
              This Privacy Policy is effective as of <strong>January 28, 2026</strong> and applies to all users of the ZIGMA platform from that date forward.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Thank you for trusting ZIGMA with your data. We are committed to protecting your privacy and providing you with a secure, transparent, and user-controlled experience.
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              ZIGMA Privacy Policy v1.0 | Effective: January 28, 2026
            </p>
          </footer>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
