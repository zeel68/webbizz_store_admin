import { CheckCircleIcon } from "lucide-react"; // optional but useful icon

interface FormSuccessProps {
    msg?: string;
}

export const FormSuccess = ({ msg }: FormSuccessProps) => {
    if (!msg) return null;

    return (
        <div className="bg-emerald-500/15 p-3 rounded-md flex items-center gap-x-2 text-emerald-500 text-sm mt-2">
            <CheckCircleIcon className="h-4 w-4" /> {/* optional icon */}
            <span>{msg}</span>
        </div>
    );
};
