"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "./ui/dialog";
import { PlusCircleIcon, PlusIcon } from "lucide-react";
import ConnectButton from "./ConnectButton";
import { Button } from "./ui/button";
const ConnectButtonModal = () => {
    const [showConnectModal, setShowConnectModal] = useState(false);

    return (
        <div>
            <Button
                className="mt-4 p-4 inline-flex items-center border rounded-md justify-center w-full font-medium shadow-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 hover:bg-emerald-900 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:bg-primary/90"
                onClick={() => {
                    setShowConnectModal(true);
                }}
                variant="outline"
            >
                <PlusCircleIcon className="w-[22px] mr-2" />
                Add New Accounts
            </Button>
            <Dialog
            modal={false}
            open={showConnectModal}
            onOpenChange={setShowConnectModal}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="mb-4">
                            Connect Account
                        </DialogTitle>
                        <ConnectButton
                            type={0}
                            setShowConnectModal={setShowConnectModal}
                        >
                            Connect Bank Account
                        </ConnectButton>
                        <ConnectButton
                            type={1}
                            setShowConnectModal={setShowConnectModal}
                        >
                            Connect Credit Card or Loan
                        </ConnectButton>
                        <ConnectButton
                            type={2}
                            setShowConnectModal={setShowConnectModal}
                        >
                            Connect Investment
                        </ConnectButton>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ConnectButtonModal;
