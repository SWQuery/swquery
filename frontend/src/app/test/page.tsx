'use client'
import React, { useState } from 'react';
import { createUser, getUsers } from '../../services/users';
import { buyCredits, refundCredits } from '../../services/credits';

const TestPage = () => {
    const [pubkey, setPubkey] = useState('');
    const [amount, setAmount] = useState<number | ''>('');
    const [results, setResults] = useState<any>({});

    const handleCreateUser = async () => {
        try {
            const response = await createUser(pubkey);
            setResults((prev) => ({ ...prev, createUser: response }));
        } catch (error) {
            console.error(error);
        }
    };

    const handleGetUsers = async () => {
        try {
            const response = await getUsers();
            setResults((prev) => ({ ...prev, getUsers: response }));
        } catch (error) {
            console.error(error);
        }
    };

    const handleBuyCredits = async () => {
        try {
            const response = await buyCredits(pubkey, Number(amount));
            setResults((prev) => ({ ...prev, buyCredits: response }));
        } catch (error) {
            console.error(error);
        }
    };

    const handleRefundCredits = async () => {
        try {
            const response = await refundCredits(pubkey, Number(amount));
            setResults((prev) => ({ ...prev, refundCredits: response }));
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>API Test Page</h1>

            <div>
                <input
                    type="text"
                    placeholder="Enter Pubkey"
                    value={pubkey}
                    onChange={(e) => setPubkey(e.target.value)}
                    style={{ marginRight: '10px' }}
                />
                <input
                    type="number"
                    placeholder="Enter Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                    style={{ marginRight: '10px' }}
                />
            </div>

            <div style={{ marginTop: '20px' }}>
                <button onClick={handleCreateUser} style={{ marginRight: '10px' }}>
                    Create User
                </button>
                <button onClick={handleGetUsers} style={{ marginRight: '10px' }}>
                    Get Users
                </button>
                <button onClick={handleBuyCredits} style={{ marginRight: '10px' }}>
                    Buy Credits
                </button>
                <button onClick={handleRefundCredits}>
                    Refund Credits
                </button>
            </div>

            <div style={{ marginTop: '30px' }}>
                <h2>Results</h2>
                <pre style={{ background: 'purple', padding: '10px', borderRadius: '5px' }}>
                    {JSON.stringify(results, null, 2)}
                </pre>
            </div>
        </div>
    );
};

export default TestPage;
