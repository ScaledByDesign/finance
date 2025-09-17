import React from 'react';

const CreditCardComponent = () => {
    return (
        <div className="p-6 bg-white rounded-xl shadow-md max-w-xl mx-auto mt-5">
            <h2 className="text-2xl font-semibold mb-2">How should I tackle my credit card debt?</h2>
            <p className="mb-5">We can help with that.</p>
            
            <div className="p-5 rounded-lg bg-black text-white">
                <div className="text-3xl font-bold mb-4">Slope</div>
                <h3 className="text-xl mb-1">PATRIC BATEMAN</h3>
                <h4 className="text-lg font-mono">0004 4889 3989 5660</h4>
            </div>
        </div>
    );
}

export default CreditCardComponent;