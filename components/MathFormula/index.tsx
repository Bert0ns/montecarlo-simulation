import React from "react";
import MathFormulaProps from "@/components/MathFormula/index.types";
import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

const MathFormula: React.FC<MathFormulaProps> = ({children}) => {
    return (
        <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
            {children as string}
        </Markdown>
    )
}

export default MathFormula;