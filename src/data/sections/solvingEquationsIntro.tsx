import { type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import { EditableH1, EditableParagraph, InlineFormula } from "@/components/atoms";

export const solvingEquationsIntroBlocks: ReactElement[] = [
    <StackLayout key="layout-solving-equations-title" maxWidth="xl">
        <Block id="solving-equations-title" padding="md">
            <EditableH1 id="h1-solving-equations-title" blockId="solving-equations-title">
                Solving Equations
            </EditableH1>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-solving-equations-hook" maxWidth="xl">
        <Block id="solving-equations-hook" padding="sm">
            <EditableParagraph id="para-solving-equations-hook" blockId="solving-equations-hook">
                Every equation is a puzzle with a number hiding inside it. Double me, add seven,
                and you get nineteen: the clues are all there, and exactly one number fits.
                Solving is just working backwards until that number is standing on its own.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-solving-equations-promise" maxWidth="xl">
        <Block id="solving-equations-promise" padding="sm">
            <EditableParagraph id="para-solving-equations-promise" blockId="solving-equations-promise">
                We will do it in two steps: first the straight-line kind like{" "}
                <InlineFormula latex="3x + 4 = 19" colorMap={{}} />, then the quadratic kind like{" "}
                <InlineFormula latex="x^2 + 5x + 6 = 0" colorMap={{}} />, where two different
                numbers both fit. You already collect like terms, undo operations and expand
                brackets, which is the whole toolkit. By the end you will solve both kinds yourself.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
