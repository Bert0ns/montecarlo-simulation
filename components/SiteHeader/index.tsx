import { Github } from "lucide-react"
import Link from "next/link";

export function SiteHeader() {
    return (
        <header className="border-b border-gray-200">
            <div className="container mx-auto px-4 py-6 flex justify-between items-center max-w-4xl">
                <h1 className="text-2xl font-semibold tracking-tight">Monte Carlo Simulation</h1>
                <nav>
                    <Link
                        href="https://github.com/Bert0ns/montecarlo-simulation"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <Github size={20} />
                        <span className="hidden sm:inline">Source</span>
                    </Link>
                </nav>
            </div>
        </header>
    )
}
