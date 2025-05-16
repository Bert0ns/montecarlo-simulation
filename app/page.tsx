import Link from "next/link";
import {websiteConfigs} from "@/lib/website.configs";
import {Button} from "@/components/ui/button";
import {Card, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";

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
                    {/* Pi Simulation Card */}
                    <Card className="overflow-hidden transition-transform hover:shadow-md hover:-translate-y-1">
                        <div className="h-48 bg-blue-600 relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center">
                                    <span className="text-3xl font-bold text-blue-600">π</span>
                                </div>
                                <div className="absolute w-full h-full bg-blue-600 opacity-10">
                                    {/* Dots pattern for visualization */}
                                    {[...Array(100)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="absolute w-1 h-1 rounded-full bg-white"
                                            style={{
                                                left: `${Math.random() * 100}%`,
                                                top: `${Math.random() * 100}%`,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <CardHeader>
                            <CardTitle>Pi Calculation</CardTitle>
                            <CardDescription className="text-gray-600">
                                Discover how random points can be used to approximate the value of π through a simple
                                geometric approach.
                            </CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button asChild variant="default" className="bg-blue-600 hover:bg-blue-700">
                                <Link href={websiteConfigs.menuItems[0].link}>
                                    Explore Simulation
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Shadow Simulation Card */}
                    <Card className="overflow-hidden transition-transform hover:shadow-md hover:-translate-y-1">
                        <div className="h-48 bg-purple-600 relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-yellow-300 shadow-lg shadow-yellow-200"></div>
                                <div className="absolute left-[60%] top-[50%] w-8 h-20 bg-gray-800 rounded-sm"></div>
                                <div
                                    className="absolute left-[70%] top-[60%] w-24 h-2 bg-gray-700 rounded opacity-70"></div>
                            </div>
                        </div>
                        <CardHeader>
                            <CardTitle>Shadow Simulation</CardTitle>
                            <CardDescription className="text-gray-600">
                                Explore how Monte Carlo methods can create realistic shadow effects with accurate
                                penumbra regions.
                            </CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button asChild variant="default" className="bg-purple-600 hover:bg-purple-700">
                                <Link href={websiteConfigs.menuItems[1].link}>
                                    Explore Simulation
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </section>
        </main>
    );
}

export default HomePage;