"use client";

import { signIn, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
    CurrencyDollarIcon,
    ChartBarIcon,
    ShieldCheckIcon,
    SparklesIcon,
    ArrowLeftIcon,
    CheckIcon
} from '@heroicons/react/outline';

const LoginForm = () => {
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
    const [isLoading, setIsLoading] = useState(false);

    const handleSignIn = async () => {
        setIsLoading(true);
        try {
            await signIn("google", { callbackUrl });
        } catch (error) {
            setIsLoading(false);
        }
    };

    // Features list for the left side
    const features = [
        { icon: ChartBarIcon, text: "Real-time financial analytics" },
        { icon: SparklesIcon, text: "AI-powered insights" },
        { icon: ShieldCheckIcon, text: "Bank-level security" },
    ];

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Feature Showcase */}
            <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}></div>
                </div>

                <div className="relative z-10 flex flex-col justify-between">
                    {/* Logo and Brand */}
                    <div>
                        <Link href="/" className="inline-flex items-center gap-3 text-white mb-12 hover:opacity-90 transition-opacity">
                            <CurrencyDollarIcon className="h-10 w-10" />
                            <span className="text-2xl font-bold">FinanceAI</span>
                        </Link>

                        <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6">
                            Take Control of Your
                            <span className="block text-blue-200 mt-2">Financial Future</span>
                        </h1>

                        <p className="text-xl text-blue-100 mb-12 leading-relaxed">
                            Join thousands of users who are already saving money and building wealth with our AI-powered financial advisor.
                        </p>

                        {/* Feature List */}
                        <div className="space-y-4">
                            {features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-3 text-white">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                        <feature.icon className="h-5 w-5" />
                                    </div>
                                    <span className="text-lg">{feature.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Testimonial */}
                    <div className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                        <div className="flex gap-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                                <svg key={i} className="h-5 w-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                        <p className="text-white/90 italic mb-3">
                            &quot;FinanceAI helped me save over $500 per month by identifying unnecessary subscriptions and optimizing my spending.&quot;
                        </p>
                        <p className="text-white/70 text-sm">— Sarah J., Small Business Owner</p>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md">
                    {/* Back to Home Link */}
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors">
                        <ArrowLeftIcon className="h-4 w-4" />
                        Back to home
                    </Link>

                    {/* Login Card */}
                    <div className="bg-white p-8 rounded-2xl shadow-xl">
                        <div className="text-center mb-8">
                            {/* Mobile Logo */}
                            <div className="lg:hidden flex justify-center mb-6">
                                <div className="inline-flex items-center gap-2">
                                    <CurrencyDollarIcon className="h-10 w-10 text-blue-600" />
                                    <span className="text-2xl font-bold text-gray-900">FinanceAI</span>
                                </div>
                            </div>

                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
                            <p className="text-gray-600">Sign in to access your financial dashboard</p>
                        </div>

                        {/* OAuth Button - Google Only */}
                        <div className="space-y-4">
                            <button
                                onClick={handleSignIn}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <svg className="animate-spin h-5 w-5 text-gray-600" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                ) : (
                                    <>
                                        <Image
                                            src="https://www.svgrepo.com/show/475656/google-color.svg"
                                            width={24}
                                            height={24}
                                            alt="Google logo"
                                        />
                                        <span className="text-gray-700 font-medium">Continue with Google</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Terms and Privacy */}
                        <p className="text-xs text-gray-500 text-center mt-6">
                            By continuing, you agree to our{' '}
                            <Link href="#" className="text-blue-600 hover:underline">Terms of Service</Link>
                            {' '}and{' '}
                            <Link href="#" className="text-blue-600 hover:underline">Privacy Policy</Link>
                        </p>

                        {/* Sign Up Link */}
                        <div className="text-center mt-8 pt-6 border-t border-gray-200">
                            <p className="text-gray-600">
                                Don&apos;t have an account?{' '}
                                <Link href="/login" className="text-blue-600 font-medium hover:underline">
                                    Start your free trial
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;