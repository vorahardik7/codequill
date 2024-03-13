import { useOthers, useSelf } from "@/liveblocks.config";
import React, { memo, useMemo } from "react";
import { Avatar } from "./Avatar";

import styles from "./index.module.css";
import { generateRandomName } from "@/lib/utils";

const ActiveUsers = () => {
    const users = useOthers();
    const currentUser = useSelf();
    const hasMoreUsers = users.length > 3;

    const memoizedUsers = useMemo(() => {
        return (
            <main className="flex items-center justify-center gap-1 py-2">
                <div className="flex pl-3">
                    {currentUser && (
                        <Avatar
                            name="You"
                            otherStyles="border-[3x] border-primary-green"
                        />
                    )}
                    {users.slice(0, 3).map(({ connectionId }) => {
                        return (
                            <Avatar
                                key={connectionId}
                                name={generateRandomName()}
                                otherStyles="-ml-3"
                            />
                        );
                    })}

                    {hasMoreUsers && (
                        <div className={styles.more}>+{users.length - 3}</div>
                    )}
                </div>
            </main>
        );
    }, [users.length]);

    return memoizedUsers;
};

export default ActiveUsers;
