import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-950">
      <p className="text-6xl font-bold text-gray-200 dark:text-gray-800">404</p>
      <p className="text-gray-500 dark:text-gray-400">Page not found.</p>
      <Link to="/chat" className="btn-primary">Go to chat</Link>
    </div>
  );
}
