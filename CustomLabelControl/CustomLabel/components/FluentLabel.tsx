import { Label } from "@fluentui/react/lib/Label";
import React from "react";

export type FluentLabelProps = {
    labelText: string;
    isBold?: boolean;
    isItalic?: boolean;
};

const FluentLabel = ({ labelText, isBold, isItalic }: FluentLabelProps) => {
    return <Label style={{ fontWeight: isBold ? "bold" : "normal", fontStyle: isItalic ? "italic" : "normal" }}>{labelText}</Label>;
};

export default FluentLabel;
