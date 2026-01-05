
import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, addDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugFirebase() {
    const [logs, setLogs] = useState<string[]>([]);
    const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle');

    const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

    const runDiagnostics = async () => {
        setStatus('running');
        setLogs([]);
        addLog('Starting diagnostics...');

        // 1. Check Auth
        const user = auth.currentUser;
        if (!user) {
            addLog('❌ No user logged in. Please log in first.');
            setStatus('done');
            return;
        }
        addLog(`✅ User logged in: ${user.email} (${user.uid})`);

        // 2. Test Firestore Public Read/Write (if applicable in rules)
        // Skipping public test, testing authenticated user access

        // 3. Test Profile Creation (Write)
        try {
            addLog('Testing Firestore Write (profiles)...');
            const testDocRef = doc(db, 'profiles', user.uid);
            await setDoc(testDocRef, {
                test_write: true,
                updated_at: new Date().toISOString()
            }, { merge: true });
            addLog('✅ Successfully wrote to profile document.');
        } catch (e: any) {
            addLog(`❌ Failed to write profile: ${e.message} (Code: ${e.code})`);
        }

        // 4. Test Profile Read
        try {
            addLog('Testing Firestore Read (profiles)...');
            const testDocRef = doc(db, 'profiles', user.uid);
            const snap = await getDoc(testDocRef);
            if (snap.exists()) {
                addLog(`✅ Successfully read profile. Data: ${JSON.stringify(snap.data())}`);
            } else {
                addLog('⚠️ Profile document does not exist (Read succeeded but doc missing).');
            }
        } catch (e: any) {
            addLog(`❌ Failed to read profile: ${e.message} (Code: ${e.code})`);
        }

        // 5. Test another collection (e.g. contact_inquiries)
        try {
            addLog('Testing Firestore Write (contact_inquiries - usually public)...');
            await addDoc(collection(db, 'contact_inquiries'), {
                test: true,
                created_at: new Date().toISOString()
            });
            addLog('✅ Successfully wrote to contact_inquiries.');
        } catch (e: any) {
            addLog(`❌ Failed to write contact_inquiries: ${e.message} (Code: ${e.code})`);
        }

        addLog('Diagnostics complete.');
        setStatus('done');
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Firebase Connectivity Diagnostics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <p className="mb-2">Click the button below to verify your connection and permissions.</p>
                        <Button onClick={runDiagnostics} disabled={status === 'running'}>
                            {status === 'running' ? 'Running...' : 'Run Diagnostics'}
                        </Button>
                    </div>

                    <div className="bg-black text-green-400 p-4 rounded-md font-mono text-xs h-96 overflow-auto">
                        {logs.length === 0 ? (
                            <span className="text-gray-500">// Logs will appear here...</span>
                        ) : (
                            logs.map((log, i) => <div key={i}>{log}</div>)
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
