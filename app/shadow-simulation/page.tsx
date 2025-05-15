import MonteCarloShadowSimulation from "@/components/MonteCarloShadowSimulation";
import MCShadowExplanationSection from "@/components/MCShadowExplanationSection";

const ShadowSimulation = () => {
    return (
        <div className="flex flex-col items-center justify-center">
            <MCShadowExplanationSection />
            <MonteCarloShadowSimulation />
        </div>
    );
}
export default ShadowSimulation;