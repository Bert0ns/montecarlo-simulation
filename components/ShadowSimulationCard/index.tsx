import {Card, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {websiteConfigs} from "@/website.configs";


const ShadowSimulationCard = () => {
    return (
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
    )
}
export default ShadowSimulationCard;