import { type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import { EditableH2, EditableParagraph, InlineFormula } from "@/components/atoms";
import { VisualOptionCards } from "@/components/organisms";

export const factorisingToSolveBlocks: ReactElement[] = [
    <StackLayout key="layout-factorising-heading" maxWidth="xl">
        <Block id="factorising-heading" padding="md">
            <EditableH2 id="h2-factorising-heading" blockId="factorising-heading">
                Factorising to Solve
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-factorising-worked-example" maxWidth="xl">
        <Block id="factorising-worked-example" padding="sm">
            <EditableParagraph id="para-factorising-worked-example" blockId="factorising-worked-example">
                Real quadratics arrive tangled up, like{" "}
                <InlineFormula latex="x^2 + 5x + 6 = 0" colorMap={{}} />. To use the zero rule we
                need two brackets multiplied together, so we hunt for two numbers that multiply
                to 6 and add to 5.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-factorising-solutions" maxWidth="xl">
        <Block id="factorising-solutions" padding="sm">
            <EditableParagraph id="para-factorising-solutions" blockId="factorising-solutions">
                2 and 3 do both jobs, so the equation becomes{" "}
                <InlineFormula latex="(x + 2)(x + 3) = 0" colorMap={{}} />. The brackets hold +2
                and +3, yet the solutions are <InlineFormula latex="x = -2" colorMap={{}} /> and{" "}
                <InlineFormula latex="x = -3" colorMap={{}} />, because each bracket has to end up
                empty at zero.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-factorising-visual" maxWidth="xl">
        <Block id="factorising-visual">
            <VisualOptionCards
                blockId="factorising-visual"
                cards={[
                    {
                        id: "tile-rectangle-build",
                        title: "The quadratic laid out as loose tiles beside an empty rectangle frame",
                        looks: "Imagine one large x by x square, five long x strips and six single unit squares scattered on a table, with an empty frame waiting beside them. As tiles are placed, the two side lengths of the frame are written along its edges.",
                        manipulate: "Drag the strips and units into the frame until they form one complete rectangle with no gaps",
                        reveals: "The only rectangle that fits has sides x + 2 and x + 3, and those side lengths are the two brackets.",
                        paradigm: "constructivist",
                        recommended: true,
                    },
                    {
                        id: "number-pair-hunt",
                        title: "Two number cards with their sum and product shown live",
                        looks: "Imagine two cards, each holding a number that can be nudged up or down, with their sum printed on one side and their product on the other. Two targets sit next to those readouts, and each readout lights up as it lands on its target.",
                        manipulate: "Nudge the two cards until the sum reaches 5 and the product reaches 6 at the same time",
                        reveals: "Factorising is a search for one pair of numbers that satisfies two conditions at once, and only one pair works.",
                        paradigm: "goal",
                    },
                    {
                        id: "drag-the-roots",
                        title: "A U-shaped curve pinned to the x-axis at two draggable points",
                        looks: "Imagine a smooth U-shaped curve crossing a horizontal axis at two marked points. Underneath, the equation is written twice: once as two brackets and once expanded out, both rewriting themselves as the curve shifts.",
                        manipulate: "Drag either crossing point along the axis and watch both written forms of the equation change",
                        reveals: "The numbers inside the brackets and the crossing points always have opposite signs, and the expanded equation is built from that pair.",
                        paradigm: "inversion",
                        secondView: {
                            shows: "The equation in bracket form and expanded form, updating live as the roots move",
                            role: "constructing",
                            syncedBy: "the two root values, plus a hover highlight linking each crossing point to its own bracket",
                        },
                    },
                ]}
            />
        </Block>
    </StackLayout>,
];
