import { FC } from "react";

interface FormHeaderProps {
    className?: string;
}

const FormHeader: FC<FormHeaderProps> = ({ className = "" }) => {
    return (
        <div className={`w-full ${className}`}>
            <div className="flex h-32">
                {/* Blue Section with Logo */}
                <div className="w-1/3 bg-[#2563eb] flex flex-col items-center justify-center text-white p-4">
                    <div className="mb-2">
                        <svg
                            width="60"
                            height="40"
                            viewBox="0 0 60 40"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M15 35L30 10L45 35M20 25H40"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-sm">KEP</div>
                        <div className="font-bold text-xs">MICROCREDIT</div>
                        <div className="font-bold text-xs">LIMITED</div>
                    </div>
                </div>

                {/* Green Section with Contact Info */}
                <div className="w-2/3 bg-[#84cc16] p-4 flex flex-col justify-center text-gray-800 space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                        <span>📞</span>
                        <span>+255 789 670 696/ 0754469917</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <span>✉️</span>
                        <span>kepmicrocredit976@gmail.com</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <span>📍</span>
                        <span>19OldForest, Mpuguso street</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormHeader;
