import {MonteCarloExplanationSection} from "@/components/MonteCarloExplanationSection";
import MonteCarloPiSimulation from "@/components/MonteCarloPiSimulation";

const PiSimulationPage = () => {
    return (
        <main className="container mx-auto max-w-4xl">
            <MonteCarloExplanationSection/>
            <MonteCarloPiSimulation/>
        </main>
    )
}

export default PiSimulationPage;