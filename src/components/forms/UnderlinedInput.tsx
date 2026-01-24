import React from "react";
import { cn } from "@/lib/utils";

interface UnderlinedInputProps {
    register: any;
    name: string;
    watch: any;
    isCapturing: boolean;
    className?: string;
    minWidth?: string;
    placeholder?: string;
}

const UnderlinedInput = ({
    register,
    name,
    watch,
    isCapturing,
    className = "",
    minWidth = "4rem",
    placeholder = ""
}: UnderlinedInputProps) => {
    const value = watch(name);
    return (
        <span
            className={cn(
                "relative inline-flex items-end border-b border-black mx-1",
                className
            )}
            style={{
                minWidth,
                marginBottom: "5px",
                verticalAlign: "bottom"
            }}
        >
            {/* Span for PDF - only visible when capturing */}
            <span
                className={cn(
                    "block w-full px-1 text-sm font-medium whitespace-pre-wrap break-words",
                    !isCapturing && "invisible"
                )}
                style={{
                    minHeight: "1.5rem",
                    lineHeight: "1.7",
                    paddingBottom: "3px"
                }}
            >
                {value || "\u00a0"}
            </span>

            {/* Input for Browser - removed when capturing */}
            {!isCapturing && (
                <input
                    {...register(name)}
                    placeholder={placeholder}
                    className="absolute inset-0 w-full h-full border-none bg-transparent px-1 py-0 text-sm focus:outline-none focus:ring-0 font-medium placeholder:text-gray-300"
                    style={{ bottom: "2px" }}
                />
            )}
        </span>
    );
};

export default UnderlinedInput;
