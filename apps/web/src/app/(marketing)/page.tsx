'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { LandingHeader } from '@/components/layout/header';
import { LinkButton } from '@/components/ui/link-button';
import {
  Zap,
  Brain,
  TrendingUp,
  Upload,
  FileText,
  BarChart3,
  CheckCircle,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';

// Dynamic import for Three.js scene to avoid SSR issues and improve initial load
const ParticleScene = dynamic(
  () => import('@/components/three/particle-scene').then((mod) => mod.ParticleScene),
  { ssr: false }
);

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Three.js Particle Background */}
        <ParticleScene />
        {/* Gradient overlay for content readability - above particles, below content */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-background/40 to-background pointer-events-none" />

        <div className="relative z-[2] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-8"
            >
              <Zap className="w-4 h-4" />
              AI-Powered Resume Matching
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight"
            >
              Match Your Resume to{' '}
              <span className="text-primary-600 dark:text-primary-400">
                Any Job
              </span>{' '}
              in Seconds
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg sm:text-xl text-foreground-secondary max-w-2xl mx-auto"
            >
              Get instant feedback on how well your resume matches job descriptions.
              Identify gaps, understand your strengths, and improve your chances.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <LinkButton href="/register" size="xl" className="w-full sm:w-auto">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </LinkButton>
              <LinkButton href="#how-it-works" variant="outline" size="xl" className="w-full sm:w-auto">
                See How It Works
              </LinkButton>
            </motion.div>

            {/* Trust indicator */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-8 text-sm text-foreground-muted"
            >
              No credit card required. Start analyzing in 30 seconds.
            </motion.p>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex justify-center mt-16"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-foreground-muted"
            >
              <ChevronDown className="w-6 h-6" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32 bg-background-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl font-bold text-foreground"
            >
              Everything You Need to Land Your Dream Job
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="mt-4 text-lg text-foreground-secondary max-w-2xl mx-auto"
            >
              Our AI analyzes your resume against job descriptions and gives you actionable insights.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Zap,
                title: 'Instant Analysis',
                description: 'Get detailed match scores and insights in seconds, not hours. Our AI processes your resume instantly.',
                color: 'text-accent-500',
                bg: 'bg-accent-100 dark:bg-accent-900/30',
              },
              {
                icon: Brain,
                title: 'Smart Insights',
                description: 'Understand exactly what\'s missing. Get actionable suggestions to improve your resume for each role.',
                color: 'text-primary-500',
                bg: 'bg-primary-100 dark:bg-primary-900/30',
              },
              {
                icon: TrendingUp,
                title: 'Track Progress',
                description: 'Compare multiple jobs, track improvements over time, and see how your match scores evolve.',
                color: 'text-success-500',
                bg: 'bg-success-100 dark:bg-success-700/20',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={scaleIn}
                className="relative p-8 rounded-2xl bg-card border border-border hover:border-border-hover hover:shadow-medium transition-all duration-300"
              >
                <div className={`w-14 h-14 ${feature.bg} rounded-xl flex items-center justify-center mb-6`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-foreground-secondary">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl font-bold text-foreground"
            >
              How It Works
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="mt-4 text-lg text-foreground-secondary"
            >
              Three simple steps to improve your job applications.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8 lg:gap-12"
          >
            {[
              {
                step: 1,
                icon: Upload,
                title: 'Upload Your Resume',
                description: 'Upload your resume in PDF or DOCX format. We support all standard resume formats.',
              },
              {
                step: 2,
                icon: FileText,
                title: 'Paste Job Description',
                description: 'Copy and paste the job description you\'re interested in. Include requirements and qualifications.',
              },
              {
                step: 3,
                icon: BarChart3,
                title: 'Get Instant Insights',
                description: 'See your match score, strengths, gaps, and actionable suggestions to improve.',
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                variants={fadeInUp}
                className="relative text-center"
              >
                {/* Step number */}
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-900 dark:bg-primary-100 text-white dark:text-primary-900 text-lg font-bold mb-6">
                  {item.step}
                </div>

                {/* Connector line - hidden on mobile */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-6 left-[60%] w-[80%] border-t-2 border-dashed border-border" />
                )}

                {/* Icon */}
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-background-secondary border border-border flex items-center justify-center">
                  <item.icon className="w-10 h-10 text-primary-600 dark:text-primary-400" />
                </div>

                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-foreground-secondary">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary-900 dark:bg-primary-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center"
          >
            {[
              { value: '50K+', label: 'Analyses Completed' },
              { value: '85%', label: 'Success Rate' },
              { value: '4.9', label: 'User Rating' },
              { value: '<5s', label: 'Average Analysis Time' },
            ].map((stat) => (
              <motion.div key={stat.label} variants={fadeInUp}>
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-primary-200">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Stop Guessing, Start Matching
              </h2>
              <p className="text-lg text-foreground-secondary mb-8">
                Traditional resume reviews take hours and often miss key insights.
                Our AI analyzes every detail against the specific job requirements.
              </p>

              <ul className="space-y-4">
                {[
                  'Identify skill gaps before you apply',
                  'Understand what recruiters are looking for',
                  'Get specific improvement suggestions',
                  'Compare your fit across multiple jobs',
                  'Track your improvements over time',
                ].map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-success-500 flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <LinkButton href="/register" size="lg">
                  Start Your Free Analysis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </LinkButton>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              {/* Decorative card mockup */}
              <div className="relative rounded-2xl bg-card border border-border shadow-strong p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-xl bg-success-100 dark:bg-success-700/20 flex items-center justify-center">
                    <span className="text-2xl font-bold text-success-600">87%</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Good Match</h4>
                    <p className="text-sm text-foreground-secondary">Senior Developer @ TechCorp</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground-secondary">Technical Skills</span>
                      <span className="font-medium text-foreground">92%</span>
                    </div>
                    <div className="h-2 bg-background-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-success-500 rounded-full" style={{ width: '92%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground-secondary">Experience Match</span>
                      <span className="font-medium text-foreground">85%</span>
                    </div>
                    <div className="h-2 bg-background-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-accent-500 rounded-full" style={{ width: '85%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground-secondary">Keywords</span>
                      <span className="font-medium text-foreground">78%</span>
                    </div>
                    <div className="h-2 bg-background-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-warning-500 rounded-full" style={{ width: '78%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent-500/10 rounded-full blur-2xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-background-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
              Ready to Improve Your Job Applications?
            </h2>
            <p className="text-lg text-foreground-secondary mb-10 max-w-2xl mx-auto">
              Join thousands of job seekers who have improved their applications with our AI-powered resume matching.
            </p>
            <LinkButton href="/register" size="xl">
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </LinkButton>
            <p className="mt-4 text-sm text-foreground-muted">
              No credit card required
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-900 dark:bg-primary-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white dark:text-primary-900" />
              </div>
              <span className="font-semibold text-foreground">JobMatch Lite</span>
            </div>
            <p className="text-sm text-foreground-muted">
              Built with Next.js, ElysiaJS, and AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
