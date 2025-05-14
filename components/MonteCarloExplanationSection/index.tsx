export function MonteCarloExplanationSection() {
    return (
        <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Computing π with Monte Carlo</h2>
            <div className="prose prose-gray max-w-none">
                <p>
                    The Monte Carlo method is a statistical technique that uses random sampling to obtain numerical results. One
                    of its elegant applications is approximating the value of π (pi).
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">How it works</h3>
                <p>
                    Imagine a square with a side length of 2, centered at the origin. Inside this square, we inscribe a circle
                    with radius 1. The area of the square is 4, and the area of the circle is π.
                </p>

                <p>If we randomly place points inside the square, the probability of a point falling inside the circle is:</p>

                <div className="my-4 text-center">
                    <p className="text-lg">P(inside circle) = Area of circle / Area of square = π / 4</p>
                </div>

                <p>
                    Therefore, if we generate N random points and count how many fall inside the circle (let's call this count M),
                    we can approximate π as:
                </p>

                <div className="my-4 text-center">
                    <p className="text-lg">π ≈ 4 × (M / N)</p>
                </div>

                <p>The more points we generate, the more accurate our approximation becomes.</p>
            </div>
        </section>
    )
}
