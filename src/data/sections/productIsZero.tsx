import { useEffect, useRef, useState, type ReactElement } from "react";
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
import { clamp } from "@/lib/motion";
import {
    getVariableInfo,
    clozePropsFromDefinition,
    choicePropsFromDefinition,
    linkedHighlightPropsFromDefinition,
} from "../variables";

// ─────────────────────────────────────────────────────────────────────────────
// Two dials, one product. Students turn either dial and hunt for a product of
// exactly zero. Every product they pass leaves a faint mark on the strip below,
// so the trail fills up everywhere EXCEPT zero until one dial is sent to 0.
// ─────────────────────────────────────────────────────────────────────────────

const VIEW_W = 560;
const VIEW_H = 360;
const DIAL_R = 80;
const KNOB_R = 62;
const VALUE_MIN = -6;
const VALUE_MAX = 6;
const SWEEP = 150; // degrees either side of straight up

const INK = "#334155";
const INK_STRUCTURE = "#64748B";
const INK_QUIET = "#CBD5E1";
const HUE_A = "#62D0AD";
const HUE_B = "#8E90F5";
const ZERO_HUE = "#F7B23B";

const fmt = (value: number) => value.toFixed(1);
const EASE = { transition: "opacity 150ms ease, stroke-width 150ms ease" } as const;

const valueToAngle = (value: number) =>
    (-SWEEP + ((value - VALUE_MIN) / (VALUE_MAX - VALUE_MIN)) * (2 * SWEEP)) * (Math.PI / 180);
const pointOnDial = (centre: { x: number; y: number }, value: number, radius: number) => {
    const angle = valueToAngle(value);
    return { x: centre.x + radius * Math.sin(angle), y: centre.y - radius * Math.cos(angle) };
};

const DIALS = [
    { id: "dial-a", varName: "zeroProductDialA", centre: { x: 140, y: 160 }, hue: HUE_A, caption: "first number", fallback: 3 },
    { id: "dial-b", varName: "zeroProductDialB", centre: { x: 420, y: 160 }, hue: HUE_B, caption: "second number", fallback: 4 },
];

const TRAIL_Y = 300;
const TRAIL_X0 = 48;
const TRAIL_X1 = 512;
const TRAIL_MAX = 36;
const productToTrailX = (value: number) => TRAIL_X0 + ((value + TRAIL_MAX) / (2 * TRAIL_MAX)) * (TRAIL_X1 - TRAIL_X0);

function DialsDrawing() {
    const svgRef = useRef<SVGSVGElement>(null);
    const setVar = useSetVar();
    const valueA = useVar<number>("zeroProductDialA", 3);
    const valueB = useVar<number>("zeroProductDialB", 4);
    const highlight = useVar<string>("zeroProductHighlight", "");
    const [dragging, setDragging] = useState<string | null>(null);
    const [trail, setTrail] = useState<number[]>([]);

    const productValue = valueA * valueB;
    const isZero = productValue === 0;

    useEffect(() => {
        setTrail((previous) => {
            const next = previous[previous.length - 1] === productValue ? previous : [...previous, productValue];
            return next.slice(-60);
        });
    }, [productValue]);

    const opacity = (id: string) => (highlight && highlight !== id ? 0.35 : 1);
    const isActive = (id: string) => highlight === id;
    const hoverProps = (id: string) => ({
        onPointerEnter: () => setVar("zeroProductHighlight", id),
        onPointerLeave: () => setVar("zeroProductHighlight", ""),
    });

    const applyPointer = (dialIndex: number, event: React.PointerEvent) => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;
        const dial = DIALS[dialIndex];
        const pointerX = ((event.clientX - rect.left) / rect.width) * VIEW_W;
        const pointerY = ((event.clientY - rect.top) / rect.height) * VIEW_H;
        const degrees = (Math.atan2(pointerX - dial.centre.x, dial.centre.y - pointerY) * 180) / Math.PI;
        const raw = VALUE_MIN + ((clamp(degrees, -SWEEP, SWEEP) + SWEEP) / (2 * SWEEP)) * (VALUE_MAX - VALUE_MIN);
        setVar(dial.varName, clamp(Math.round(raw * 2) / 2, VALUE_MIN, VALUE_MAX));
    };

    const dragHandlers = (dialIndex: number, dialId: string) => ({
        style: { cursor: dragging === dialId ? "grabbing" : "grab", touchAction: "none" } as const,
        onPointerDown: (event: React.PointerEvent<SVGElement>) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            setDragging(dialId);
            applyPointer(dialIndex, event);
        },
        onPointerMove: (event: React.PointerEvent<SVGElement>) => {
            if (dragging === dialId) applyPointer(dialIndex, event);
        },
        onPointerUp: () => setDragging(null),
    });

    return (
        <svg ref={svgRef} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="block w-full">
            {DIALS.map((dial, index) => {
                const value = index === 0 ? valueA : valueB;
                const knob = pointOnDial(dial.centre, value, KNOB_R);
                const active = isActive(dial.id);
                const atZero = value === 0;
                return (
                    <g key={dial.id} opacity={opacity(dial.id)} style={EASE} {...hoverProps(dial.id)}>
                        <text x={dial.centre.x} y={dial.centre.y - DIAL_R - 16} textAnchor="middle" fontSize="12" fill={INK_STRUCTURE}>
                            {dial.caption}
                        </text>
                        {active && (
                            <circle cx={dial.centre.x} cy={dial.centre.y} r={DIAL_R} fill="none" stroke={dial.hue} strokeWidth={9} opacity={0.28} />
                        )}
                        <circle
                            cx={dial.centre.x}
                            cy={dial.centre.y}
                            r={DIAL_R}
                            fill="#FFFFFF"
                            stroke={active ? dial.hue : INK_STRUCTURE}
                            strokeWidth={active ? 3.5 : 2}
                            style={EASE}
                        />
                        {/* ticks, with the zero tick called out in the dial's own colour */}
                        {Array.from({ length: 13 }, (_, i) => i - 6).map((tick) => {
                            const outer = pointOnDial(dial.centre, tick, DIAL_R);
                            const inner = pointOnDial(dial.centre, tick, tick === 0 ? DIAL_R - 16 : DIAL_R - 9);
                            return (
                                <line
                                    key={`${dial.id}-tick-${tick}`}
                                    x1={inner.x}
                                    y1={inner.y}
                                    x2={outer.x}
                                    y2={outer.y}
                                    stroke={tick === 0 ? dial.hue : INK_QUIET}
                                    strokeWidth={tick === 0 ? 3 : 1.5}
                                    strokeLinecap="round"
                                />
                            );
                        })}
                        <text x={dial.centre.x} y={dial.centre.y - DIAL_R + 34} textAnchor="middle" fontSize="11" fill={dial.hue}>
                            0
                        </text>
                        <text x={dial.centre.x - 48} y={dial.centre.y + 96} textAnchor="middle" fontSize="11" fill={INK_STRUCTURE}>
                            -6
                        </text>
                        <text x={dial.centre.x + 48} y={dial.centre.y + 96} textAnchor="middle" fontSize="11" fill={INK_STRUCTURE}>
                            6
                        </text>

                        {/* needle and its knob — the thing students grab */}
                        <line
                            x1={dial.centre.x}
                            y1={dial.centre.y}
                            x2={knob.x}
                            y2={knob.y}
                            stroke={dial.hue}
                            strokeWidth={active ? 5 : 3.5}
                            strokeLinecap="round"
                            style={EASE}
                        />
                        <circle cx={dial.centre.x} cy={dial.centre.y} r={5} fill={dial.hue} />
                        <circle cx={knob.x} cy={knob.y} r={11} fill={dial.hue} stroke="#FFFFFF" strokeWidth={2} {...dragHandlers(index, dial.id)} />
                        <circle cx={knob.x} cy={knob.y} r={24} fill="transparent" {...dragHandlers(index, dial.id)} />

                        <text
                            x={dial.centre.x}
                            y={dial.centre.y + 112}
                            textAnchor="middle"
                            fontSize="18"
                            fill={atZero ? dial.hue : INK}
                            style={{ fontVariantNumeric: "tabular-nums" }}
                        >
                            {fmt(value)}
                        </text>
                    </g>
                );
            })}

            {/* the product the two dials are making right now */}
            <text x={VIEW_W / 2} y={148} textAnchor="middle" fontSize="15" fill={INK_STRUCTURE} style={{ fontVariantNumeric: "tabular-nums" }}>
                {`${fmt(valueA)} × ${fmt(valueB)}`}
            </text>
            <text
                x={VIEW_W / 2}
                y={184}
                textAnchor="middle"
                fontSize="26"
                fill={isZero ? ZERO_HUE : INK}
                style={{ fontVariantNumeric: "tabular-nums" }}
            >
                {`= ${fmt(productValue)}`}
            </text>
            {isZero && (
                <text x={VIEW_W / 2} y={212} textAnchor="middle" fontSize="11" fill={ZERO_HUE}>
                    a dial is on zero
                </text>
            )}

            {/* every product visited so far */}
            <line x1={TRAIL_X0} y1={TRAIL_Y} x2={TRAIL_X1} y2={TRAIL_Y} stroke={INK_QUIET} strokeWidth={1.5} strokeLinecap="round" />
            {trail.map((visited, index) => (
                <line
                    key={`trail-${index}`}
                    x1={productToTrailX(clamp(visited, -TRAIL_MAX, TRAIL_MAX))}
                    y1={TRAIL_Y - 7}
                    x2={productToTrailX(clamp(visited, -TRAIL_MAX, TRAIL_MAX))}
                    y2={TRAIL_Y + 7}
                    stroke={INK}
                    strokeWidth={1.5}
                    opacity={0.22}
                />
            ))}
            <line x1={productToTrailX(0)} y1={TRAIL_Y - 13} x2={productToTrailX(0)} y2={TRAIL_Y + 13} stroke={ZERO_HUE} strokeWidth={2.5} strokeLinecap="round" />
            <line
                x1={productToTrailX(clamp(productValue, -TRAIL_MAX, TRAIL_MAX))}
                y1={TRAIL_Y - 11}
                x2={productToTrailX(clamp(productValue, -TRAIL_MAX, TRAIL_MAX))}
                y2={TRAIL_Y + 11}
                stroke={INK}
                strokeWidth={2.5}
                strokeLinecap="round"
            />
            <text x={TRAIL_X0} y={TRAIL_Y + 28} textAnchor="middle" fontSize="11" fill={INK_STRUCTURE}>
                -36
            </text>
            <text x={productToTrailX(0)} y={TRAIL_Y + 28} textAnchor="middle" fontSize="11" fill={ZERO_HUE}>
                0
            </text>
            <text x={TRAIL_X1} y={TRAIL_Y + 28} textAnchor="middle" fontSize="11" fill={INK_STRUCTURE}>
                36
            </text>
        </svg>
    );
}

function DialsFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="zero-product-dials"
            caption="Turn either dial by its knob. The strip underneath keeps a faint mark at every product you have visited."
            onReset={() => {
                setVar("zeroProductDialA", 3);
                setVar("zeroProductDialB", 4);
                setVar("zeroProductHighlight", "");
            }}
        >
            <DialsDrawing />
            <InteractionHintSequence
                hintKey="zero-product-dials-drag"
                steps={[
                    {
                        gesture: "drag-circular",
                        label: "Drag the knob around the dial",
                        position: { x: "36%", y: "42%" },
                        dragPath: { type: "arc", startAngle: -15, endAngle: -90, radius: 38 },
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
            <EditableParagraph id="para-zero-product-invite" blockId="zero-product-invite">Two dials hold a number each, and their product sits between them. Turn <InlineLinkedHighlight varName={"zeroProductHighlight"} highlightId={"dial-a"} color={"#62D0AD"} bgColor={"rgba(98, 208, 173, 0.2)"} id={"link-zero-product-dial-a"}>the teal dial</InlineLinkedHighlight> or <InlineLinkedHighlight varName={"zeroProductHighlight"} highlightId={"dial-b"} color={"#8E90F5"} bgColor={"rgba(142, 144, 245, 0.2)"} id={"link-zero-product-dial-b"}>the indigo dial</InlineLinkedHighlight> and try to land that product exactly on zero, watching the faint trail of everything you pass on the way.</EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-zero-product-visual" maxWidth="xl">
        <Block id="zero-product-visual" padding="sm" hasVisualization>
            <DialsFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-zero-product-reflection" maxWidth="xl">
        <Block id="zero-product-reflection" padding="sm">
            <EditableParagraph id="para-zero-product-reflection" blockId="zero-product-reflection">
                Small numbers get the product close, but only a zero on one of the dials ever
                lands it. So <InlineFormula
                    latex="\clr{first}{(x + 2)}\clr{second}{(x + 3)} = \clr{zero}{0}"
                    colorMap={{ first: "#62D0AD", second: "#8E90F5", zero: "#F7B23B" }}
                /> forces one
                bracket to be empty, and there are two ways to do that:{" "}
                <InlineFormula latex="\clr{first}{x = -2}" colorMap={{ first: "#62D0AD" }} /> or{" "}
                <InlineFormula latex="\clr{second}{x = -3}" colorMap={{ second: "#8E90F5" }} />.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-zero-product-question-when" maxWidth="xl">
        <Block id="zero-product-question-when" padding="md">
            <EditableParagraph id="para-zero-product-question-when" blockId="zero-product-question-when">
                However far the dials are turned, the product only reaches zero when{" "}
                <InlineFeedback
                    varName="answer_zero_product_when"
                    correctValue="one of the numbers is zero"
                    position="terminal"
                    successMessage="— exactly, nothing multiplied by anything is still nothing"
                    failureMessage="— worth testing on the dials"
                    hint="Try to reach zero while both dials are away from their own zero mark"
                    visualizationHint={{
                        blockId: "zero-product-visual",
                        hintKey: "feedback-zero-product-dials",
                        label: "Discover it yourself",
                        steps: [
                            {
                                gesture: "drag-circular",
                                label: "Turn the teal dial down to 0.5 — the product shrinks but never lands on zero",
                                position: { x: "36%", y: "42%" },
                                completionVar: "zeroProductDialA",
                                completionValue: 0.5,
                                completionTolerance: 0.3,
                            },
                            {
                                gesture: "drag-circular",
                                label: "Now take it all the way to the 0 mark at the top",
                                position: { x: "27%", y: "30%" },
                                completionVar: "zeroProductDialA",
                                completionValue: 0,
                                completionTolerance: 0.2,
                            },
                        ],
                        resetVars: { zeroProductDialA: 3, zeroProductDialB: 4, zeroProductHighlight: "" },
                    }}
                >
                    <InlineClozeChoice
                        varName="answer_zero_product_when"
                        correctAnswer="one of the numbers is zero"
                        options={["one of the numbers is zero", "both numbers are equal", "the numbers are opposites"]}
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
                <InlineFormula
                    latex="\clr{first}{(x - 4)}\clr{second}{(x + 1)} = \clr{zero}{0}"
                    colorMap={{ first: "#62D0AD", second: "#8E90F5", zero: "#F7B23B" }}
                />, which is solved by{" "}
                <InlineFormula latex="\clr{first}{x = 4}" colorMap={{ first: "#62D0AD" }} /> and by{" "}
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
