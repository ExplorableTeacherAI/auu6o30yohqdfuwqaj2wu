import { type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import { EditableH2, EditableParagraph, InlineFormula } from "@/components/atoms";
import { VisualOptionCards } from "@/components/organisms";

export const productIsZeroBlocks: ReactElement[] = [
    <StackLayout key="layout-zero-product-heading" maxWidth="xl">
        <Block id="zero-product-heading" padding="md">
            <EditableH2 id="h2-zero-product-heading" blockId="zero-product-heading">
                When a Product Is Zero
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-zero-product-rule" maxWidth="xl">
        <Block id="zero-product-rule" padding="sm">
            <EditableParagraph id="para-zero-product-rule" blockId="zero-product-rule">
                Here is a fact so plain it feels like a trick: if two numbers multiply to give 0,
                at least one of them has to be 0. Nothing else can do it. Multiply 7 by a
                thousandth and the answer is tiny, but it is still not zero.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-zero-product-payoff" maxWidth="xl">
        <Block id="zero-product-payoff" padding="sm">
            <EditableParagraph id="para-zero-product-payoff" blockId="zero-product-payoff">
                So if <InlineFormula latex="(x + 2)(x + 3) = 0" colorMap={{}} />, one of those
                brackets must be zero: either <InlineFormula latex="x + 2 = 0" colorMap={{}} /> or{" "}
                <InlineFormula latex="x + 3 = 0" colorMap={{}} />. That gives{" "}
                <InlineFormula latex="x = -2" colorMap={{}} /> or{" "}
                <InlineFormula latex="x = -3" colorMap={{}} />. Two answers, and now we can see
                where the second one comes from.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-zero-product-visual" maxWidth="xl">
        <Block id="zero-product-visual">
            <VisualOptionCards
                blockId="zero-product-visual"
                cards={[
                    {
                        id: "two-dials-product",
                        title: "Two dials of numbers with their product printed between them",
                        looks: "Imagine two round dials side by side, each showing a number that can be turned up or down, with a large product printed in the space between them. Every product reached so far is left behind as a faint mark on a strip along the bottom.",
                        manipulate: "Turn either dial and try to land the product exactly on zero",
                        reveals: "The only way to make a product zero is to send one of the two numbers to zero, however small the other one gets.",
                        paradigm: "goal",
                        recommended: true,
                    },
                    {
                        id: "rectangle-sides-collapse",
                        title: "A rectangle whose two sides are x + 2 and x + 3",
                        looks: "Imagine a rectangle whose width and height are both set by one slider, the width reading x + 2 and the height reading x + 3, with its area printed inside. Beside it, a graph plots that area against x and traces a curve as the rectangle changes shape.",
                        manipulate: "Drag the corner of the rectangle to change x, and watch it flatten as one side runs out",
                        reveals: "The area is zero only at the two values of x that flatten a side, which is why a quadratic has two solutions.",
                        paradigm: "comparison",
                        secondView: {
                            shows: "A graph of the product against x, with a dot marking the current value and the curve crossing zero twice",
                            role: "complementary",
                            syncedBy: "the shared x value, plus a hover highlight linking each side of the rectangle to its own bracket on the graph",
                        },
                    },
                    {
                        id: "number-line-guess-roots",
                        title: "A number line with two flags students plant before testing",
                        looks: "Imagine a number line with the two brackets written above it and their product below. Two flags can be planted anywhere along the line, and a marker can then be dragged across it, printing the product at each stop it makes.",
                        manipulate: "Plant the two flags where the product is expected to hit zero, then drag the marker across to test them",
                        reveals: "The product collapses to zero at exactly two places on the line, and each one is where a single bracket empties out.",
                        paradigm: "prediction",
                    },
                ]}
            />
        </Block>
    </StackLayout>,
];
