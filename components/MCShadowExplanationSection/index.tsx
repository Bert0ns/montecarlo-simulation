import React from "react";

const MCShadowExplanationSection: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-sm shadow-sm dark:shadow-gray-900/20 mb-8">
            <h1 className="text-3xl font-semibold mb-4 dark:text-gray-100">Application of the Monte Carlo method to Shadows</h1>

            <section className="mb-8">
                <p className="mb-3 dark:text-gray-300">
                    In our simulation, we apply the Monte Carlo method to calculate shadows cast
                    by an object when illuminated by a light source:
                </p>
                <ol className="list-decimal pl-6 mb-4 space-y-2 dark:text-gray-300">
                    <li>We randomly generate thousands of light rays from the light source</li>
                    <li>We trace the path of each ray through the scene</li>
                    <li>We determine which rays are blocked by the obstacle</li>
                    <li>We use this information to calculate the shadow distribution</li>
                </ol>
                <p className="dark:text-gray-300">
                    The more rays we use, the more accurate our simulation will be, especially in
                    penumbra areas where the shadow gradually fades.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">Advantages of the Method</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <h3 className="font-medium mb-2 dark:text-gray-100">Accuracy in Penumbras</h3>
                        <p className="dark:text-gray-300">
                            Monte Carlo simulation naturally produces realistic penumbra effects,
                            where shadows fade at the edges based on the portion of the light source visible.
                        </p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <h3 className="font-medium mb-2 dark:text-gray-100">Flexibility</h3>
                        <p className="dark:text-gray-300">
                            The method can easily handle complex-shaped light sources and
                            multiple obstacles without significantly increasing the algorithm&#39;s complexity.
                        </p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <h3 className="font-medium mb-2 dark:text-gray-100">Parallelizable</h3>
                        <p className="dark:text-gray-300">
                            Since each ray is independent, the calculation can be easily
                            distributed across multiple processors to improve performance.
                        </p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <h3 className="font-medium mb-2 dark:text-gray-100">Quality/Performance Control</h3>
                        <p className="dark:text-gray-300">
                            You can easily adjust the number of rays to balance
                            visual quality and performance based on your needs.
                        </p>
                    </div>
                </div>
            </section>

            <section className="mb-6">
                <h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">The Mathematics Behind the Simulation</h2>
                <p className="mb-3 dark:text-gray-300">
                    For each generated ray, we calculate:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2 dark:text-gray-300">
                    <li>A random origin point on the light source</li>
                    <li>A random direction within a cone of possible directions</li>
                    <li>The intersection of the ray with objects in the scene using computational geometry</li>
                    <li>The density of blocked rays to calculate shadow intensity</li>
                </ul>
                <p className="dark:text-gray-300">
                    The shadow intensity at a point is proportional to the number of blocked rays
                    relative to the total number of rays that would pass through that point.
                </p>
            </section>

            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="font-medium mb-2 dark:text-gray-100">In Our Interactive Simulation</h3>
                <p className="dark:text-gray-300">
                    You can experiment with different configurations of light sources and obstacles,
                    observing how shadows form and change in real-time. Try modifying
                    the number of rays to see how the simulation quality improves!
                </p>
            </div>
        </div>
    );
}

export default MCShadowExplanationSection;