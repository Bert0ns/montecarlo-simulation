import {Card, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {websiteConfigs} from "@/website.configs";

const PiSimulationCard = () => {
    return (
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
    )
}
export default PiSimulationCard;