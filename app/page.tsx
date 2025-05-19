import {websiteConfigs} from "@/website.configs";
import PiSimulationCard from "@/components/PiSimulationCard";
import ShadowSimulationCard from "@/components/ShadowSimulationCard";
import Link from "next/link";

const HomePage = () => {
    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            {/* Hero Section */}
            <section className="container mx-auto max-w-5xl px-4 pt-20 pb-16">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                        {websiteConfigs.title}
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        {websiteConfigs.description}
                    </p>
                </div>
            </section>

            {/* Monte Carlo Brief Explanation */}
            <section className="container mx-auto max-w-4xl px-4 py-12">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-950 p-8 mb-12">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">What are Monte Carlo
                        Methods?</h2>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                        Monte Carlo methods are a class of computational algorithms that rely on repeated random
                        sampling
                        to obtain numerical results. The core idea is using randomness to solve problems that might be
                        deterministic in principle.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                        These methods are especially useful for optimization, numerical integration, and generating
                        draws from probability distributions.
                    </p>
                    <br/>
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">More</h3>
                        <ul>
                            <li>
                                <Link href={"https://en.wikipedia.org/wiki/Monte_Carlo_method"}
                                      className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
                                    More about Monte Carlo methods
                                </Link>
                            </li>
                            <li>
                                <Link href={"https://en.wikipedia.org/wiki/Path_tracing"}
                                      className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
                                    Monte Carlo methods in path tracing
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Simulations Cards */}
            <section className="container mx-auto max-w-5xl px-4 py-8 mb-20">
                <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-10">Interactive
                    Simulations</h2>

                <div className="grid md:grid-cols-2 gap-8">
                    <PiSimulationCard/>
                    <ShadowSimulationCard/>
                </div>
            </section>
        </main>
    );
}

export default HomePage;