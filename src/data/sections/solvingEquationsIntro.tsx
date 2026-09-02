import { type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import { EditableH1, EditableParagraph, InlineFormula, InlineTooltip } from "@/components/atoms";

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
                Every{" "}
                <InlineTooltip
                    id="tooltip-intro-equation"
                    tooltip="A statement that two expressions are worth exactly the same amount, joined by an equals sign."
                    color="#64748B"
                    bgColor="rgba(100, 116, 139, 0.14)"
                >
                    equation
                </InlineTooltip>{" "}
                is a puzzle with a number hiding inside it. Double me, add seven,
                and you get nineteen: the clues are all there, and exactly one number fits.
                Solving is just working backwards until that number is standing on its own.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-solving-equations-promise" maxWidth="xl">
        <Block id="solving-equations-promise" padding="sm">
            <EditableParagraph id="para-solving-equations-promise" blockId="solving-equations-promise">
                We will do it in two steps: first the{" "}
                <InlineTooltip
                    id="tooltip-intro-linear"
                    tooltip="An equation where the unknown is never squared, so its graph is a straight line and it has one solution."
                    color="#64748B"
                    bgColor="rgba(100, 116, 139, 0.14)"
                >
                    straight-line kind
                </InlineTooltip>{" "}
                like{" "}
                <InlineFormula
                    latex="\clr{bag}{3x} + \clr{block}{4} = \clr{block}{19}"
                    colorMap={{ bag: "#62D0AD", block: "#64748B" }}
                />, then the{" "}
                <InlineTooltip
                    id="tooltip-intro-quadratic"
                    tooltip="An equation containing an x squared term. Its graph is a curve, and it usually has two solutions."
                    color="#64748B"
                    bgColor="rgba(100, 116, 139, 0.14)"
                >
                    quadratic
                </InlineTooltip>{" "}
                kind like{" "}
                <InlineFormula
                    latex="\clr{square}{x^2} + \clr{strip}{5x} + \clr{unit}{6} = 0"
                    colorMap={{ square: "#62D0AD", strip: "#8E90F5", unit: "#94A3B8" }}
                />, where two different
                numbers both fit. You already collect like terms, undo operations and expand
                brackets, which is the whole toolkit. By the end you will solve both kinds yourself.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
