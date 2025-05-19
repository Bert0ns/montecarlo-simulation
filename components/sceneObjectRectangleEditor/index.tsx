import {CanvasObjectType, Rectangle} from "@/lib/canvas-utils/scene-objects";
import {Slider} from "@/components/ui/slider";
import React from "react";
import {RectangleEditorProps} from "@/components/sceneObjectRectangleEditor/index.types";

const RectangleEditor: React.FC<RectangleEditorProps> = ({obj, index, sliderMaxWidth, sliderMaxHeight, setSceneObjects, sceneObjects}) => {
    if (obj.type !== CanvasObjectType.RECTANGLE) {
        throw new Error('Unsupported object type');
    }

    return (
        <div>
            <h3 className="text-sm mt-1 font-semibold">{(obj as Rectangle).name + '-' + index}</h3>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <label className="text-xs sm:text-sm mb-1 sm:mb-0 sm:flex-1">width:</label>
                <div className="flex items-center w-full sm:w-auto sm:flex-1">
                    <span className="text-xs w-6 sm:w-12 text-right">1</span>
                    <Slider
                        min={1}
                        max={sliderMaxWidth}
                        step={1}
                        value={[(sceneObjects[index] as Rectangle).width]}
                        onValueChange={(value) => (setSceneObjects((prev) => {
                            const newObjects = [...prev];
                            (newObjects[index] as Rectangle).width = value[0];
                            return newObjects;
                        }))}
                        className="flex-1 mx-2"
                    />
                    <span
                        className="text-xs w-8 sm:w-12 text-right">{(sceneObjects[index] as Rectangle).width}</span>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <label className="text-xs sm:text-sm mb-1 sm:mb-0 sm:flex-1">height:</label>
                <div className="flex items-center w-full sm:w-auto sm:flex-1">
                    <span className="text-xs w-6 sm:w-12 text-right">1</span>
                    <Slider
                        min={1}
                        max={sliderMaxHeight}
                        step={1}
                        value={[(sceneObjects[index] as Rectangle).height]}
                        onValueChange={(value) => (setSceneObjects((prev) => {
                            const newObjects = [...prev];
                            (newObjects[index] as Rectangle).height = value[0];
                            return newObjects;
                        }))}
                        className="flex-1 mx-2"
                    />
                    <span
                        className="text-xs w-8 sm:w-12 text-right">{(sceneObjects[index] as Rectangle).height}</span>
                </div>
            </div>
        </div>
    );
}

export default RectangleEditor;