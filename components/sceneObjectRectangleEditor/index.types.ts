import {Rectangle, SceneObject} from "@/lib/canvas-utils/scene-objects";
import React from "react";

export interface RectangleEditorProps {
    obj: Rectangle;
    index: number;
    sliderMaxWidth: number;
    sliderMaxHeight: number;
    setSceneObjects: React.Dispatch<React.SetStateAction<SceneObject[]>>;
    sceneObjects: SceneObject[];
}