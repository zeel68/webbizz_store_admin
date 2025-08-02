import { AlertTriangle } from "lucide-react"; // optional but useful icon

interface FormErrorProps {
    error?: string;
}

export const FormError = ({ error }: FormErrorProps) => {
    if (!error) return null;

    return (
        <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-destructive text-sm mt-2">
            <AlertTriangle className="h-4 w-4" /> {/* optional icon */}
            <span>{error}</span>
        </div>
    );
};
