"use client";

import LeftSidebar from "@/components/LeftSidebar";
import { Live } from "@/components/Live";
import { RightSidebar } from "@/components/RightSidebar";
import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import {
    handleCanvasMouseDown,
    handleCanvasMouseUp,
    handleCanvasObjectModified,
    handleCanvaseMouseMove,
    handleResize,
    initializeFabric,
    renderCanvas,
} from "@/lib/canvas";
import { ActiveElement } from "@/types/type";
import Navbar from "@/components/Navbar";
import { useMutation, useStorage } from "@/liveblocks.config";
import { defaultNavElement } from "@/constants";
import { handleDelete } from "@/lib/key-events";

export default function Page() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricRef = useRef<fabric.Canvas | null>(null);
    const shapeRef = useRef<fabric.Object | null>(null);
    const selectedShapeRef = useRef<string | null>("rectangle");
    const activeObjectRef = useRef<fabric.Object | null>(null);
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

    const deleteAllShapes = useMutation(({ storage }) => {
        const canvasObjects = storage.get("canvasObjects");

        for (const [key, value] of canvasObjects.entries()) {
            canvasObjects.delete(key);
        }

        return canvasObjects.size === 0;
    }, []);

    // to just delete a single object by id
    const deleteShapeFromStorage = useMutation(
        ({ storage }, objectId: string) => {
            const canvasObjects = storage.get("canvasObjects");

            canvasObjects.delete(objectId);
        },
        []
    );

    // to handle active element from navbar
    const handleActiveElement = (element: ActiveElement) => {
        setActiveElement(element);

        switch (element?.value) {
            case "reset":
                deleteAllShapes();
                fabricRef.current?.clear();
                setActiveElement(defaultNavElement);
                break;

            case "delete":
                handleDelete(fabricRef.current as any, deleteShapeFromStorage);
                setActiveElement(defaultNavElement);
                break;

            default:
                break;
        }

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
        canvas.on("mouse:move", (options) => {
            handleCanvaseMouseMove({
                options,
                canvas,
                isDrawing,
                shapeRef,
                selectedShapeRef,
                syncShapeInStorage,
            });
        });
        canvas.on("mouse:up", () => {
            handleCanvasMouseUp({
                canvas,
                isDrawing,
                shapeRef,
                selectedShapeRef,
                activeObjectRef,
                syncShapeInStorage,
                setActiveElement,
            });
        });

        // to sync the objects in different rooms
        canvas.on("object:modify", (options) => {
            handleCanvasObjectModified({
                options,
                syncShapeInStorage,
            });
        });

        window.addEventListener("resize", () => {
            handleResize({ fabricRef });
        });

        return () => {
            canvas.dispose();
        };
    }, []);

    useEffect(() => {
        renderCanvas({ fabricRef, canvasObjects, activeObjectRef });
    }, [canvasObjects]);

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
