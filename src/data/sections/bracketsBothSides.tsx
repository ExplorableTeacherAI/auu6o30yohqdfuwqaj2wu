import { type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import { EditableH2, EditableParagraph, InlineFormula } from "@/components/atoms";
import { VisualOptionCards } from "@/components/organisms";

export const bracketsBothSidesBlocks: ReactElement[] = [
    <StackLayout key="layout-brackets-heading" maxWidth="xl">
        <Block id="brackets-heading" padding="md">
            <EditableH2 id="h2-brackets-heading" blockId="brackets-heading">
                Brackets and x on Both Sides
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-brackets-worked-example" maxWidth="xl">
        <Block id="brackets-worked-example" padding="sm">
            <EditableParagraph id="para-brackets-worked-example" blockId="brackets-worked-example">
                Some equations hide the <InlineFormula latex="x" colorMap={{}} /> in more than one
                place, like <InlineFormula latex="2(x + 3) = x + 11" colorMap={{}} />. Expand the
                bracket and the left side becomes <InlineFormula latex="2x + 6" colorMap={{}} />,
                so the equation now reads{" "}
                <InlineFormula latex="2x + 6 = x + 11" colorMap={{}} />.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-brackets-tidy-up" maxWidth="xl">
        <Block id="brackets-tidy-up" padding="sm">
            <EditableParagraph id="para-brackets-tidy-up" blockId="brackets-tidy-up">
                Now take one <InlineFormula latex="x" colorMap={{}} /> from each side, then 6 from
                each side. What is left is <InlineFormula latex="x = 5" colorMap={{}} />, and the
                messy equation turns out to have been a tidy one in disguise.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-brackets-visual" maxWidth="xl">
        <Block id="brackets-visual">
            <VisualOptionCards
                blockId="brackets-visual"
                cards={[
                    {
                        id: "algebra-tiles-cancel",
                        title: "Two piles of tiles, one for each side of the equation",
                        looks: "Imagine the left side built from a bracket card holding an x strip and three unit squares, drawn twice over, and the right side built from one x strip and eleven unit squares. The two piles sit either side of a bold equals line down the middle.",
                        manipulate: "Drag the bracket card apart to spill out its tiles, then drag matching tiles away from both piles at the same time",
                        reveals: "Expanding and cancelling are just tidying, and the tiles that survive on each side spell out the answer.",
                        paradigm: "constructivist",
                        recommended: true,
                    },
                    {
                        id: "two-towers-level",
                        title: "Two towers, one for each side, that rise and fall as x changes",
                        looks: "Imagine two coloured towers standing side by side above a number line, one showing the value of 2(x + 3) and the other showing the value of x + 11, with the height of each printed on top. A marker sits on the number line beneath them.",
                        manipulate: "Slide the marker along the number line until the two towers are exactly the same height",
                        reveals: "Solving means finding the one value of x where both sides are worth the same, and that value is the answer.",
                        paradigm: "comparison",
                        secondView: {
                            shows: "The two expressions drawn as straight lines on a grid, with a dot on each line at the current x",
                            role: "complementary",
                            syncedBy: "the current x value, plus a shared hover highlight linking each tower to its own line",
                        },
                    },
                    {
                        id: "both-sides-replay",
                        title: "The equation on one line, rewritten each time a piece is taken from both sides",
                        looks: "Imagine the equation across the middle of the screen with the terms shown as separate movable pieces. Taking a piece from one side makes the matching piece on the other side glow, and the tidied equation is rewritten on a new line below.",
                        manipulate: "Drag a term off one side and watch its partner leave the other side with it",
                        reveals: "Whatever is removed has to leave both sides together, which is why the equation stays true all the way down the page.",
                        paradigm: "temporal",
                    },
                ]}
            />
        </Block>
    </StackLayout>,
];
