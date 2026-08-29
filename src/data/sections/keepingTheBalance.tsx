import { useRef, useState, type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    EditableH2,
    EditableParagraph,
    InlineFormula,
    InlineClozeChoice,
    InlineClozeInput,
    InlineFeedback,
    InlineLinkedHighlight,
    InteractionHintSequence,
} from "@/components/atoms";
import { Figure } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { clamp, useSpring } from "@/lib/motion";
import {
    getVariableInfo,
    clozePropsFromDefinition,
    choicePropsFromDefinition,
    linkedHighlightPropsFromDefinition,
} from "../variables";

// ─────────────────────────────────────────────────────────────────────────────
// Balance scales figure — 3 bags + 4 blocks  vs  19 blocks   (each bag = 5)
// Students drag items off either pan. The beam tips whenever the two sides stop
// matching, so "do the same to both sides" is discovered, not announced.
// ─────────────────────────────────────────────────────────────────────────────

const VIEW_W = 560;
const VIEW_H = 400;
const PIVOT = { x: 280, y: 120 };
const ARM = 170;
const STRING = 95;
const PAN_W = 156;

const BAG_W = 34;
const BAG_H = 42;
const UNIT = 17;
const GAP = 4;
const PER_ROW = 7;
const BAG_WEIGHT = 5;

const INK = "#64748B";
const INK_DARK = "#334155";
const ACCENT = "#62D0AD";
const BLOCK_FILL = "#CBD5E1";

const START = { bags: 3, leftUnits: 4, rightUnits: 19 };

type Item = {
    key: string;
    kind: "bag" | "unit";
    side: "left" | "right";
    x: number;
    y: number;
    w: number;
    h: number;
};

type DragState = { key: string; item: Item; x: number; y: number; startX: number; startY: number };

function sideLabel(bags: number, units: number): string {
    const bagPart = bags === 0 ? "" : bags === 1 ? "x" : `${bags}x`;
    if (bags === 0) return `${units}`;
    if (units === 0) return bagPart;
    return `${bagPart} + ${units}`;
}

function BalanceScalesDrawing() {
    const setVar = useSetVar();
    const bags = useVar<number>("balanceLeftBags", START.bags);
    const leftUnits = useVar<number>("balanceLeftUnits", START.leftUnits);
    const rightUnits = useVar<number>("balanceRightUnits", START.rightUnits);
    const highlight = useVar<string>("balanceHighlight", "");
    const svgRef = useRef<SVGSVGElement>(null);
    const [drag, setDrag] = useState<DragState | null>(null);

    const leftWeight = bags * BAG_WEIGHT + leftUnits;
    const rightWeight = rightUnits;
    const balanced = leftWeight === rightWeight;
    const solved = bags === 1 && leftUnits === 0 && rightUnits === BAG_WEIGHT;

    const angle = useSpring(clamp((rightWeight - leftWeight) * 2.5, -12, 12), {
        stiffness: 110,
        damping: 15,
    });
    const radians = (angle * Math.PI) / 180;
    const leftEnd = {
        x: PIVOT.x - ARM * Math.cos(radians),
        y: PIVOT.y - ARM * Math.sin(radians),
    };
    const rightEnd = {
        x: PIVOT.x + ARM * Math.cos(radians),
        y: PIVOT.y + ARM * Math.sin(radians),
    };
    const leftPanY = leftEnd.y + STRING;
    const rightPanY = rightEnd.y + STRING;

    // ── item layout (fixed slot positions so removing one never shifts the rest)
    const bagsRowW = START.bags * BAG_W + (START.bags - 1) * GAP;
    const bagItems: Item[] = Array.from({ length: bags }, (_, i) => ({
        key: `bag-${i}`,
        kind: "bag" as const,
        side: "left" as const,
        x: leftEnd.x - bagsRowW / 2 + i * (BAG_W + GAP),
        y: leftPanY - BAG_H,
        w: BAG_W,
        h: BAG_H,
    }));
    const leftUnitsRowW = START.leftUnits * UNIT + (START.leftUnits - 1) * GAP;
    const leftUnitsBottom = leftPanY - (bags > 0 ? BAG_H + GAP : 0);
    const leftUnitItems: Item[] = Array.from({ length: leftUnits }, (_, i) => ({
        key: `left-unit-${i}`,
        kind: "unit" as const,
        side: "left" as const,
        x: leftEnd.x - leftUnitsRowW / 2 + i * (UNIT + GAP),
        y: leftUnitsBottom - UNIT,
        w: UNIT,
        h: UNIT,
    }));
    const rightRowW = PER_ROW * UNIT + (PER_ROW - 1) * GAP;
    const rightUnitItems: Item[] = Array.from({ length: rightUnits }, (_, i) => {
        const row = Math.floor(i / PER_ROW);
        const col = i % PER_ROW;
        return {
            key: `right-unit-${i}`,
            kind: "unit" as const,
            side: "right" as const,
            x: rightEnd.x - rightRowW / 2 + col * (UNIT + GAP),
            y: rightPanY - UNIT - row * (UNIT + GAP),
            w: UNIT,
            h: UNIT,
        };
    });

    // ── highlight contract: target pops, everything else recedes
    const dim = (id: string) => (highlight && highlight !== id ? 0.38 : 1);
    const isOn = (id: string) => highlight === id;
    const hoverProps = (id: string) => ({
        onPointerEnter: () => setVar("balanceHighlight", id),
        onPointerLeave: () => setVar("balanceHighlight", ""),
    });
    const eased = { transition: "opacity 150ms ease-out" } as const;

    const toSvg = (event: React.PointerEvent) => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return { x: 0, y: 0 };
        return {
            x: ((event.clientX - rect.left) / rect.width) * VIEW_W,
            y: ((event.clientY - rect.top) / rect.height) * VIEW_H,
        };
    };

    const startDrag = (item: Item) => (event: React.PointerEvent<SVGRectElement>) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        const point = toSvg(event);
        setDrag({ key: item.key, item, x: point.x, y: point.y, startX: point.x, startY: point.y });
    };
    const moveDrag = (event: React.PointerEvent<SVGRectElement>) => {
        if (!drag) return;
        const point = toSvg(event);
        setDrag({ ...drag, x: point.x, y: point.y });
    };
    const endDrag = (item: Item) => () => {
        if (!drag) return;
        const distance = Math.hypot(drag.x - drag.startX, drag.y - drag.startY);
        if (distance > 32) {
            if (item.kind === "bag") setVar("balanceLeftBags", Math.max(0, bags - 1));
            else if (item.side === "left") setVar("balanceLeftUnits", Math.max(0, leftUnits - 1));
            else setVar("balanceRightUnits", Math.max(0, rightUnits - 1));
        }
        setDrag(null);
    };

    const renderBag = (item: Item, ghost: boolean) => (
        <g key={item.key} opacity={ghost ? 0.25 : 1}>
            {isOn("bags") && (
                <rect
                    x={item.x - 4}
                    y={item.y - 4}
                    width={item.w + 8}
                    height={item.h + 8}
                    rx={10}
                    fill="none"
                    stroke={ACCENT}
                    strokeWidth={9}
                    opacity={0.28}
                />
            )}
            <rect
                x={item.x}
                y={item.y}
                width={item.w}
                height={item.h}
                rx={7}
                fill={ACCENT}
                stroke={isOn("bags") ? "#3FA98A" : ACCENT}
                strokeWidth={isOn("bags") ? 3 : 1.5}
                style={{ transition: "stroke-width 150ms ease-out" }}
            />
            <text
                x={item.x + item.w / 2}
                y={item.y + item.h / 2 + 6}
                textAnchor="middle"
                fontSize="17"
                fontStyle="italic"
                fill="#FFFFFF"
            >
                x
            </text>
            <rect
                x={item.x - 5}
                y={item.y - 5}
                width={item.w + 10}
                height={item.h + 10}
                fill="transparent"
                style={{ cursor: drag ? "grabbing" : "grab", touchAction: "none" }}
                onPointerDown={startDrag(item)}
                onPointerMove={moveDrag}
                onPointerUp={endDrag(item)}
                {...hoverProps("bags")}
            />
        </g>
    );

    const renderUnit = (item: Item, groupId: string, ghost: boolean) => (
        <g key={item.key} opacity={ghost ? 0.25 : 1}>
            {isOn(groupId) && (
                <rect
                    x={item.x - 3}
                    y={item.y - 3}
                    width={item.w + 6}
                    height={item.h + 6}
                    rx={6}
                    fill="none"
                    stroke={ACCENT}
                    strokeWidth={8}
                    opacity={0.28}
                />
            )}
            <rect
                x={item.x}
                y={item.y}
                width={item.w}
                height={item.h}
                rx={3}
                fill={BLOCK_FILL}
                stroke={isOn(groupId) ? ACCENT : INK}
                strokeWidth={isOn(groupId) ? 3 : 1.5}
                style={{ transition: "stroke-width 150ms ease-out" }}
            />
            <rect
                x={item.x - 5}
                y={item.y - 5}
                width={item.w + 10}
                height={item.h + 10}
                fill="transparent"
                style={{ cursor: drag ? "grabbing" : "grab", touchAction: "none" }}
                onPointerDown={startDrag(item)}
                onPointerMove={moveDrag}
                onPointerUp={endDrag(item)}
                {...hoverProps(groupId)}
            />
        </g>
    );

    const pan = (centerX: number, panY: number) => (
        <>
            <rect
                x={centerX - PAN_W / 2}
                y={panY}
                width={PAN_W}
                height={7}
                rx={3.5}
                fill="#F1F5F9"
                stroke={INK}
                strokeWidth={1.5}
            />
        </>
    );

    const relation = balanced ? "=" : leftWeight > rightWeight ? ">" : "<";
    const equation = `${sideLabel(bags, leftUnits)} ${relation} ${rightWeight}`;

    return (
        <svg ref={svgRef} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="block w-full">
            {/* stand */}
            <g opacity={dim("stand")} style={eased}>
                <rect x={200} y={318} width={160} height={10} rx={5} fill="#F1F5F9" stroke={INK} strokeWidth={1.5} />
                <rect x={276} y={PIVOT.y + 6} width={8} height={312 - PIVOT.y} fill="#E2E8F0" stroke={INK} strokeWidth={1.5} />
            </g>

            {/* beam, strings and pans */}
            <g opacity={highlight ? 0.5 : 1} style={eased}>
                <line
                    x1={leftEnd.x}
                    y1={leftEnd.y}
                    x2={rightEnd.x}
                    y2={rightEnd.y}
                    stroke={INK}
                    strokeWidth={2}
                    strokeLinecap="round"
                />
                <circle cx={PIVOT.x} cy={PIVOT.y} r={6} fill="#F1F5F9" stroke={INK} strokeWidth={2} />
                <line x1={leftEnd.x} y1={leftEnd.y} x2={leftEnd.x} y2={leftPanY} stroke={INK} strokeWidth={1.5} />
                <line x1={rightEnd.x} y1={rightEnd.y} x2={rightEnd.x} y2={rightPanY} stroke={INK} strokeWidth={1.5} />
                {pan(leftEnd.x, leftPanY)}
                {pan(rightEnd.x, rightPanY)}
            </g>

            {/* left pan contents */}
            <g opacity={dim("bags")} style={eased}>
                {bagItems.map((item) => renderBag(item, drag?.key === item.key))}
            </g>
            <g opacity={dim("left-blocks")} style={eased}>
                {leftUnitItems.map((item) => renderUnit(item, "left-blocks", drag?.key === item.key))}
            </g>

            {/* right pan contents */}
            <g opacity={dim("right-blocks")} style={eased}>
                {rightUnitItems.map((item) => renderUnit(item, "right-blocks", drag?.key === item.key))}
            </g>

            {/* the item currently in the student's hand */}
            {drag && (
                <g transform={`translate(${drag.x - drag.item.x - drag.item.w / 2} ${drag.y - drag.item.y - drag.item.h / 2})`} pointerEvents="none">
                    {drag.item.kind === "bag"
                        ? renderBag(drag.item, false)
                        : renderUnit(drag.item, "none", false)}
                </g>
            )}

            {/* the equation these scales are showing right now */}
            <text
                x={VIEW_W / 2}
                y={352}
                textAnchor="middle"
                fontSize="19"
                fill={INK_DARK}
                style={{ fontVariantNumeric: "tabular-nums" }}
            >
                {equation}
            </text>
            {solved && (
                <text x={VIEW_W / 2} y={380} textAnchor="middle" fontSize="13" fill={ACCENT}>
                    One bag balances 5 blocks, so x = 5
                </text>
            )}
        </svg>
    );
}

function BalanceScalesFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="balance-scales"
            caption="Three sealed bags and four blocks against nineteen blocks. Drag anything off a pan; the beam only stays level when both sides lose the same amount."
            onReset={() => {
                setVar("balanceLeftBags", START.bags);
                setVar("balanceLeftUnits", START.leftUnits);
                setVar("balanceRightUnits", START.rightUnits);
                setVar("balanceHighlight", "");
            }}
        >
            <BalanceScalesDrawing />
            <InteractionHintSequence
                hintKey="balance-scales-drag"
                steps={[
                    {
                        gesture: "drag",
                        label: "Drag a block off the left pan",
                        position: { x: "19%", y: "40%" },
                        dragPath: { type: "line", startOffset: { x: 0, y: -8 }, endOffset: { x: -6, y: 44 } },
                    },
                ]}
            />
        </Figure>
    );
}

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
                An equation is a pair of scales that already balance. On the left sit{" "}
                <InlineLinkedHighlight
                    id="link-balance-bags"
                    varName="balanceHighlight"
                    highlightId="bags"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo('balanceHighlight'))}
                >
                    three sealed bags
                </InlineLinkedHighlight>
                , each holding the same unknown number, and{" "}
                <InlineLinkedHighlight
                    id="link-balance-left-blocks"
                    varName="balanceHighlight"
                    highlightId="left-blocks"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo('balanceHighlight'))}
                >
                    four loose blocks
                </InlineLinkedHighlight>
                ; on the right,{" "}
                <InlineLinkedHighlight
                    id="link-balance-right-blocks"
                    varName="balanceHighlight"
                    highlightId="right-blocks"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo('balanceHighlight'))}
                >
                    nineteen blocks
                </InlineLinkedHighlight>
                . Drag a block off one pan and the beam answers you at once.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-balance-worked-step" maxWidth="xl">
        <Block id="balance-worked-step" padding="sm">
            <EditableParagraph id="para-balance-worked-step" blockId="balance-worked-step">
                Start with the move that keeps things level: four blocks off each side, and{" "}
                <InlineFormula latex="3x = 15" colorMap={{}} /> is left, still balanced. From
                there, keep stripping both pans until a single bag stands alone.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-balance-visual" maxWidth="xl">
        <Block id="balance-visual" padding="sm" hasVisualization>
            <BalanceScalesFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-balance-reflection" maxWidth="xl">
        <Block id="balance-reflection" padding="sm">
            <EditableParagraph id="para-balance-reflection" blockId="balance-reflection">
                One bag ends up facing five blocks, so <InlineFormula latex="x = 5" colorMap={{}} />.
                Nothing clever happened: every single move was done to both pans at once. That one
                rule solves every linear equation you will meet.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-balance-question-tip" maxWidth="xl">
        <Block id="balance-question-tip" padding="md">
            <EditableParagraph id="para-balance-question-tip" blockId="balance-question-tip">Lifting four blocks off the left pan and leaving the right pan untouched makes the scales <InlineFeedback varName={"answer_balance_tip"} correctValue={"tip"} caseSensitive={false} position={"terminal"} successMessage={"— yes, the left side is suddenly lighter, so the beam drops on the right"} failureMessage={"— have a look at the scales again"} hint={"Two sides stay equal only while they lose the same amount"} reviewLabel={"Review this concept"} visualizationHint={{"blockId": "balance-visual", "hintKey": "feedback-balance-one-sided", "label": "Discover it yourself", "steps": [{"gesture": "drag", "label": "Drag all four loose blocks off the left pan and watch the beam drop on the right", "position": {"x": "19%", "y": "40%"}, "completionVar": "balanceLeftUnits", "completionValue": 0, "completionTolerance": 0.5}, {"gesture": "drag", "label": "Now take four blocks off the right pan too — the beam comes back level", "position": {"x": "80%", "y": "44%"}, "completionVar": "balanceRightUnits", "completionValue": 15, "completionTolerance": 0.5}], "resetVars": {"balanceLeftBags": 3, "balanceLeftUnits": 4, "balanceRightUnits": 19}}}><InlineClozeChoice varName={"answer_balance_tip"} correctAnswer={"tip"} options={["tip", "stay level", "empty"]} placeholder={"???"} color={"#E53935"} bgColor={"rgba(59, 130, 246, 0.35)"} id={"choice-1788024370369-4l9i6"} /></InlineFeedback>.</EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-balance-question-solve" maxWidth="xl">
        <Block id="balance-question-solve" padding="md">
            <EditableParagraph id="para-balance-question-solve" blockId="balance-question-solve">
                A different set of scales balances 5 bags and 3 blocks against 38 blocks, so one
                bag is worth{" "}
                <InlineFeedback
                    varName="answer_balance_solve"
                    correctValue="7"
                    position="terminal"
                    successMessage="— exactly, 3 blocks off both pans leaves 5 bags against 35, and 35 shared between 5 bags is 7 each"
                    failureMessage="— not yet"
                    hint="Clear the 3 loose blocks from both pans first, then share what is left between the five bags"
                >
                    <InlineClozeInput
                        varName="answer_balance_solve"
                        correctAnswer="7"
                        {...clozePropsFromDefinition(getVariableInfo('answer_balance_solve'))}
                    />
                </InlineFeedback>{" "}
                blocks.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
