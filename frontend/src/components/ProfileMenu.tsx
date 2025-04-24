import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";


export default function ProfileMenu() {
    const { isLoggedIn, token } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    if (!isLoggedIn) {
        return <div>Please log in</div>;
    }

    if (!token) {
        return <div>User not found</div>;
    }

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative">
            <button onClick={handleToggle} className="flex items-center">
                <img
                    src={user.avatar}
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full"
                />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg">
                    <div className="p-4">
                        <h3 className="text-lg font-semibold">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <hr />
                    <ul className="py-2">
                        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Profile</li>
                        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Settings</li>
                        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Logout</li>
                    </ul>
                </div>
            )}
        </div>
    );
}