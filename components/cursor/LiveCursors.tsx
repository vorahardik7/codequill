import { LiveCursorProps } from "@/types/type";
import React from "react";
import { Cursor } from "./Cursor";
import { COLORS } from "@/constants";

export const LiveCursors = ({ others }: LiveCursorProps) => {
    return others.map(({ connectionId, presence }) => {
        if (!presence?.cursor) return null;

        return (
            <Cursor
                key={connectionId}
                color={COLORS[connectionId % COLORS.length]}
                x={presence.cursor.x}
                y={presence.cursor.y}
                message={presence.message}
            />
        );
    });
};
