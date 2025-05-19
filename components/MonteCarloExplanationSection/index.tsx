import MathFormula from "@/components/MathFormula";

export function MonteCarloExplanationSection() {
    return (
        <section className="mb-12 p-6 rounded-sm shadow-sm bg-white dark:bg-gray-800 dark:shadow-gray-900/20">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">Computing π with Monte Carlo</h2>
            <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="dark:text-gray-300">
                    The Monte Carlo method is a statistical technique that uses random sampling to obtain numerical results. One
                    of its elegant applications is approximating the value of π (pi).
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-800 dark:text-gray-100">How it works</h3>
                <p className="dark:text-gray-300">
                    Imagine a square with a side length of 2, centered at the origin. Inside this square, we inscribe a circle
                    with radius 1. The area of the square is 4, and the area of the circle is π.
                </p>

                <p className="dark:text-gray-300">If we randomly place points inside the square, the probability of a point falling inside the circle is:</p>

                <div className="my-4 text-center">
                    <MathFormula>
                        {`$P(\\text{inside circle}) = \\frac{\\text{Area of circle}}{\\text{Area of square}} = \\frac{\\pi r^2}{(2r)^2} = \\frac{\\pi}{4}$`}
                    </MathFormula>
                </div>

                <p className="dark:text-gray-300">
                    Therefore, if we generate N random points and count how many fall inside the circle (let&#39;s call this count M),
                    we can approximate π as:
                </p>

                <div className="my-4 text-center text-lg">
                    <MathFormula>
                        {`$\\pi ≈ 4* \\frac{\\text{M}}{\\text{N}}$`}
                    </MathFormula>
                </div>

                <p className="dark:text-gray-300">The more points we generate, the more accurate our approximation becomes.</p>

                <div className="my-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-100">Mathematical Insight</h4>
                    <p className="dark:text-gray-300">
                        The Monte Carlo method works because we&#39;re essentially performing numerical integration to calculate the
                        area of a unit circle:
                    </p>
                    <div className="my-4 flex justify-center">
                        <div className="math-formula bg-white dark:bg-gray-800 py-3 px-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600">
                            <MathFormula >{"$\\pi = \\int_{-1}^{1} \\int_{-1}^{1} \\mathbb{1}_{\\{x^2 + y^2 \\leq 1\\}} \\, dx \\, dy \\times 4$"}</MathFormula>
                        </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Where <span className="inline-block"><MathFormula >{"$\\mathbb{1}_{\\{x^2 + y^2 \\leq 1\\}}$"}</MathFormula></span> is the indicator
                        function that equals 1 when a point falls inside the circle and 0 otherwise.
                    </div>
                </div>
            </div>
        </section>
    )
}