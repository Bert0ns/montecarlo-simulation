import {websiteConfigs} from "@/website.configs";
import PiSimulationCard from "@/components/PiSimulationCard";
import ShadowSimulationCard from "@/components/ShadowSimulationCard";

const HomePage = () => {
    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            {/* Hero Section */}
            <section className="container mx-auto max-w-5xl px-4 pt-20 pb-16">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
                        {websiteConfigs.title}
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                        {websiteConfigs.description}
                    </p>
                </div>
            </section>

            {/* Monte Carlo Brief Explanation */}
            <section className="container mx-auto max-w-4xl px-4 py-12">
                <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">What are Monte Carlo Methods?</h2>
                    <p className="text-gray-700 mb-4">
                        Monte Carlo methods are a class of computational algorithms that rely on repeated random
                        sampling
                        to obtain numerical results. The core idea is using randomness to solve problems that might be
                        deterministic in principle.
                    </p>
                    <p className="text-gray-700">
                        These methods are especially useful for optimization, numerical integration, and generating
                        draws from probability distributions.
                    </p>
                </div>
            </section>

            {/* Simulations Cards */}
            <section className="container mx-auto max-w-5xl px-4 py-8 mb-20">
                <h2 className="text-2xl font-bold text-center mb-10">Interactive Simulations</h2>

                <div className="grid md:grid-cols-2 gap-8">
                    <PiSimulationCard />
                    <ShadowSimulationCard />
                </div>
            </section>
        </main>
    );
}

export default HomePage;