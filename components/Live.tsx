import { useOthers } from "@/liveblocks.config";
import { LiveCursors } from "./cursor/LiveCursors";

export const Live = () => {
    const others = useOthers();

    return (
        <div>
            <LiveCursors />
        </div>
    );
};
