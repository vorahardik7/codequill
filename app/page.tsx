"use client";

import LeftSidebar from "@/components/LeftSidebar";
import { Live } from "@/components/Live";
import { RightSidebar } from "@/components/RightSidebar";
import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import {
    handleCanvasMouseDown,
    handleCanvaseMouseMove,
    handleResize,
    initializeFabric,
} from "@/lib/canvas";
import { ActiveElement } from "@/types/type";
import Navbar from "@/components/Navbar";
import { useMutation, useStorage } from "@/liveblocks.config";

export default function Page() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricRef = useRef<fabric.Canvas | null>(null);
    const shapeRef = useRef<fabric.Object | null>(null);
    const selectedShapeRef = useRef<string | null>("rectangle");
    const isDrawing = useRef(false);
    const [activeElement, setActiveElement] = useState<ActiveElement>({
        name: "",
        value: "",
        icon: "",
    });

    const canvasObjects = useStorage((root) => root.canvasObjects);
    const syncShapeInStorage = useMutation(({ storage }, object) => {
        if (!object) return;
        const { objectId } = object;
        const shapeData = object.toJSON();
        shapeData.objectId = objectId;

        const canvasObjects = storage.get("canvasObjects");
        canvasObjects.set(objectId, shapeData);
    }, []);

    const handleActiveElement = (element: ActiveElement) => {
        setActiveElement(element);
        selectedShapeRef.current = element?.value as string;
    };

    useEffect(() => {
        const canvas = initializeFabric({ canvasRef, fabricRef });

        canvas.on("mouse:down", (options) => {
            handleCanvasMouseDown({
                options,
                canvas,
                isDrawing,
                shapeRef,
                selectedShapeRef,
            });
        });
        canvas.on("mouse:down", (options) => {
            handleCanvaseMouseMove({
                options,
                canvas,
                isDrawing,
                shapeRef,
                selectedShapeRef,
                syncShapeInStorage,
            });
        });

        window.addEventListener("resize", () => {
            handleResize({ fabricRef });
        });
    }, []);

    return (
        <main className="h-screen overflow-hidden">
            <Navbar
                activeElement={activeElement}
                handleActiveElement={handleActiveElement}
            />
            <section className="flex h-full flex-row">
                <LeftSidebar />
                <Live canvasRef={canvasRef} />
                <RightSidebar />
            </section>
        </main>
    );
}
