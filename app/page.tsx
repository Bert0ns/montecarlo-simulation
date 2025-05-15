import MonteCarloPiSimulation from "../components/MonteCarloPiSimulation"
import {MonteCarloExplanationSection} from "@/components/MonteCarloExplanationSection"

export default function Home() {
    return (
        <main className="container mx-auto max-w-4xl">
            <MonteCarloExplanationSection/>
            <MonteCarloPiSimulation/>
        </main>
    )
}
