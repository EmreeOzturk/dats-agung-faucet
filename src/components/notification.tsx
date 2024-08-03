"use client"
import { AnimatePresence, motion } from "framer-motion";
import { X, CircleAlert, Check } from "lucide-react"
import { useEffect } from "react";

const StackedNotifications = (
    { setNotification, notification }: { notification: any, setNotification: any }
) => {


    const removeNotif = () => {
        setNotification(null);
    };

    return (
        <AnimatePresence>
            {notification && (
                <Notification
                    removeNotif={removeNotif}
                    key={notification.id}
                    {...notification}
                />
            )}
        </AnimatePresence>
    );
};

const NOTIFICATION_TTL = 5000;

export type NotificationType = {
    id: number;
    text: string;
    success: boolean;
};

const Notification = ({
    text,
    id,
    removeNotif,
    success,
}: NotificationType & { removeNotif: Function, success: boolean }) => {
    useEffect(() => {
        const timeoutRef = setTimeout(() => {
            removeNotif();
        }, NOTIFICATION_TTL);

        return () => clearTimeout(timeoutRef);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <motion.div
            layout
            initial={{ y: 15, scale: 0.9, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -25, scale: 0.9, opacity: 0 }}
            transition={{ type: "spring" }}
            className={`p-4 w-80 flex items-start justify-between rounded-lg gap-2 text-sm font-medium shadow-lg text-white fixed z-50 bottom-4 right-4 ${success ? "bg-emerald-600" : "bg-violet-600"}`}
        >
            {success ? <Check className="text-3xl absolute -top-4 -left-4 p-1 rounded-full bg-white text-emerald-600 shadow" /> : <CircleAlert className="text-3xl absolute -top-4 -left-4  rounded-full bg-white text-violet-600 shadow" />}
            <span>{text}</span>
            <button onClick={() => removeNotif(id)} className="ml-auto mt-0.5">
                <X size={18} />
            </button>
        </motion.div>
    );
};

export default StackedNotifications;
