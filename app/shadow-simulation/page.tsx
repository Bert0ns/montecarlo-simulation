import MonteCarloShadowSimulation from "@/components/MonteCarloShadowSimulation";
import MCShadowExplanationSection from "@/components/MCShadowExplanationSection";

const ShadowSimulation = () => {
    return (
        <main className="flex flex-col items-center justify-center">
            <MCShadowExplanationSection />
            <MonteCarloShadowSimulation />
        </main>
    );
}
export default ShadowSimulation;