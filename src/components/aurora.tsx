"use client"

import { Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { useEffect, useState } from "react";
import type { ResponseType } from "@/action";
import { useFormState } from "react-dom";
import {
    useMotionTemplate,
    useMotionValue,
    motion,
    animate,
} from "framer-motion";

import { claimTokens } from "@/action";
import FormInput from "@/components/form-input";
import FormButton from "@/components/form-button";
import StackedNotifications, { NotificationType } from "@/components/notification";
const COLORS_TOP = ["#13FFAA", "#1E67C6", "#CE84CF", "#DD335C"];

const initialResponse: ResponseType = { success: false };

const Aurora = () => {
    const color = useMotionValue(COLORS_TOP[0]);
    const [notification, setNotification] = useState<NotificationType | null>(
        null
    );
    const [state, formAction]
        = useFormState(claimTokens, initialResponse);


    useEffect(() => {
        animate(color, COLORS_TOP, {
            ease: "easeInOut",
            duration: 10,
            repeat: Infinity,
            repeatType: "mirror",
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (state.success) {
            setNotification({
                id: Math.random(),
                text: state.message!,
                success: true,
            });
        }
        if (!state.success && state.message) {
            setNotification({
                id: Math.random(),
                text: state.message!,
                success: false,
            });
        }
    } // eslint-disable-next-line react-hooks/exhaustive-deps
        , [state]);

    const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 0%, #020617 50%, ${color})`;
    const border = useMotionTemplate`1px solid ${color}`;
    const boxShadow = useMotionTemplate`0px 0px 10px ${color}`;

    return (
        <motion.section
            style={{
                backgroundImage,
            }}
            className="relative grid h-screen place-content-center overflow-hidden bg-gray-950 px-4 py-24 text-gray-200"
        >
            <div className="relative z-10 flex flex-col items-center">
                <span className="mb-1.5 inline-block rounded-full bg-gray-600/50 px-3 py-1.5 text-sm">
                    <span className="
          text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-violet-400
          ">
                        DATSProject
                    </span> 🚀
                    <span
                        className="
            text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-sky-500
            "
                    >
                        Peaq Network
                    </span>
                </span>
                <h1 className="max-w-5xl bg-gradient-to-br from-white to-gray-400 bg-clip-text text-center text-3xl font-medium leading-tight text-transparent sm:text-5xl sm:leading-tight md:text-7xl md:leading-tight">
                    Obtain AGUNG Testnet tokens every 24 hours for seamless and confident testnet.
                </h1>
                {/* <p className="my-6 max-w-xl text-center text-base leading-relaxed md:text-lg md:leading-relaxed">
          Agung Test Network faucet prepared with the contributions of DATSProject.
        </p> */}
                <form
                    className="flex flex-col items-center gap-2 "
                    action={formAction}
                >
                    <FormInput border={border} boxShadow={boxShadow} />
                    <FormButton border={border} />
                </form>

                <StackedNotifications
                    notification={notification}
                    setNotification={setNotification}
                />

            </div>

            <div className="absolute inset-0 z-0">
                <Canvas>
                    <Stars radius={50} count={2500} factor={4} fade speed={2} />
                </Canvas>
            </div>
        </motion.section >
    );
};

export default Aurora;