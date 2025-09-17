"use client";
import { cancelCheckoutSession } from "@/app/actions/stripe";

export default function CheckoutCancel(): JSX.Element {
    const handleCancelSubscribe = async () => {
        await cancelCheckoutSession();
    };
    return (
        <>
            <div className="flex flex-col items-center gap-4 mt-16 bg-muted/50">
                <h1 className="text-5xl font-bold h2 w-full px-4 text-center md:w-[805px] md:px-0">Qashboard</h1>
                <p className="body-xl w-full px-4 text-center text-slate-11 md:w-[572px] md:px-0 text-2xl">
                    Lock new possiblilities with AI insights
                </p>
            </div>
            <div className="flex flex-col items-center my-16">
                <div className="flex flex-col items-start gap-6 mx-auto md:flex-row">
                    <div className="flex h-[353px] flex-col gap-8 rounded-lg bg-slate-2 px-6 py-12 border-[3px] border-crimson-6">
                        <div className="flex flex-col gap-2">
                            <h6 className="body-semibold text-slate-12">Startup</h6>
                            <div className="flex items-center gap-3">
                                <h5 className="text-[32px] font-bold leading-9">$ 5</h5>
                                <div className="flex flex-col items-start">
                                    <span className="caption">USD</span>
                                    <span className="caption-s text-slate-11">Billed monthly</span>
                                </div>
                            </div>
                        </div>
                        <button
                            className="inline-flex gap-0.5 justify-center overflow-hidden text-sm font-medium transition rounded-[4px] bg-crimson-9 py-1 px-3 text-white hover:bg-crimson-10 w-[256px]"
                            onClick={handleCancelSubscribe}
                            type="button"
                        >
                            Cancel this plan
                        </button>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <svg className="w-6 h-6 stroke-crimson-9" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    ></path>
                                    <path
                                        d="M22 4L12 14.01L9 11.01"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    ></path>
                                </svg>
                                <p className="body text-slate-11">Cancel Subscribe</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
