import { type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import { EditableH2, EditableParagraph } from "@/components/atoms";

export const wrappingUpBlocks: ReactElement[] = [
    <StackLayout key="layout-wrapping-up-heading" maxWidth="xl">
        <Block id="wrapping-up-heading" padding="md">
            <EditableH2 id="h2-wrapping-up-heading" blockId="wrapping-up-heading">
                Wrapping Up
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-wrapping-up-idea" maxWidth="xl">
        <Block id="wrapping-up-idea" padding="sm">
            <EditableParagraph id="para-wrapping-up-idea" blockId="wrapping-up-idea">
                Both halves of this lesson ran on the same instinct: keep the equation true, and
                keep peeling until the x stands alone. A linear equation gives in to one balanced
                move at a time. A quadratic will not, so we rewrite it as two brackets multiplied
                together and let the zero rule finish the job.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-wrapping-up-next" maxWidth="xl">
        <Block id="wrapping-up-next" padding="sm">
            <EditableParagraph id="para-wrapping-up-next" blockId="wrapping-up-next">
                That is why a quadratic usually has two solutions: there are two ways for a
                product to collapse to zero. Next come the quadratics that refuse to factorise
                neatly, and the two tools built for them, completing the square and the quadratic
                formula. Both are longer routes to the question you can already answer.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
