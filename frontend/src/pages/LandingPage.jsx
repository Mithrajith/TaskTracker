import React from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import {
  Sparkles,
  BookOpen,
  TrendingUp,
  Award,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Laptop,
  Check,
} from 'lucide-react';

export const LandingPage = () => {
  const { info } = useToast();

  const handleComingSoon = (label) => {
    info(`${label} is coming soon. Stay tuned!`);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F0] text-[#172E2A] flex flex-col selection:bg-[#064E45]/20 selection:text-[#064E45]">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-[#FAF8F0]/90 backdrop-blur-md border-b border-[#DDE8DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-[#064E45] flex items-center justify-center text-white group-hover:scale-105 transition-transform shadow-sm">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-extrabold text-[#064E45] tracking-tight block leading-tight">
                AI Engineer
              </span>
              <span className="text-xs font-semibold text-[#2D806B] tracking-wider uppercase block">
                Task Tracker
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#71817B]">
            <a href="#home" className="text-[#064E45] hover:text-[#064E45] transition-colors">
              Home
            </a>
            <a href="#features" className="hover:text-[#064E45] transition-colors">
              Features
            </a>
            <button
              type="button"
              onClick={() => handleComingSoon('Curriculum')}
              className="hover:text-[#064E45] transition-colors"
            >
              Curriculum
            </button>
            <button
              type="button"
              onClick={() => handleComingSoon('About')}
              className="hover:text-[#064E45] transition-colors"
            >
              About
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-[#064E45] hover:bg-[#EAF7EF] border border-[#DDE8DF] transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-[#172E2A] bg-[#FFA77E] hover:bg-[#ff9668] transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span>Get Started</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-[#E0F3E8]/40 border-b border-[#DDE8DF]">
        {/* Soft Organic Background Elements */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-24 w-96 h-96 rounded-full bg-[#EAF7EF] blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-0 -translate-x-20 w-80 h-80 rounded-full bg-[#E0F3E8] blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF7EF] border border-[#DDE8DF] text-[#064E45] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#2D806B]" />
                <span>Guided, Hands-On Learning Track</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#064E45] tracking-tight leading-[1.12]">
                Track Tasks. <br className="hidden sm:inline" />
                Build Skills. <br className="hidden sm:inline" />
                <span className="text-[#2D806B] underline decoration-[#FFA77E] decoration-wavy decoration-2">
                  Become an AI Engineer.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#71817B] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Work through the AI Engineer roadmap with practical assignments. Build real models and tools, submit proof screenshots and repositories, get detailed mentor reviews, and advance your career.
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/signup"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl text-base font-bold text-[#172E2A] bg-[#FFA77E] hover:bg-[#ff9668] transition-all flex items-center justify-center gap-2 group shadow-sm"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#features"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl text-base font-bold text-[#064E45] bg-[#FAF8F0] hover:bg-[#EAF7EF] border border-[#DDE8DF] transition-colors text-center"
                >
                  Learn More
                </a>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-[#DDE8DF] flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#71817B] font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2D9B70]" />
                  Verified Code Proofs
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2D9B70]" />
                  Sequential Progression
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2D9B70]" />
                  1-on-1 Mentor Reviews
                </span>
              </div>
            </div>

            {/* Right Illustration & Floating UI Elements */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="w-full max-w-md bg-[#EAF7EF] border border-[#DDE8DF] rounded-3xl p-6 sm:p-8 relative shadow-sm">
                {/* Organic Decorative Leaf Accents */}
                <svg
                  className="absolute -top-6 -right-6 w-20 h-20 text-[#2D806B]/20 pointer-events-none"
                  viewBox="0 0 100 100"
                  fill="currentColor"
                >
                  <path d="M50 0 C70 30, 100 50, 100 100 C50 100, 30 70, 0 50 C0 0, 30 0, 50 0 Z" />
                </svg>

                {/* Friendly Developer Vector Art */}
                <div className="bg-white rounded-2xl p-5 border border-[#DDE8DF] space-y-4 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-[#DDE8DF]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#064E45] flex items-center justify-center text-white font-bold text-xs">
                        <Laptop className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#064E45]">Daily AI Lab #04</h4>
                        <span className="text-[10px] text-[#71817B]">Fine-tuning Llama with LoRA</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF7EF] text-[#2D9B70] border border-[#DDE8DF] flex items-center gap-1">
                      <Check className="w-3 h-3" /> Approved
                    </span>
                  </div>

                  {/* Code snippet illustration */}
                  <div className="p-3 bg-[#FAF8F0] rounded-xl border border-[#DDE8DF] font-mono text-[11px] text-[#172E2A] space-y-1">
                    <p className="text-[#2D806B] font-semibold">// Step 4: Quantized LoRA Config</p>
                    <p className="text-[#064E45]">from peft import LoraConfig, get_peft_model</p>
                    <p className="text-[#71817B]">config = LoraConfig(r=16, lora_alpha=32)</p>
                    <p className="text-[#2D9B70]">model = get_peft_model(base_model, config)</p>
                  </div>

                  {/* Mentor Review Pill */}
                  <div className="p-3 bg-[#EAF7EF] rounded-xl border border-[#DDE8DF] flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#064E45] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      ★
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-[#064E45] block">
                        Mentor Feedback
                      </span>
                      <p className="text-[11px] text-[#71817B] italic">
                        "Clean gradient clipping & loss curves verified. Next task unlocked!"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Floating Metric Pill 1 */}
                <div className="absolute -bottom-4 -left-4 bg-white border border-[#DDE8DF] rounded-2xl p-3 flex items-center gap-3 shadow-md">
                  <div className="w-10 h-10 rounded-xl bg-[#EAF7EF] text-[#2D9B70] flex items-center justify-center font-bold text-sm">
                    92%
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-[#71817B] uppercase block">Roadmap Status</span>
                    <span className="text-xs font-extrabold text-[#064E45]">On Track to Graduate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section id="features" className="py-20 bg-[#FAF8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#064E45] bg-[#EAF7EF] px-3.5 py-1 rounded-full border border-[#DDE8DF]">
              Why It Works
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#064E45] tracking-tight">
              Built for Practical, Hands-On Learning
            </h2>
            <p className="text-sm sm:text-base text-[#71817B]">
              No passive video lectures. Every concept is reinforced through hands-on coding, proof submissions, and step-by-step progression.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-[#EAF7EF] rounded-2xl p-7 border border-[#DDE8DF] space-y-4 hover:border-[#2D806B]/50 transition-all shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#DDE8DF] flex items-center justify-center text-[#064E45] shadow-xs">
                <BookOpen className="w-6 h-6 text-[#064E45]" />
              </div>
              <h3 className="text-lg font-bold text-[#064E45]">
                Structured Learning
              </h3>
              <p className="text-sm text-[#71817B] leading-relaxed">
                Step-by-step roadmap from Python environments and vector math to multi-agent architectures and LLM quantization. Prerequisites enforce real comprehension.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#EAF7EF] rounded-2xl p-7 border border-[#DDE8DF] space-y-4 hover:border-[#2D806B]/50 transition-all shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#DDE8DF] flex items-center justify-center text-[#064E45] shadow-xs">
                <TrendingUp className="w-6 h-6 text-[#064E45]" />
              </div>
              <h3 className="text-lg font-bold text-[#064E45]">
                Track Progress
              </h3>
              <p className="text-sm text-[#71817B] leading-relaxed">
                Transparent milestones with live progress charts, approved percentages, and submission history so you always know where you stand.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#EAF7EF] rounded-2xl p-7 border border-[#DDE8DF] space-y-4 hover:border-[#2D806B]/50 transition-all shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#DDE8DF] flex items-center justify-center text-[#2D9B70] shadow-xs">
                <Award className="w-6 h-6 text-[#2D9B70]" />
              </div>
              <h3 className="text-lg font-bold text-[#064E45]">
                Build Real Skills
              </h3>
              <p className="text-sm text-[#71817B] leading-relaxed">
                Upload verified proof screenshots and repository commits. Receive actionable mentor reviews with requested corrections or immediate approvals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-16 bg-[#FAF8F0]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-[#064E45] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden space-y-6 shadow-md">
            <div className="relative z-10 max-w-xl mx-auto space-y-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Ready to start your AI Engineering journey?
              </h2>
              <p className="text-sm text-[#E0F3E8] leading-relaxed">
                Create an account or log in to your student workspace, complete today's assignment, and submit your proof.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-base font-bold text-[#172E2A] bg-[#FFA77E] hover:bg-[#ff9668] transition-all shadow-sm"
                >
                  <span>Sign Up Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-base font-bold text-white bg-[#064E45] hover:bg-[#053d36] border border-[#2D806B] transition-all"
                >
                  <span>Sign In</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-[#DDE8DF] text-center text-xs text-[#71817B] bg-[#FAF8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#064E45]" />
            <span className="font-bold text-[#064E45]">AI Engineer Student Task Tracker</span>
          </div>
          <p>© {new Date().getFullYear()} AI Engineer Program. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
