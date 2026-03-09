import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring } from 'framer-motion';
import { useCountUp } from '../hooks/useScrollReveal';
import api from '../config/api';
import '../styles/home.css';

/* ─── Animation Variants ─── */
const fadeUp = {
    hidden: { opacity: 0, y: 50 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }
    })
};

const fadeIn = {
    hidden: { opacity: 0 },
    visible: (i = 0) => ({
        opacity: 1,
        transition: { duration: 0.6, delay: i * 0.1 }
    })
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const slideLeft = {
    hidden: { opacity: 0, x: -80 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const slideRight = {
    hidden: { opacity: 0, x: 80 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } }
};

/* ─── Tilt Card Component ─── */
const TiltCard = ({ children, className = '' }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useSpring(useTransform(y, [-100, 100], [8, -8]), { stiffness: 300, damping: 30 });
    const rotateY = useSpring(useTransform(x, [-100, 100], [-8, 8]), { stiffness: 300, damping: 30 });

    const handleMouse = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - rect.left - rect.width / 2);
        y.set(e.clientY - rect.top - rect.height / 2);
    };

    return (
        <motion.div
            className={className}
            style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
            onMouseMove={handleMouse}
            onMouseLeave={() => { x.set(0); y.set(0); }}
        >
            {children}
        </motion.div>
    );
};

/* ─── Animated Stat ─── */
const AnimatedStat = ({ end, suffix = '', label, delay = 0 }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });
    const count = useCountUp(end, 2500, isInView);

    return (
        <motion.div
            ref={ref}
            className="stat-card"
            variants={fadeUp}
            custom={delay}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
        >
            <div className="stat-number">{count.toLocaleString()}{suffix}</div>
            <div className="stat-label">{label}</div>
        </motion.div>
    );
};

/* ─── Floating Card ─── */
const FloatingCard = ({ children, className = '', delay = 0, x = 0, y = 0 }) => (
    <motion.div
        className={`floating-expense-card ${className}`}
        initial={{ opacity: 0, scale: 0.8, x, y: y + 30 }}
        animate={{ opacity: 1, scale: 1, x, y }}
        transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'absolute' }}
    >
        {children}
    </motion.div>
);

/* ─── Main Component ─── */
const Home = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [recentGroups, setRecentGroups] = useState([]);
    const heroRef = useRef(null);

    const { scrollYProgress } = useScroll();
    const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);
    const heroY = useTransform(scrollYProgress, [0, 0.15], [0, -60]);

    useEffect(() => {
        if (isAuthenticated) {
            api.get('/groups').then(res => {
                if (res.data.success) {
                    const sorted = res.data.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    setRecentGroups(sorted.slice(0, 3));
                }
            }).catch(() => {});
        }
    }, [isAuthenticated]);

    return (
        <div className="home-container">
            {/* Background grid + gradient */}
            <div className="bg-grid" aria-hidden="true" />
            <div className="bg-glow bg-glow-1" aria-hidden="true" />
            <div className="bg-glow bg-glow-2" aria-hidden="true" />
            <div className="bg-glow bg-glow-3" aria-hidden="true" />

            {/* ═══ NAVBAR ═══ */}
            <motion.nav
                className="home-navbar"
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
                <div className="nav-logo">
                    <span className="logo-icon">💸</span>
                    <span className="logo-text">BillSplit</span>
                </div>
                <div className="nav-links">
                    <a href="#features">Features</a>
                    <a href="#how-it-works">How It Works</a>
                    <a href="#stats">Impact</a>
                    {isAuthenticated ? (
                        <button className="nav-btn primary" onClick={() => navigate('/dashboard')}>Dashboard</button>
                    ) : (
                        <div className="auth-buttons">
                            <button className="nav-btn secondary" onClick={() => navigate('/login')}>Login</button>
                            <button className="nav-btn primary" onClick={() => navigate('/signup')}>Start Splitting</button>
                        </div>
                    )}
                </div>
            </motion.nav>

            <main className="home-main">
                {/* ═══ HERO SECTION ═══ */}
                <motion.section className="hero-section" ref={heroRef} style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}>
                    <div className="hero-content">
                        <div className="hero-left">
                            <motion.div className="hero-badge" variants={fadeUp} initial="hidden" animate="visible" custom={0}>
                                ✨ Trusted by 10,000+ users worldwide
                            </motion.div>
                            <motion.h1 className="hero-title" variants={fadeUp} initial="hidden" animate="visible" custom={1}>
                                Simplest Way to{' '}
                                <span className="hero-gradient-text">Split Expenses</span>{' '}
                                With Friends
                            </motion.h1>
                            <motion.p className="hero-subtitle" variants={fadeUp} initial="hidden" animate="visible" custom={2}>
                                Track shared expenses, manage group spending, and settle balances instantly — without awkward calculations.
                            </motion.p>
                            <motion.div className="hero-cta" variants={fadeUp} initial="hidden" animate="visible" custom={3}>
                                <button className="cta-btn primary large" onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}>
                                    Start Splitting →
                                </button>
                                <button className="cta-btn secondary large" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                                    View Demo
                                </button>
                            </motion.div>
                        </div>
                        <motion.div className="hero-right" variants={scaleIn} initial="hidden" animate="visible">
                            <div className="hero-mockup-wrapper">
                                <img src="/images/dashboard-mockup.png" alt="BillSplit Dashboard" className="hero-mockup" />
                                <div className="mockup-glow" />
                                {/* Floating expense cards */}
                                <FloatingCard delay={0.8} x={-60} y={-40} className="card-violet">
                                    <span>🍕</span> ₹500 Dinner
                                </FloatingCard>
                                <FloatingCard delay={1.0} x={80} y={20} className="card-teal">
                                    <span>🏨</span> ₹1,200 Hotel
                                </FloatingCard>
                                <FloatingCard delay={1.2} x={-30} y={100} className="card-emerald">
                                    <span>🚗</span> ₹300 Uber
                                </FloatingCard>
                            </div>
                        </motion.div>
                    </div>
                </motion.section>

                {/* ═══ PROBLEM SECTION ═══ */}
                <section className="problem-section">
                    <motion.div className="section-header" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
                        <h2>Splitting bills shouldn't be <span className="text-gradient">complicated</span></h2>
                        <p>Sound familiar? These problems disappear with BillSplit.</p>
                    </motion.div>
                    <motion.div className="problem-grid" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}>
                        {[
                            { icon: '📊', title: 'Messy Spreadsheets', desc: 'No more complex spreadsheets to track who paid what.' },
                            { icon: '🤷', title: 'Who Paid What?', desc: 'Confusion about payments disappears with auto-tracking.' },
                            { icon: '😬', title: 'Forgotten Payments', desc: 'Automatic reminders ensure no payment is overlooked.' },
                            { icon: '⚖️', title: 'Uneven Splits', desc: 'Smart algorithms handle complex splits perfectly.' },
                        ].map((problem, i) => (
                            <motion.div key={problem.title} className="problem-card" variants={fadeUp} custom={i}>
                                <div className="problem-icon">{problem.icon}</div>
                                <h3>{problem.title}</h3>
                                <p>{problem.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </section>

                {/* ═══ SOLUTION SECTION (How It Works) ═══ */}
                <section id="how-it-works" className="solution-section">
                    <motion.div className="section-header" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
                        <h2>BillSplit handles <span className="text-gradient">everything</span></h2>
                        <p>Get started in minutes. Say goodbye to spreadsheet math forever.</p>
                    </motion.div>
                    <div className="steps-timeline">
                        {[
                            { num: '01', title: 'Create a Group', desc: 'Set up a space for your trip, apartment, or event.', icon: '👥' },
                            { num: '02', title: 'Invite Friends', desc: 'Share a join link so friends hop straight in.', icon: '🔗' },
                            { num: '03', title: 'Add Expenses', desc: 'Log via typing, voice, or receipt photo.', icon: '💳' },
                            { num: '04', title: 'Track Balances', desc: 'See real-time who owes whom at a glance.', icon: '📈' },
                            { num: '05', title: 'Settle Up', desc: 'Optimized suggestions to minimize transactions.', icon: '✅' },
                        ].map((step, i) => (
                            <motion.div
                                key={step.num}
                                className={`step-item ${i % 2 === 0 ? 'left' : 'right'}`}
                                variants={i % 2 === 0 ? slideLeft : slideRight}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: '-80px' }}
                            >
                                <div className="step-num">{step.num}</div>
                                <div className="step-content">
                                    <div className="step-icon">{step.icon}</div>
                                    <h3>{step.title}</h3>
                                    <p>{step.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                        <div className="timeline-line" />
                    </div>
                </section>

                {/* ═══ FEATURES SECTION ═══ */}
                <section id="features" className="features-section">
                    <motion.div className="section-header" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
                        <h2>Packed with <span className="text-gradient">powerful features</span></h2>
                        <p>Everything you need to manage shared expenses without the headache.</p>
                    </motion.div>
                    <motion.div className="features-grid" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}>
                        {[
                            { icon: '🧮', title: 'Smart Splitting', desc: 'Automatically calculates the optimal way to settle debts, minimizing transactions.' },
                            { icon: '🛡️', title: 'Google Login', desc: 'One-click secure sign in with your Google account. No passwords needed.' },
                            { icon: '🔗', title: 'Invite Links', desc: 'Add friends instantly with a secure, shareable invite link.' },
                            { icon: '🧾', title: 'Receipt Upload', desc: 'Attach photo receipts to keep a reliable record of every shared expense.' },
                            { icon: '🎙️', title: 'Voice Entry', desc: 'Say "I paid ₹500 for pizza" and our AI logs it perfectly — hands-free.' },
                            { icon: '📁', title: 'Subgroups', desc: 'Organize trips by creating subgroups to isolate specific expenses.' },
                        ].map((feature, i) => (
                            <motion.div key={feature.title} variants={fadeUp} custom={i}>
                                <TiltCard className="feature-card">
                                    <div className="feature-icon">{feature.icon}</div>
                                    <h3>{feature.title}</h3>
                                    <p>{feature.desc}</p>
                                </TiltCard>
                            </motion.div>
                        ))}
                    </motion.div>
                </section>

                {/* ═══ PRODUCT DEMO SECTION ═══ */}
                <section className="demo-section">
                    <motion.div className="section-header" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
                        <h2>See it in <span className="text-gradient">action</span></h2>
                        <p>A beautiful dashboard that makes expense management actually enjoyable.</p>
                    </motion.div>
                    <motion.div
                        className="demo-wrapper"
                        initial={{ opacity: 0, scale: 0.88, y: 60 }}
                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                        viewport={{ once: true, margin: '-100px' }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <img src="/images/dashboard-mockup.png" alt="BillSplit Dashboard Preview" className="demo-image" />
                        <div className="demo-glow" />
                        {/* Floating UI elements */}
                        <motion.div className="demo-float demo-float-1"
                            animate={{ y: [0, -15, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            <span>💰</span> Settlement Ready
                        </motion.div>
                        <motion.div className="demo-float demo-float-2"
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                        >
                            <span>📊</span> Balance: +₹1,450
                        </motion.div>
                    </motion.div>
                </section>

                {/* ═══ QUICK ACTIONS (auth only) ═══ */}
                {isAuthenticated && (
                    <section className="quick-actions-section">
                        <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                            Quick Actions
                        </motion.h2>
                        <motion.div className="quick-actions-grid" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                            {[
                                { icon: '➕', label: 'Create Group', path: '/dashboard' },
                                { icon: '🤝', label: 'Join Group', path: '/dashboard' },
                                { icon: '💸', label: 'Add Expense', path: '/groups' },
                                { icon: '📂', label: 'View Groups', path: '/groups' },
                            ].map((action, i) => (
                                <motion.button key={action.label} className="action-card" variants={fadeUp} custom={i} onClick={() => navigate(action.path)} whileHover={{ y: -6, transition: { duration: 0.2 } }}>
                                    <span className="action-icon">{action.icon}</span>
                                    <h3>{action.label}</h3>
                                </motion.button>
                            ))}
                        </motion.div>
                    </section>
                )}

                {/* ═══ RECENT GROUPS (auth only) ═══ */}
                {isAuthenticated && recentGroups.length > 0 && (
                    <motion.section className="recent-groups-section" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                        <div className="recent-groups-header">
                            <h2>Jump Back In</h2>
                            <button className="nav-btn secondary" onClick={() => navigate('/groups')}>View All →</button>
                        </div>
                        <div className="recent-groups-grid">
                            {recentGroups.map((group, i) => (
                                <motion.div key={group.id} className="recent-group-card" variants={fadeUp} custom={i} whileHover={{ y: -4 }} onClick={() => navigate(`/groups/${group.id}`)}>
                                    <div className="group-card-header">
                                        <h3>{group.name}</h3>
                                        <span className="member-count">{group.memberCount || 1} members</span>
                                    </div>
                                    {group.description && <p className="group-desc">{group.description}</p>}
                                    <span className="open-link">Open Group →</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>
                )}

                {/* ═══ STATISTICS ═══ */}
                <section id="stats" className="statistics-section">
                    <motion.div className="section-header" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
                        <h2>Our <span className="text-gradient">impact</span></h2>
                        <p>Numbers that speak for themselves.</p>
                    </motion.div>
                    <div className="stats-grid">
                        <AnimatedStat end={10000} suffix="+" label="Active Users" delay={0} />
                        <AnimatedStat end={2} suffix="M+" label="Expenses Tracked" delay={1} />
                        <AnimatedStat end={5000} suffix="+" label="Groups Created" delay={2} />
                        <AnimatedStat end={49} suffix="/5" label="User Rating" delay={3} />
                    </div>
                </section>

                {/* ═══ TESTIMONIALS ═══ */}
                <section className="testimonials-section">
                    <motion.div className="section-header" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
                        <h2>Loved by <span className="text-gradient">thousands</span></h2>
                    </motion.div>
                    <motion.div className="testimonials-track" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}>
                        {[
                            { name: 'Priya S.', review: 'BillSplit saved our Goa trip from turning into a fight about money. Absolute lifesaver!', stars: 5 },
                            { name: 'Rahul M.', review: 'The voice feature is incredible. I just say what I paid and it handles everything.', stars: 5 },
                            { name: 'Ananya K.', review: 'Finally a clean, modern expense app. The settlement suggestions are genius.', stars: 5 },
                            { name: 'Vikram T.', review: 'We use it for our flat expenses every month. Subgroups feature is perfect for this.', stars: 5 },
                        ].map((t, i) => (
                            <motion.div key={t.name} className="testimonial-card" variants={fadeUp} custom={i}>
                                <div className="testimonial-stars">{'⭐'.repeat(t.stars)}</div>
                                <p className="testimonial-text">"{t.review}"</p>
                                <div className="testimonial-author">
                                    <div className="author-avatar">{t.name[0]}</div>
                                    <span>{t.name}</span>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </section>

                {/* ═══ FINAL CTA ═══ */}
                {!isAuthenticated && (
                    <motion.section
                        className="cta-section"
                        initial={{ opacity: 0, y: 60 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="cta-container">
                            <div className="cta-coins" aria-hidden="true">
                                <span className="cta-coin c1">💰</span>
                                <span className="cta-coin c2">💳</span>
                                <span className="cta-coin c3">🪙</span>
                                <span className="cta-coin c4">💵</span>
                            </div>
                            <h2>Start Splitting Expenses <span className="hero-gradient-text">Smarter</span></h2>
                            <p>Join thousands of users who stopped fighting about money.</p>
                            <div className="cta-buttons">
                                <button className="cta-btn primary large" onClick={() => navigate('/signup')}>Create Free Account →</button>
                                <button className="cta-btn secondary large" onClick={() => navigate('/login')}>Sign in with Google</button>
                            </div>
                        </div>
                    </motion.section>
                )}
            </main>

            <footer className="home-footer">
                <p>&copy; {new Date().getFullYear()} BillSplit. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Home;
