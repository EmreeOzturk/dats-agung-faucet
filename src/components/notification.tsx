"use client"
import { AnimatePresence, motion } from "framer-motion";
import { X, CircleAlert } from "lucide-react"
import { useEffect, useState } from "react";

const StackedNotifications = (
    { setNotification, notification, text }: { notification: any, setNotification: any, text: string }
) => {


    const removeNotif = () => {
        setNotification(null);
    };

    return (
        <div className="bg-slate-900 min-h-[200px] flex items-center justify-center">
            <AnimatePresence>
                {notification && (
                    <Notification
                        removeNotif={removeNotif}
                        key={notification.id}
                        text={text}
                        {...notification}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

const NOTIFICATION_TTL = 5000;

export type NotificationType = {
    id: number;
    text: string;
};

const Notification = ({
    text,
    id,
    removeNotif,
}: NotificationType & { removeNotif: Function }) => {
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
            className="p-4 w-80 flex items-start rounded-lg gap-2 text-sm font-medium shadow-lg text-white bg-violet-600 fixed z-50 bottom-4 right-4"
        >
            <CircleAlert className="text-3xl absolute -top-4 -left-4 p-2 rounded-full bg-white text-violet-600 shadow" />
            <span>{text}</span>
            <button onClick={() => removeNotif(id)} className="ml-auto mt-0.5">
                <X />
            </button>
        </motion.div>
    );
};

export default StackedNotifications;
