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
// LINKED PAIR for  (x + 2)(x + 3)
//   View A — a rectangle whose two sides are x + 2 and x + 3
//   View B — the same product plotted against x, crossing zero twice
// Both read `zeroProductX` and `zeroProductHighlight`. Hovering a side of the
// rectangle pops the crossing it creates on the curve, and the other way round.
// ─────────────────────────────────────────────────────────────────────────────

const VIEW_W = 340;
const VIEW_H = 340;

const INK = "#334155";
const INK_STRUCTURE = "#64748B";
const INK_QUIET = "#E2E8F0";
const SIDE_A_HUE = "#62D0AD"; // x + 2
const SIDE_B_HUE = "#8E90F5"; // x + 3
const NEGATIVE_HUE = "#F4A89A";

const X_MIN = -5;
const X_MAX = 2;
const DEFAULT_X = 1;

const sideA = (x: number) => x + 2;
const sideB = (x: number) => x + 3;
const product = (x: number) => sideA(x) * sideB(x);
const fmt = (value: number) => value.toFixed(1);
const fmtX = (value: number) => value.toFixed(1);

const EASE = { transition: "opacity 150ms ease, stroke-width 150ms ease" } as const;

const useLinkedHighlight = () => {
    const highlight = useVar<string>("zeroProductHighlight", "");
    const setVar = useSetVar();
    return {
        opacity: (id: string) => (highlight && highlight !== id ? 0.35 : 1),
        isActive: (id: string) => highlight === id,
        hoverProps: (id: string) => ({
            onPointerEnter: () => setVar("zeroProductHighlight", id),
            onPointerLeave: () => setVar("zeroProductHighlight", ""),
        }),
    };
};

/** Shared header readout — the same product, the same formatter, in both views. */
function SharedProductReadout({ x }: { x: number }) {
    const value = product(x);
    return (
        <g fontSize="12" style={{ fontVariantNumeric: "tabular-nums" }}>
            <text x={VIEW_W / 2} y={32} textAnchor="middle" fill={value === 0 ? SIDE_A_HUE : INK}>
                {`(x + 2)(x + 3) = ${fmt(value)}`}
            </text>
        </g>
    );
}

// ── VIEW A: the rectangle ────────────────────────────────────────────────────

const ORIGIN = { x: 150, y: 210 };
const PX_PER_LENGTH = 26;

function RectangleDrawing() {
    const svgRef = useRef<SVGSVGElement>(null);
    const setVar = useSetVar();
    const x = useVar<number>("zeroProductX", DEFAULT_X);
    const { opacity, isActive, hoverProps } = useLinkedHighlight();
    const [dragging, setDragging] = useState(false);

    const width = sideA(x);
    const height = sideB(x);
    const cornerX = ORIGIN.x + width * PX_PER_LENGTH;
    const cornerY = ORIGIN.y - height * PX_PER_LENGTH;
    const rectX = Math.min(ORIGIN.x, cornerX);
    const rectY = Math.min(ORIGIN.y, cornerY);
    const rectW = Math.abs(cornerX - ORIGIN.x);
    const rectH = Math.abs(cornerY - ORIGIN.y);
    const negative = product(x) < 0;

    const applyPointer = (event: React.PointerEvent) => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;
        const pointerX = ((event.clientX - rect.left) / rect.width) * VIEW_W;
        const pointerY = ((event.clientY - rect.top) / rect.height) * VIEW_H;
        const fromWidth = (pointerX - ORIGIN.x) / PX_PER_LENGTH - 2;
        const fromHeight = (ORIGIN.y - pointerY) / PX_PER_LENGTH - 3;
        const next = (fromWidth + fromHeight) / 2;
        setVar("zeroProductX", clamp(Math.round(next * 2) / 2, X_MIN, X_MAX));
    };
    const dragHandlers = {
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
    };

    return (
        <svg ref={svgRef} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="block w-full">
            <SharedProductReadout x={x} />

            {/* quiet reference axes through the fixed corner */}
            <line x1={58} y1={ORIGIN.y} x2={276} y2={ORIGIN.y} stroke={INK_QUIET} strokeWidth={1.5} />
            <line x1={ORIGIN.x} y1={70} x2={ORIGIN.x} y2={278} stroke={INK_QUIET} strokeWidth={1.5} />

            {/* the product, drawn as the space the two sides span */}
            <rect
                x={rectX}
                y={rectY}
                width={rectW}
                height={rectH}
                fill={negative ? NEGATIVE_HUE : "#94A3B8"}
                fillOpacity={negative ? 0.3 : 0.18}
            />

            {/* side A: x + 2, along the bottom */}
            <g opacity={opacity("side-a")} style={EASE} {...hoverProps("side-a")}>
                {isActive("side-a") && (
                    <line x1={ORIGIN.x} y1={ORIGIN.y} x2={cornerX} y2={ORIGIN.y} stroke={SIDE_A_HUE} strokeWidth={10} opacity={0.28} strokeLinecap="round" />
                )}
                <line
                    x1={ORIGIN.x}
                    y1={ORIGIN.y}
                    x2={cornerX}
                    y2={ORIGIN.y}
                    stroke={SIDE_A_HUE}
                    strokeWidth={isActive("side-a") ? 5 : 3.5}
                    strokeLinecap="round"
                    style={EASE}
                />
                <text
                    x={clamp((ORIGIN.x + cornerX) / 2, 68, 272)}
                    y={ORIGIN.y + 22}
                    textAnchor="middle"
                    fontSize="12"
                    fill={SIDE_A_HUE}
                    style={{ fontVariantNumeric: "tabular-nums" }}
                >
                    {`x + 2 = ${fmt(width)}`}
                </text>
            </g>

            {/* side B: x + 3, up the side */}
            <g opacity={opacity("side-b")} style={EASE} {...hoverProps("side-b")}>
                {isActive("side-b") && (
                    <line x1={ORIGIN.x} y1={ORIGIN.y} x2={ORIGIN.x} y2={cornerY} stroke={SIDE_B_HUE} strokeWidth={10} opacity={0.28} strokeLinecap="round" />
                )}
                <line
                    x1={ORIGIN.x}
                    y1={ORIGIN.y}
                    x2={ORIGIN.x}
                    y2={cornerY}
                    stroke={SIDE_B_HUE}
                    strokeWidth={isActive("side-b") ? 5 : 3.5}
                    strokeLinecap="round"
                    style={EASE}
                />
                <text
                    x={ORIGIN.x - 10}
                    y={clamp((ORIGIN.y + cornerY) / 2, 78, 268)}
                    textAnchor="end"
                    fontSize="12"
                    fill={SIDE_B_HUE}
                    style={{ fontVariantNumeric: "tabular-nums" }}
                >
                    {`x + 3 = ${fmt(height)}`}
                </text>
            </g>

            {/* the draggable far corner */}
            <circle cx={cornerX} cy={cornerY} r={8} fill={INK} {...dragHandlers} />
            <circle cx={cornerX} cy={cornerY} r={20} fill="transparent" {...dragHandlers} />
            <text
                x={clamp(cornerX, 60, 280)}
                y={clamp(cornerY - 16, 56, 300)}
                textAnchor="middle"
                fontSize="12"
                fill={INK}
                style={{ fontVariantNumeric: "tabular-nums" }}
            >
                {`x = ${fmtX(x)}`}
            </text>
        </svg>
    );
}

// ── VIEW B: the product plotted against x ────────────────────────────────────

const PLOT_X0 = 48;
const PLOT_X1 = 308;
const ZERO_Y = 250;
const PX_PER_PRODUCT = 9;

const toPlotX = (x: number) => PLOT_X0 + ((x - X_MIN) / (X_MAX - X_MIN)) * (PLOT_X1 - PLOT_X0);
const toPlotY = (value: number) => ZERO_Y - value * PX_PER_PRODUCT;

function ProductCurveDrawing() {
    const svgRef = useRef<SVGSVGElement>(null);
    const setVar = useSetVar();
    const x = useVar<number>("zeroProductX", DEFAULT_X);
    const { opacity, isActive, hoverProps } = useLinkedHighlight();
    const [dragging, setDragging] = useState(false);

    const points: string[] = [];
    for (let value = X_MIN; value <= X_MAX + 0.001; value += 0.05) {
        points.push(`${toPlotX(value).toFixed(2)},${toPlotY(product(value)).toFixed(2)}`);
    }

    const applyPointer = (event: React.PointerEvent) => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;
        const pointerX = ((event.clientX - rect.left) / rect.width) * VIEW_W;
        const raw = X_MIN + ((pointerX - PLOT_X0) / (PLOT_X1 - PLOT_X0)) * (X_MAX - X_MIN);
        setVar("zeroProductX", clamp(Math.round(raw * 2) / 2, X_MIN, X_MAX));
    };
    const dragHandlers = {
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
    };

    const roots = [
        { id: "side-b", at: -3, hue: SIDE_B_HUE, labelY: 282 },
        { id: "side-a", at: -2, hue: SIDE_A_HUE, labelY: 304 },
    ];

    return (
        <svg ref={svgRef} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="block w-full">
            <SharedProductReadout x={x} />

            {[0, 5, 10, 15, 20].map((value) => (
                <g key={`grid-${value}`}>
                    <line x1={PLOT_X0} y1={toPlotY(value)} x2={PLOT_X1} y2={toPlotY(value)} stroke={INK_QUIET} strokeWidth={1.5} />
                    <text x={42} y={toPlotY(value) + 4} textAnchor="end" fontSize="11" fill={INK_STRUCTURE}>
                        {value}
                    </text>
                </g>
            ))}
            <line x1={PLOT_X0} y1={ZERO_Y} x2={PLOT_X1} y2={ZERO_Y} stroke={INK_STRUCTURE} strokeWidth={1.5} strokeLinecap="round" />
            {[-5, 0, 2].map((tick) => (
                <text key={`xtick-${tick}`} x={toPlotX(tick)} y={ZERO_Y + 18} textAnchor="middle" fontSize="11" fill={INK_STRUCTURE}>
                    {tick}
                </text>
            ))}

            <polyline points={points.join(" ")} fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

            {/* each crossing belongs to the bracket that empties there */}
            {roots.map((root) => (
                <g key={root.id} opacity={opacity(root.id)} style={EASE} {...hoverProps(root.id)}>
                    {isActive(root.id) && (
                        <circle cx={toPlotX(root.at)} cy={ZERO_Y} r={13} fill={root.hue} opacity={0.28} />
                    )}
                    <line x1={toPlotX(root.at)} y1={ZERO_Y} x2={toPlotX(root.at)} y2={root.labelY - 12} stroke={root.hue} strokeWidth={1.5} />
                    <circle
                        cx={toPlotX(root.at)}
                        cy={ZERO_Y}
                        r={isActive(root.id) ? 8 : 6}
                        fill={root.hue}
                        stroke="#FFFFFF"
                        strokeWidth={2}
                        style={EASE}
                    />
                    <text x={toPlotX(root.at)} y={root.labelY} textAnchor="middle" fontSize="11" fill={root.hue}>
                        {`x = ${root.at}`}
                    </text>
                </g>
            ))}

            {/* the shared x, draggable here as well */}
            <line x1={toPlotX(x)} y1={toPlotY(21)} x2={toPlotX(x)} y2={ZERO_Y} stroke={INK_QUIET} strokeWidth={1.5} />
            <circle cx={toPlotX(x)} cy={toPlotY(product(x))} r={8} fill={INK} stroke="#FFFFFF" strokeWidth={2} {...dragHandlers} />
            <circle cx={toPlotX(x)} cy={toPlotY(product(x))} r={20} fill="transparent" {...dragHandlers} />
        </svg>
    );
}

function RectangleFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="zero-product-rectangle"
            caption="The two sides are x + 2 and x + 3, so the space between them is their product. Drag the far corner."
            onReset={() => {
                setVar("zeroProductX", DEFAULT_X);
                setVar("zeroProductHighlight", "");
            }}
        >
            <RectangleDrawing />
            <InteractionHintSequence
                hintKey="zero-product-corner-drag"
                steps={[
                    {
                        gesture: "drag",
                        label: "Drag the far corner of the rectangle",
                        position: { x: "62%", y: "38%" },
                        dragPath: { type: "line", startOffset: { x: 18, y: -14 }, endOffset: { x: -22, y: 18 } },
                    },
                ]}
            />
        </Figure>
    );
}

function ProductCurveFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="zero-product-curve"
            caption="The same product plotted against x. Drag the dark dot along the curve; the rectangle follows."
            onReset={() => {
                setVar("zeroProductX", DEFAULT_X);
                setVar("zeroProductHighlight", "");
            }}
        >
            <ProductCurveDrawing />
            <InteractionHintSequence
                hintKey="zero-product-curve-drag"
                steps={[
                    {
                        gesture: "drag-horizontal",
                        label: "Drag the dark dot along the curve",
                        position: { x: "84%", y: "24%" },
                        dragPath: { type: "line", startOffset: { x: 10, y: 0 }, endOffset: { x: -34, y: 0 } },
                    },
                ]}
            />
        </Figure>
    );
}

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
                at least one of them has to be 0. Multiply 7 by a thousandth and the answer is
                tiny, but it is still not zero.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-zero-product-invite" maxWidth="xl">
        <Block id="zero-product-invite" padding="sm">
            <EditableParagraph id="para-zero-product-invite" blockId="zero-product-invite">
                Give a rectangle the sides{" "}
                <InlineLinkedHighlight
                    id="link-zero-product-side-a"
                    varName="zeroProductHighlight"
                    highlightId="side-a"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo('zeroProductHighlight'))}
                >
                    x + 2
                </InlineLinkedHighlight>{" "}
                and{" "}
                <InlineLinkedHighlight
                    id="link-zero-product-side-b"
                    varName="zeroProductHighlight"
                    highlightId="side-b"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo('zeroProductHighlight'))}
                >
                    x + 3
                </InlineLinkedHighlight>{" "}
                and the space it covers is exactly their product. Drag the far corner and hunt for
                the moments when that product falls to zero, watching the curve beside it plot the
                same number as you go.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-zero-product-visual" ratio="1:1" gap="lg" align="start">
        <Block id="zero-product-visual" padding="sm" hasVisualization>
            <RectangleFigure />
        </Block>
        <Block id="zero-product-visual-curve" padding="sm" hasVisualization>
            <ProductCurveFigure />
        </Block>
    </SplitLayout>,

    <StackLayout key="layout-zero-product-reflection" maxWidth="xl">
        <Block id="zero-product-reflection" padding="sm">
            <EditableParagraph id="para-zero-product-reflection" blockId="zero-product-reflection">
                The product dies twice, at <InlineFormula latex="x = -2" colorMap={{}} /> and at{" "}
                <InlineFormula latex="x = -3" colorMap={{}} />, each time because one side has run
                out of length. So <InlineFormula latex="(x + 2)(x + 3) = 0" colorMap={{}} /> has
                two solutions, and a quadratic normally does.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-zero-product-question-when" maxWidth="xl">
        <Block id="zero-product-question-when" padding="md">
            <EditableParagraph id="para-zero-product-question-when" blockId="zero-product-question-when">
                However far the corner is dragged, the product only reaches zero when{" "}
                <InlineFeedback
                    varName="answer_zero_product_when"
                    correctValue="one of the sides is zero"
                    position="terminal"
                    successMessage="— exactly, a rectangle with no width or no height covers nothing at all"
                    failureMessage="— worth testing on the rectangle"
                    hint="Ask what has to happen to a side for the space it spans to disappear"
                    visualizationHint={{
                        blockId: "zero-product-visual",
                        hintKey: "feedback-zero-product-sides",
                        label: "Discover it yourself",
                        steps: [
                            {
                                gesture: "drag",
                                label: "Drag the corner left until x reaches -2 — the bottom side runs out",
                                position: { x: "62%", y: "38%" },
                                completionVar: "zeroProductX",
                                completionValue: -2,
                                completionTolerance: 0.3,
                            },
                            {
                                gesture: "drag",
                                label: "Keep going to -3, where the upright side runs out instead",
                                position: { x: "42%", y: "58%" },
                                completionVar: "zeroProductX",
                                completionValue: -3,
                                completionTolerance: 0.3,
                            },
                        ],
                        resetVars: { zeroProductX: 1, zeroProductHighlight: "" },
                    }}
                >
                    <InlineClozeChoice
                        varName="answer_zero_product_when"
                        correctAnswer="one of the sides is zero"
                        options={["one of the sides is zero", "both sides are equal", "x is zero"]}
                        {...choicePropsFromDefinition(getVariableInfo('answer_zero_product_when'))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-zero-product-question-root" maxWidth="xl">
        <Block id="zero-product-question-root" padding="md">
            <EditableParagraph id="para-zero-product-question-root" blockId="zero-product-question-root">
                A different pair of brackets gives{" "}
                <InlineFormula latex="(x - 4)(x + 1) = 0" colorMap={{}} />, which is solved by{" "}
                <InlineFormula latex="x = 4" colorMap={{}} /> and by{" "}
                <InlineFeedback
                    varName="answer_zero_product_root"
                    correctValue={["-1", "x = -1"]}
                    position="terminal"
                    successMessage="— yes, because -1 + 1 is 0, and that empties the second bracket"
                    failureMessage="— close, but check the sign"
                    hint="Ask what x has to be for x + 1 to come out as zero"
                >
                    <InlineClozeInput
                        varName="answer_zero_product_root"
                        correctAnswer={["-1", "x = -1"]}
                        {...clozePropsFromDefinition(getVariableInfo('answer_zero_product_root'))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
