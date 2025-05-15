import React from "react";

const MCShadowExplanationSection: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-sm shadow-sm mb-8">
            <h1 className="text-3xl font-semibold mb-4">Application of the Monte Carlo method to Shadows</h1>

            {/*<section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">What is the Monte Carlo Method?</h2>
                <p className="mb-3">
                    The Monte Carlo method is a computational approach that uses repeated random sampling
                    to obtain numerical results. This method is particularly useful for complex problems
                    where exact analytical solutions are difficult or impossible to calculate.
                </p>
                <p>
                    It gets its name from the famous Monte Carlo casino in Monaco, due to its similarity to
                    games of chance that rely on randomness and probability.
                </p>
            </section>*/}

            <section className="mb-8">

                <p className="mb-3">
                    In our simulation, we apply the Monte Carlo method to calculate shadows cast
                    by an object when illuminated by a light source:
                </p>
                <ol className="list-decimal pl-6 mb-4 space-y-2">
                    <li>We randomly generate thousands of light rays from the light source</li>
                    <li>We trace the path of each ray through the scene</li>
                    <li>We determine which rays are blocked by the obstacle</li>
                    <li>We use this information to calculate the shadow distribution</li>
                </ol>
                <p>
                    The more rays we use, the more accurate our simulation will be, especially in
                    penumbra areas where the shadow gradually fades.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Advantages of the Method</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-medium mb-2">Accuracy in Penumbras</h3>
                        <p>
                            Monte Carlo simulation naturally produces realistic penumbra effects,
                            where shadows fade at the edges based on the portion of the light source visible.
                        </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-medium mb-2">Flexibility</h3>
                        <p>
                            The method can easily handle complex-shaped light sources and
                            multiple obstacles without significantly increasing the algorithm's complexity.
                        </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-medium mb-2">Parallelizable</h3>
                        <p>
                            Since each ray is independent, the calculation can be easily
                            distributed across multiple processors to improve performance.
                        </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-medium mb-2">Quality/Performance Control</h3>
                        <p>
                            You can easily adjust the number of rays to balance
                            visual quality and performance based on your needs.
                        </p>
                    </div>
                </div>
            </section>

            <section className="mb-6">
                <h2 className="text-2xl font-semibold mb-4">The Mathematics Behind the Simulation</h2>
                <p className="mb-3">
                    For each generated ray, we calculate:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                    <li>A random origin point on the light source</li>
                    <li>A random direction within a cone of possible directions</li>
                    <li>The intersection of the ray with objects in the scene using computational geometry</li>
                    <li>The density of blocked rays to calculate shadow intensity</li>
                </ul>
                <p>
                    The shadow intensity at a point is proportional to the number of blocked rays
                    relative to the total number of rays that would pass through that point.
                </p>
            </section>

            <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-medium mb-2">In Our Interactive Simulation</h3>
                <p>
                    You can experiment with different configurations of light sources and obstacles,
                    observing how shadows form and change in real-time. Try modifying
                    the number of rays to see how the simulation quality improves!
                </p>
            </div>
        </div>
    );
}

export default MCShadowExplanationSection;