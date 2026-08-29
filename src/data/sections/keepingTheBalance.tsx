import { type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import { EditableH2, EditableParagraph, InlineFormula } from "@/components/atoms";
import { VisualOptionCards } from "@/components/organisms";

export const keepingTheBalanceBlocks: ReactElement[] = [
    <StackLayout key="layout-balance-heading" maxWidth="xl">
        <Block id="balance-heading" padding="md">
            <EditableH2 id="h2-balance-heading" blockId="balance-heading">
                Keeping the Balance
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-balance-setup" maxWidth="xl">
        <Block id="balance-setup" padding="sm">
            <EditableParagraph id="para-balance-setup" blockId="balance-setup">
                An equation is a pair of scales that already balance.{" "}
                <InlineFormula latex="3x + 4 = 19" colorMap={{}} /> says that three lots of{" "}
                <InlineFormula latex="x" colorMap={{}} /> plus 4 weigh exactly the same as 19.
                Take 4 off one side only and the scales tip, so the 4 has to come off both.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-balance-worked-step" maxWidth="xl">
        <Block id="balance-worked-step" padding="sm">
            <EditableParagraph id="para-balance-worked-step" blockId="balance-worked-step">
                Take 4 from each side and <InlineFormula latex="3x = 15" colorMap={{}} /> is
                left, still level. Three lots of <InlineFormula latex="x" colorMap={{}} /> weigh
                15, so one <InlineFormula latex="x" colorMap={{}} /> weighs 5. Every linear
                equation comes apart this way, one balanced move at a time.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-balance-visual" maxWidth="xl">
        <Block id="balance-visual">
            <VisualOptionCards
                blockId="balance-visual"
                cards={[
                    {
                        id: "balance-scales-strip",
                        title: "A pair of scales holding three sealed bags and four blocks against nineteen blocks",
                        looks: "Imagine a beam balance sitting level. On the left pan are three identical sealed bags and four single blocks; on the right pan are nineteen single blocks. The equation is written underneath, and a new line is added each time the pans change.",
                        manipulate: "Drag blocks off a pan until one bag stands alone, watching the beam tip whenever a side is changed on its own",
                        reveals: "The scales only stay level if the same amount leaves both sides, and that is exactly what solving an equation is.",
                        paradigm: "goal",
                        recommended: true,
                    },
                    {
                        id: "undo-machine-chain",
                        title: "Two machines in a row, one multiplying by 3 and one adding 4",
                        looks: "Imagine a number sliding along a belt into a machine that triples it, then into a second machine that adds 4, with the value shown at every stage. Arrows run left to right along the top, and a second set of arrows runs right to left underneath.",
                        manipulate: "Drag the number at the finishing end to 19 and watch the value travel backwards through each machine",
                        reveals: "Solving is running the machines in reverse: undo the +4 first, then undo the times 3, and the starting number appears.",
                        paradigm: "inversion",
                    },
                    {
                        id: "step-tape-unwrap",
                        title: "The equation rewritten line by line as a handle is pulled down the page",
                        looks: "Imagine the equation at the top of a tall sheet with a small handle beneath it. Pulling the handle down writes the next line of working underneath, and the pieces that leave each side glow for a moment before they disappear.",
                        manipulate: "Pull the handle down one line at a time, and back up again to replay any step",
                        reveals: "Each written line is one move done to both sides at once, so the working on the page is the story of the balance staying level.",
                        paradigm: "temporal",
                    },
                ]}
            />
        </Block>
    </StackLayout>,
];
