import { useRef, useState, type ReactElement } from "react";
import { SplitLayout, StackLayout } from "@/components/layouts";
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
import { clamp } from "@/lib/motion";
import {
    getVariableInfo,
    clozePropsFromDefinition,
    choicePropsFromDefinition,
    linkedHighlightPropsFromDefinition,
} from "../variables";

// ─────────────────────────────────────────────────────────────────────────────
// LINKED PAIR for  2(x + 3) = x + 11
//   View A — two towers whose heights are the two sides, above a number line
//   View B — the same two expressions as straight lines on a grid
// Both read `bracketsX` and `bracketsHighlight`; both are draggable; both use
// the same zero line and the same pixels-per-unit, which is the visible tie.
// ─────────────────────────────────────────────────────────────────────────────

const VIEW_W = 340;
const VIEW_H = 340;
const AXIS_Y = 258;        // y of the value 0 in BOTH views
const PX_PER_VALUE = 7.5;  // pixels per unit of value in BOTH views
const X0 = 48;             // x = 0 in BOTH views
const X1 = 308;            // x = 10 in BOTH views
const X_MAX = 10;
const LINE_Y = 292;        // the number line in view A

const INK = "#334155";
const INK_STRUCTURE = "#64748B";
const INK_QUIET = "#E2E8F0";
const LEFT_HUE = "#62D0AD";
const RIGHT_HUE = "#8E90F5";

const DEFAULT_X = 2;
const leftValue = (x: number) => 2 * (x + 3);
const rightValue = (x: number) => x + 11;
const fmt = (value: number) => value.toFixed(1);

const toPixelX = (x: number) => X0 + (x / X_MAX) * (X1 - X0);
const toPixelY = (value: number) => AXIS_Y - value * PX_PER_VALUE;
const EASE = { transition: "opacity 150ms ease, stroke-width 150ms ease" } as const;

const useLinkedHighlight = () => {
    const highlight = useVar<string>("bracketsHighlight", "");
    const setVar = useSetVar();
    return {
        opacity: (id: string) => (highlight && highlight !== id ? 0.35 : 1),
        isActive: (id: string) => highlight === id,
        hoverProps: (id: string) => ({
            onPointerEnter: () => setVar("bracketsHighlight", id),
            onPointerLeave: () => setVar("bracketsHighlight", ""),
        }),
    };
};

const useDragX = (svgRef: React.RefObject<SVGSVGElement>) => {
    const setVar = useSetVar();
    const [dragging, setDragging] = useState(false);
    const applyPointer = (event: React.PointerEvent) => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;
        const pixelX = ((event.clientX - rect.left) / rect.width) * VIEW_W;
        const raw = ((pixelX - X0) / (X1 - X0)) * X_MAX;
        setVar("bracketsX", clamp(Math.round(raw * 2) / 2, 0, X_MAX));
    };
    return {
        dragging,
        handlers: {
            style: { cursor: dragging ? "grabbing" : "grab", touchAction: "none" } as const,
            onPointerDown: (event: React.PointerEvent<SVGElement>) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                setDragging(true);
                applyPointer(event);
            },
            onPointerMove: (event: React.PointerEvent<SVGElement>) => {
                if (dragging) applyPointer(event);
            },
            onPointerUp: () => setDragging(false),
        },
    };
};

/** Header readouts — identical in both views, another visible tie. */
function SharedReadouts({ x }: { x: number }) {
    const { opacity } = useLinkedHighlight();
    return (
        <g fontSize="12" style={{ fontVariantNumeric: "tabular-nums", ...EASE }}>
            <text x={120} y={34} textAnchor="middle" fill={LEFT_HUE} opacity={opacity("left-side")}>
                {`2(x + 3) = ${fmt(leftValue(x))}`}
            </text>
            <text x={252} y={34} textAnchor="middle" fill={RIGHT_HUE} opacity={opacity("right-side")}>
                {`x + 11 = ${fmt(rightValue(x))}`}
            </text>
        </g>
    );
}

// ── VIEW A: the two towers ───────────────────────────────────────────────────

function TowersDrawing() {
    const svgRef = useRef<SVGSVGElement>(null);
    const x = useVar<number>("bracketsX", DEFAULT_X);
    const { opacity, isActive, hoverProps } = useLinkedHighlight();
    const { handlers } = useDragX(svgRef);

    const towers = [
        { id: "left-side", centre: 120, hue: LEFT_HUE, value: leftValue(x) },
        { id: "right-side", centre: 252, hue: RIGHT_HUE, value: rightValue(x) },
    ];
    const level = leftValue(x) === rightValue(x);

    return (
        <svg ref={svgRef} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="block w-full">
            <SharedReadouts x={x} />

            {/* the shared zero line */}
            <line x1={X0} y1={AXIS_Y} x2={X1} y2={AXIS_Y} stroke={INK_STRUCTURE} strokeWidth={1.5} strokeLinecap="round" />

            {towers.map((tower) => {
                const top = toPixelY(tower.value);
                const active = isActive(tower.id);
                return (
                    <g key={tower.id} opacity={opacity(tower.id)} style={EASE} {...hoverProps(tower.id)}>
                        {active && (
                            <rect
                                x={tower.centre - 36}
                                y={top - 4}
                                width={72}
                                height={AXIS_Y - top + 8}
                                rx={6}
                                fill="none"
                                stroke={tower.hue}
                                strokeWidth={9}
                                opacity={0.28}
                            />
                        )}
                        <rect
                            x={tower.centre - 32}
                            y={top}
                            width={64}
                            height={AXIS_Y - top}
                            rx={4}
                            fill={tower.hue}
                            fillOpacity={active ? 0.42 : 0.2}
                            stroke={tower.hue}
                            strokeWidth={active ? 3.5 : 2}
                            style={EASE}
                        />
                    </g>
                );
            })}

            {level && (
                <line
                    x1={72}
                    y1={toPixelY(leftValue(x))}
                    x2={300}
                    y2={toPixelY(leftValue(x))}
                    stroke={INK}
                    strokeWidth={1.5}
                    strokeDasharray="5 4"
                />
            )}

            {/* the number line the marker slides along */}
            <line x1={X0} y1={LINE_Y} x2={X1} y2={LINE_Y} stroke={INK_STRUCTURE} strokeWidth={1.5} strokeLinecap="round" />
            {Array.from({ length: 6 }, (_, i) => i * 2).map((tick) => (
                <g key={`tick-${tick}`}>
                    <line x1={toPixelX(tick)} y1={LINE_Y - 4} x2={toPixelX(tick)} y2={LINE_Y + 4} stroke={INK_STRUCTURE} strokeWidth={1.5} />
                    <text x={toPixelX(tick)} y={LINE_Y + 20} textAnchor="middle" fontSize="11" fill={INK_STRUCTURE}>
                        {tick}
                    </text>
                </g>
            ))}
            <rect x={X0 - 10} y={LINE_Y - 16} width={X1 - X0 + 20} height={32} fill="transparent" {...handlers} />
            <line x1={toPixelX(x)} y1={AXIS_Y} x2={toPixelX(x)} y2={LINE_Y} stroke={INK_QUIET} strokeWidth={1.5} />
            <circle cx={toPixelX(x)} cy={LINE_Y} r={9} fill={INK} {...handlers} />
            <text
                x={clamp(toPixelX(x), X0 + 32, X1 - 32)}
                y={LINE_Y - 16}
                textAnchor="middle"
                fontSize="12"
                fill={INK}
                style={{ fontVariantNumeric: "tabular-nums" }}
            >
                {`x = ${fmt(x)}`}
            </text>
        </svg>
    );
}

// ── VIEW B: the same two expressions as lines ────────────────────────────────

function LinesDrawing() {
    const svgRef = useRef<SVGSVGElement>(null);
    const x = useVar<number>("bracketsX", DEFAULT_X);
    const { opacity, isActive, hoverProps } = useLinkedHighlight();
    const { handlers } = useDragX(svgRef);

    const lines = [
        { id: "left-side", hue: LEFT_HUE, at: leftValue },
        { id: "right-side", hue: RIGHT_HUE, at: rightValue },
    ];
    const level = leftValue(x) === rightValue(x);

    return (
        <svg ref={svgRef} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="block w-full">
            <SharedReadouts x={x} />

            {/* value gridlines — same scale as the towers */}
            {[0, 5, 10, 15, 20, 25].map((value) => (
                <g key={`grid-${value}`}>
                    <line x1={X0} y1={toPixelY(value)} x2={X1} y2={toPixelY(value)} stroke={INK_QUIET} strokeWidth={1.5} />
                    <text x={42} y={toPixelY(value) + 4} textAnchor="end" fontSize="11" fill={INK_STRUCTURE}>
                        {value}
                    </text>
                </g>
            ))}
            <line x1={X0} y1={AXIS_Y} x2={X1} y2={AXIS_Y} stroke={INK_STRUCTURE} strokeWidth={1.5} strokeLinecap="round" />
            {Array.from({ length: 6 }, (_, i) => i * 2).map((tick) => (
                <text key={`xtick-${tick}`} x={toPixelX(tick)} y={AXIS_Y + 18} textAnchor="middle" fontSize="11" fill={INK_STRUCTURE}>
                    {tick}
                </text>
            ))}

            <line x1={toPixelX(x)} y1={toPixelY(27)} x2={toPixelX(x)} y2={AXIS_Y} stroke={INK_QUIET} strokeWidth={1.5} />

            {lines.map((line) => {
                const active = isActive(line.id);
                return (
                    <g key={line.id} opacity={opacity(line.id)} style={EASE} {...hoverProps(line.id)}>
                        {active && (
                            <line
                                x1={toPixelX(0)}
                                y1={toPixelY(line.at(0))}
                                x2={toPixelX(X_MAX)}
                                y2={toPixelY(line.at(X_MAX))}
                                stroke={line.hue}
                                strokeWidth={9}
                                opacity={0.28}
                                strokeLinecap="round"
                            />
                        )}
                        <line
                            x1={toPixelX(0)}
                            y1={toPixelY(line.at(0))}
                            x2={toPixelX(X_MAX)}
                            y2={toPixelY(line.at(X_MAX))}
                            stroke={line.hue}
                            strokeWidth={active ? 4 : 2.5}
                            strokeLinecap="round"
                            style={EASE}
                        />
                        <circle
                            cx={toPixelX(x)}
                            cy={toPixelY(line.at(x))}
                            r={active ? 9 : 7}
                            fill={line.hue}
                            stroke="#FFFFFF"
                            strokeWidth={2}
                            {...handlers}
                        />
                    </g>
                );
            })}

            {level && (
                <text
                    x={clamp(toPixelX(x), X0 + 60, X1 - 60)}
                    y={toPixelY(leftValue(x)) - 16}
                    textAnchor="middle"
                    fontSize="12"
                    fill={INK}
                    style={{ fontVariantNumeric: "tabular-nums" }}
                >
                    {`both sides ${fmt(leftValue(x))}`}
                </text>
            )}
        </svg>
    );
}

function TowersFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="brackets-towers"
            caption="Each tower is worth one side of the equation. Slide the marker until they are exactly level."
            onReset={() => {
                setVar("bracketsX", DEFAULT_X);
                setVar("bracketsHighlight", "");
            }}
        >
            <TowersDrawing />
            <InteractionHintSequence
                hintKey="brackets-towers-drag"
                steps={[
                    {
                        gesture: "drag-horizontal",
                        label: "Slide the marker along the number line",
                        position: { x: "29%", y: "86%" },
                        dragPath: { type: "line", startOffset: { x: -26, y: 0 }, endOffset: { x: 30, y: 0 } },
                    },
                ]}
            />
        </Figure>
    );
}

function LinesFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="brackets-lines"
            caption="The same two sides drawn as lines. Drag either dot; the towers move with it."
            onReset={() => {
                setVar("bracketsX", DEFAULT_X);
                setVar("bracketsHighlight", "");
            }}
        >
            <LinesDrawing />
            <InteractionHintSequence
                hintKey="brackets-lines-drag"
                steps={[
                    {
                        gesture: "drag-horizontal",
                        label: "Drag either dot along its line",
                        position: { x: "29%", y: "54%" },
                        dragPath: { type: "line", startOffset: { x: -24, y: 0 }, endOffset: { x: 28, y: 0 } },
                    },
                ]}
            />
        </Figure>
    );
}

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

    <StackLayout key="layout-brackets-invite" maxWidth="xl">
        <Block id="brackets-invite" padding="sm">
            <EditableParagraph id="para-brackets-invite" blockId="brackets-invite">Each side is worth something in its own right, and <InlineLinkedHighlight varName={"bracketsHighlight"} highlightId={"left-side"} color={"#62D0AD"} bgColor={"rgba(98, 208, 173, 0.2)"} id={"link-brackets-left-side"}>the teal side</InlineLinkedHighlight> grows twice as fast as <InlineLinkedHighlight varName={"bracketsHighlight"} highlightId={"right-side"} color={"#a855f7"} bgColor={"rgba(98, 208, 173, 0.2)"} id={"link-brackets-right-side"}>the indigo side</InlineLinkedHighlight>, so somewhere they have to agree. Slide the marker along the number line until the two towers stand exactly level, and watch the dots on the graph beside them.</EditableParagraph>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-brackets-visual" ratio="1:1" gap="lg" align="start">
        <Block id="brackets-visual" padding="sm" hasVisualization>
            <TowersFigure />
        </Block>
        <Block id="brackets-visual-lines" padding="sm" hasVisualization>
            <LinesFigure />
        </Block>
    </SplitLayout>,

    <StackLayout key="layout-brackets-reflection" maxWidth="xl">
        <Block id="brackets-reflection" padding="sm">
            <EditableParagraph id="para-brackets-reflection" blockId="brackets-reflection">
                They level off at <InlineFormula latex="x = 5" colorMap={{}} />, both sides worth
                16, and the graph shows why there is only one answer: two straight lines of
                different steepness cross exactly once. Taking one{" "}
                <InlineFormula latex="x" colorMap={{}} /> and then 6 from each side lands on the
                same place without any drawing.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-brackets-question-solve" maxWidth="xl">
        <Block id="brackets-question-solve" padding="md">
            <EditableParagraph id="para-brackets-question-solve" blockId="brackets-question-solve">Tidy up <InlineFormula latex={"3(x + 2) = x + 14"} colorMap={{}} color={"#000000"} id={"inlineFormula-1788024370374-np53a"} /> the same way, and <InlineFormula latex={"x"} colorMap={{}} color={"#000000"} id={"inlineFormula-1788024370374-rwhrm"} /> turns out to be <InlineFeedback varName={"answer_brackets_solve"} correctValue={"4"} caseSensitive={false} position={"terminal"} successMessage={"— spot on, expanding gives 3x + 6 = x + 14, and clearing one x and the 6 leaves 2x = 8"} failureMessage={"— not this time"} hint={"Expand the bracket first, then take one x from each side, then take 6 from each side"} reviewLabel={"Review this concept"}><InlineClozeInput varName={"answer_brackets_solve"} correctAnswer={"4"} placeholder={"???"} color={"#E53935"} bgColor={"rgba(59, 130, 246, 0.35)"} caseSensitive={false} id={"cloze-1788024370374-z2al9"} /></InlineFeedback>.</EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-brackets-question-cross" maxWidth="xl">
        <Block id="brackets-question-cross" padding="md">
            <EditableParagraph id="para-brackets-question-cross" blockId="brackets-question-cross">On a graph, the solution of an equation sits at the point where the two lines <InlineFeedback varName={"answer_brackets_cross"} correctValue={"cross"} caseSensitive={false} position={"terminal"} successMessage={"— exactly, crossing means both sides are worth the same at that value of x"} failureMessage={"— worth another look"} hint={"Equal sides means equal heights, so the two dots have to be in the same place"} reviewLabel={"Review this concept"} visualizationHint={{"blockId": "brackets-visual", "hintKey": "feedback-brackets-cross", "label": "Discover it yourself", "steps": [{"gesture": "drag-horizontal", "label": "Slide the marker out to 8 — the teal tower shoots past the indigo one", "position": {"x": "29%", "y": "86%"}, "completionVar": "bracketsX", "completionValue": 8, "completionTolerance": 0.6}, {"gesture": "drag-horizontal", "label": "Now bring it back to 5, where the towers level and the two dots meet", "position": {"x": "60%", "y": "86%"}, "completionVar": "bracketsX", "completionValue": 5, "completionTolerance": 0.3}], "resetVars": {"bracketsX": 2, "bracketsHighlight": ""}}}><InlineClozeChoice varName={"answer_brackets_cross"} correctAnswer={"cross"} options={["cross", "are steepest", "reach zero"]} placeholder={"???"} color={"#E53935"} bgColor={"rgba(59, 130, 246, 0.35)"} id={"choice-1788024370375-gzrnp"} /></InlineFeedback>.</EditableParagraph>
        </Block>
    </StackLayout>,
];
