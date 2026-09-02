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
import {
    getVariableInfo,
    clozePropsFromDefinition,
    choicePropsFromDefinition,
    linkedHighlightPropsFromDefinition,
} from "../variables";

// ─────────────────────────────────────────────────────────────────────────────
// Algebra tiles for x² + 5x + 6.
// One x-by-x square is fixed in the corner. Five x-tiles can go to the RIGHT of
// it or UNDERNEATH it, and the gap they open in the corner is exactly
// (right × underneath) unit spaces. Only the 2 / 3 split makes room for all six
// unit tiles — which is the whole of factorising, discovered by hand.
// ─────────────────────────────────────────────────────────────────────────────

const VIEW_W = 520;
const VIEW_H = 420;
const BUILD = { x: 90, y: 60 };
const X_LEN = 68;
const UNIT = 22;
const CORNER_X = BUILD.x + X_LEN;
const CORNER_Y = BUILD.y + X_LEN;

const TOTAL_STRIPS = 5;
const TOTAL_UNITS = 6;

const INK = "#334155";
const INK_STRUCTURE = "#64748B";
const INK_QUIET = "#CBD5E1";
const SQUARE_HUE = "#62D0AD";
const STRIP_HUE = "#8E90F5";
const UNIT_HUE = "#94A3B8";

const EASE = { transition: "opacity 150ms ease, stroke-width 150ms ease" } as const;

type DragSource = "tray" | "right" | "bottom" | "units";
type DragState = { kind: "strip" | "unit"; from: DragSource; x: number; y: number };
type Zone = "right" | "bottom" | "units" | null;

const zoneOf = (x: number, y: number): Zone => {
    if (x < 60 || x > 310 || y < 30 || y > 320) return null;
    if (x >= CORNER_X && y < CORNER_Y) return "right";
    if (x < CORNER_X && y >= CORNER_Y) return "bottom";
    if (x >= CORNER_X && y >= CORNER_Y) return "units";
    return null;
};

function TilesDrawing() {
    const svgRef = useRef<SVGSVGElement>(null);
    const setVar = useSetVar();
    const right = useVar<number>("factorRightStrips", 0);
    const bottom = useVar<number>("factorBottomStrips", 0);
    const units = useVar<number>("factorUnits", 0);
    const highlight = useVar<string>("factorHighlight", "");
    const [drag, setDrag] = useState<DragState | null>(null);

    const placedStrips = right + bottom;
    const stripsLeft = TOTAL_STRIPS - placedStrips;
    const unitsLeft = TOTAL_UNITS - units;
    const capacity = right * bottom;
    const complete = placedStrips === TOTAL_STRIPS && units === TOTAL_UNITS && capacity === TOTAL_UNITS;

    const opacity = (id: string) => (highlight && highlight !== id ? 0.35 : 1);
    const isActive = (id: string) => highlight === id;
    const hoverProps = (id: string) => ({
        onPointerEnter: () => setVar("factorHighlight", id),
        onPointerLeave: () => setVar("factorHighlight", ""),
    });

    const toSvg = (event: React.PointerEvent) => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return { x: 0, y: 0 };
        return {
            x: ((event.clientX - rect.left) / rect.width) * VIEW_W,
            y: ((event.clientY - rect.top) / rect.height) * VIEW_H,
        };
    };

    const startDrag = (kind: "strip" | "unit", from: DragSource) => (event: React.PointerEvent) => {
        svgRef.current?.setPointerCapture(event.pointerId);
        const point = toSvg(event);
        setDrag({ kind, from, x: point.x, y: point.y });
    };

    const handleMove = (event: React.PointerEvent) => {
        if (!drag) return;
        const point = toSvg(event);
        setDrag({ ...drag, x: point.x, y: point.y });
    };

    const handleUp = () => {
        if (!drag) return;
        const zone = zoneOf(drag.x, drag.y);
        if (drag.from === "tray") {
            if (drag.kind === "strip" && stripsLeft > 0 && (zone === "right" || zone === "bottom")) {
                if (zone === "right") setVar("factorRightStrips", right + 1);
                else setVar("factorBottomStrips", bottom + 1);
            }
            if (drag.kind === "unit" && zone === "units" && units < Math.min(TOTAL_UNITS, capacity)) {
                setVar("factorUnits", units + 1);
            }
        } else if (zone !== drag.from) {
            if (drag.from === "right") {
                setVar("factorRightStrips", right - 1);
                setVar("factorUnits", Math.min(units, (right - 1) * bottom));
            } else if (drag.from === "bottom") {
                setVar("factorBottomStrips", bottom - 1);
                setVar("factorUnits", Math.min(units, right * (bottom - 1)));
            } else if (drag.from === "units") {
                setVar("factorUnits", units - 1);
            }
        }
        setDrag(null);
    };

    const grab = { style: { cursor: "grab", touchAction: "none" } as const };
    const rectWidth = X_LEN + right * UNIT;
    const rectHeight = X_LEN + bottom * UNIT;
    const dropZone = drag ? zoneOf(drag.x, drag.y) : null;

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="block w-full"
            onPointerMove={handleMove}
            onPointerUp={handleUp}
        >
            {/* where tiles may go, shown only while a tile is in hand */}
            {drag && (
                <g fill="none" stroke={INK_QUIET} strokeWidth={1.5} strokeDasharray="5 4">
                    <rect x={CORNER_X + 2} y={BUILD.y} width={TOTAL_STRIPS * UNIT} height={X_LEN} opacity={dropZone === "right" ? 1 : 0.55} />
                    <rect x={BUILD.x} y={CORNER_Y + 2} width={X_LEN} height={TOTAL_STRIPS * UNIT} opacity={dropZone === "bottom" ? 1 : 0.55} />
                    <rect x={CORNER_X + 2} y={CORNER_Y + 2} width={TOTAL_STRIPS * UNIT} height={TOTAL_STRIPS * UNIT} opacity={dropZone === "units" ? 1 : 0.55} />
                </g>
            )}

            {/* the fixed x-by-x square */}
            <g opacity={opacity("square")} style={EASE} {...hoverProps("square")}>
                <rect x={BUILD.x} y={BUILD.y} width={X_LEN} height={X_LEN} rx={3} fill={SQUARE_HUE} fillOpacity={isActive("square") ? 0.45 : 0.28} stroke={SQUARE_HUE} strokeWidth={isActive("square") ? 3.5 : 2} style={EASE} />
                <text x={BUILD.x + X_LEN / 2} y={BUILD.y + X_LEN / 2 + 6} textAnchor="middle" fontSize="16" fill={INK}>
                    x²
                </text>
            </g>

            {/* x-tiles standing to the right */}
            <g opacity={opacity("strips")} style={EASE} {...hoverProps("strips")}>
                {Array.from({ length: right }, (_, i) => (
                    <rect
                        key={`right-${i}`}
                        x={CORNER_X + i * UNIT}
                        y={BUILD.y}
                        width={UNIT}
                        height={X_LEN}
                        rx={2}
                        fill={STRIP_HUE}
                        fillOpacity={isActive("strips") ? 0.5 : 0.3}
                        stroke={STRIP_HUE}
                        strokeWidth={isActive("strips") ? 3 : 1.8}
                        style={EASE}
                        {...grab}
                        onPointerDown={startDrag("strip", "right")}
                    />
                ))}
                {Array.from({ length: bottom }, (_, i) => (
                    <rect
                        key={`bottom-${i}`}
                        x={BUILD.x}
                        y={CORNER_Y + i * UNIT}
                        width={X_LEN}
                        height={UNIT}
                        rx={2}
                        fill={STRIP_HUE}
                        fillOpacity={isActive("strips") ? 0.5 : 0.3}
                        stroke={STRIP_HUE}
                        strokeWidth={isActive("strips") ? 3 : 1.8}
                        style={EASE}
                        {...grab}
                        onPointerDown={startDrag("strip", "bottom")}
                    />
                ))}
                {/* tiles still waiting in the tray */}
                {Array.from({ length: stripsLeft }, (_, i) => (
                    <rect
                        key={`tray-strip-${i}`}
                        x={340 + i * 30}
                        y={92}
                        width={UNIT}
                        height={X_LEN}
                        rx={2}
                        fill={STRIP_HUE}
                        fillOpacity={isActive("strips") ? 0.5 : 0.3}
                        stroke={STRIP_HUE}
                        strokeWidth={isActive("strips") ? 3 : 1.8}
                        style={EASE}
                        {...grab}
                        onPointerDown={startDrag("strip", "tray")}
                    />
                ))}
            </g>

            {/* single tiles filling the corner */}
            <g opacity={opacity("units")} style={EASE} {...hoverProps("units")}>
                {Array.from({ length: units }, (_, i) => {
                    const column = right > 0 ? i % right : 0;
                    const row = right > 0 ? Math.floor(i / right) : 0;
                    return (
                        <rect
                            key={`unit-${i}`}
                            x={CORNER_X + column * UNIT}
                            y={CORNER_Y + row * UNIT}
                            width={UNIT}
                            height={UNIT}
                            rx={2}
                            fill={UNIT_HUE}
                            fillOpacity={isActive("units") ? 0.55 : 0.32}
                            stroke={INK_STRUCTURE}
                            strokeWidth={isActive("units") ? 3 : 1.5}
                            style={EASE}
                            {...grab}
                            onPointerDown={startDrag("unit", "units")}
                        />
                    );
                })}
                {Array.from({ length: unitsLeft }, (_, i) => (
                    <rect
                        key={`tray-unit-${i}`}
                        x={340 + (i % 3) * 30}
                        y={230 + Math.floor(i / 3) * 30}
                        width={UNIT}
                        height={UNIT}
                        rx={2}
                        fill={UNIT_HUE}
                        fillOpacity={isActive("units") ? 0.55 : 0.32}
                        stroke={INK_STRUCTURE}
                        strokeWidth={isActive("units") ? 3 : 1.5}
                        style={EASE}
                        {...grab}
                        onPointerDown={startDrag("unit", "tray")}
                    />
                ))}
            </g>

            {/* the side lengths the build has produced so far */}
            <text x={BUILD.x + rectWidth / 2} y={BUILD.y - 14} textAnchor="middle" fontSize="13" fill={complete ? SQUARE_HUE : INK_STRUCTURE}>
                {right > 0 ? `x + ${right}` : "x"}
            </text>
            <text x={BUILD.x - 12} y={BUILD.y + rectHeight / 2 + 4} textAnchor="end" fontSize="13" fill={complete ? SQUARE_HUE : INK_STRUCTURE}>
                {bottom > 0 ? `x + ${bottom}` : "x"}
            </text>

            {/* tray labels */}
            <text x={340} y={80} fontSize="12" fill={INK_STRUCTURE}>
                x-tiles left: {stripsLeft}
            </text>
            <text x={340} y={218} fontSize="12" fill={INK_STRUCTURE}>
                single tiles left: {unitsLeft}
            </text>

            {/* the tile in the student's hand */}
            {drag && (
                <rect
                    x={drag.x - (drag.kind === "unit" ? UNIT / 2 : dropZone === "bottom" ? X_LEN / 2 : UNIT / 2)}
                    y={drag.y - (drag.kind === "unit" ? UNIT / 2 : dropZone === "bottom" ? UNIT / 2 : X_LEN / 2)}
                    width={drag.kind === "unit" ? UNIT : dropZone === "bottom" ? X_LEN : UNIT}
                    height={drag.kind === "unit" ? UNIT : dropZone === "bottom" ? UNIT : X_LEN}
                    rx={2}
                    fill={drag.kind === "unit" ? UNIT_HUE : STRIP_HUE}
                    fillOpacity={0.55}
                    stroke={drag.kind === "unit" ? INK_STRUCTURE : STRIP_HUE}
                    strokeWidth={2}
                    pointerEvents="none"
                />
            )}

            {/* what the build is telling us */}
            {complete ? (
                <text x={260} y={384} textAnchor="middle" fontSize="14" fill={SQUARE_HUE}>
                    (x + 2)(x + 3) = x² + 5x + 6
                </text>
            ) : placedStrips === TOTAL_STRIPS && capacity < TOTAL_UNITS ? (
                <text x={260} y={384} textAnchor="middle" fontSize="12" fill={INK}>
                    {`This split leaves room for only ${capacity} single tiles`}
                </text>
            ) : (
                <text x={260} y={384} textAnchor="middle" fontSize="12" fill={INK_STRUCTURE}>
                    {`${placedStrips} of 5 x-tiles and ${units} of 6 single tiles placed`}
                </text>
            )}
        </svg>
    );
}

function TilesFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="factorising-tiles"
            caption="Drag the x-tiles to the right of the square or underneath it, then fill the corner with single tiles. Only one arrangement closes up into a rectangle."
            onReset={() => {
                setVar("factorRightStrips", 0);
                setVar("factorBottomStrips", 0);
                setVar("factorUnits", 0);
                setVar("factorHighlight", "");
            }}
        >
            <TilesDrawing />
            <InteractionHintSequence
                hintKey="factorising-tiles-drag"
                steps={[
                    {
                        gesture: "drag",
                        label: "Drag an x-tile beside the square",
                        position: { x: "68%", y: "31%" },
                        dragPath: { type: "line", startOffset: { x: 20, y: 0 }, endOffset: { x: -40, y: -6 } },
                    },
                ]}
            />
        </Figure>
    );
}

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
                <InlineFormula
                    latex="\clr{square}{x^2} + \clr{strip}{5x} + \clr{unit}{6} = 0"
                    colorMap={{ square: "#62D0AD", strip: "#8E90F5", unit: "#94A3B8" }}
                />. To use the zero rule we
                need two brackets multiplied together, so we hunt for two numbers that multiply
                to 6 and add to 5.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-factorising-invite" maxWidth="xl">
        <Block id="factorising-invite" padding="sm">
            <EditableParagraph id="para-factorising-invite" blockId="factorising-invite">
                The tiles make that hunt physical: one big square, five{" "}
                <InlineLinkedHighlight
                    id="link-factorising-strips"
                    varName="factorHighlight"
                    highlightId="strips"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo('factorHighlight'))}
                >
                    x-tiles
                </InlineLinkedHighlight>{" "}
                and six{" "}
                <InlineLinkedHighlight
                    id="link-factorising-units"
                    varName="factorHighlight"
                    highlightId="units"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo('factorHighlight'))}
                >
                    single tiles
                </InlineLinkedHighlight>
                . Drag them into the frame and find the split of the five that leaves room for
                exactly six.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-factorising-visual" maxWidth="xl">
        <Block id="factorising-visual" padding="sm" hasVisualization>
            <TilesFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-factorising-solutions" maxWidth="xl">
        <Block id="factorising-solutions" padding="sm">
            <EditableParagraph id="para-factorising-solutions" blockId="factorising-solutions">
                Only 2 and 3 close the rectangle, and it measures{" "}
                <InlineFormula latex="\clr{side}{x + 2}" colorMap={{ side: "#62D0AD" }} /> by{" "}
                <InlineFormula latex="\clr{side}{x + 3}" colorMap={{ side: "#62D0AD" }} />. The brackets hold +2 and +3, yet
                the solutions are <InlineFormula latex="\clr{side}{x = -2}" colorMap={{ side: "#62D0AD" }} /> and{" "}
                <InlineFormula latex="\clr{side}{x = -3}" colorMap={{ side: "#62D0AD" }} />, because each
                bracket has to end up
                empty.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-factorising-question-split" maxWidth="xl">
        <Block id="factorising-question-split" padding="md">
            <EditableParagraph id="para-factorising-question-split" blockId="factorising-question-split">
                The five x-tiles only open up six corner spaces when they are split{" "}
                <InlineFeedback
                    varName="answer_factor_split"
                    correctValue="2 and 3"
                    position="terminal"
                    successMessage="— right, 2 across and 3 down opens a 2 by 3 corner, which is where the 6 comes from"
                    failureMessage="— try that split on the tiles"
                    hint="The corner gap is as wide as the tiles on the right and as tall as the tiles underneath"
                    visualizationHint={{
                        blockId: "factorising-visual",
                        hintKey: "feedback-factorising-split",
                        label: "Discover it yourself",
                        steps: [
                            {
                                gesture: "drag",
                                label: "Put four x-tiles under the square and one to its right — count the corner spaces",
                                position: { x: "30%", y: "45%" },
                                completionVar: "factorBottomStrips",
                                completionValue: 4,
                                completionTolerance: 0.4,
                            },
                            {
                                gesture: "drag",
                                label: "Now rebuild with three underneath and two on the right, and fill all six",
                                position: { x: "45%", y: "45%" },
                                completionVar: "factorUnits",
                                completionValue: 6,
                                completionTolerance: 0.4,
                            },
                        ],
                        resetVars: { factorRightStrips: 0, factorBottomStrips: 0, factorUnits: 0, factorHighlight: "" },
                    }}
                >
                    <InlineClozeChoice
                        varName="answer_factor_split"
                        correctAnswer="2 and 3"
                        options={["2 and 3", "1 and 4", "5 and 0"]}
                        {...choicePropsFromDefinition(getVariableInfo('answer_factor_split'))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-factorising-question-solve" maxWidth="xl">
        <Block id="factorising-question-solve" padding="md">
            <EditableParagraph id="para-factorising-question-solve" blockId="factorising-question-solve">
                Hunt down the pair for <InlineFormula
                    latex="\clr{square}{x^2} + \clr{strip}{7x} + \clr{unit}{12} = 0"
                    colorMap={{ square: "#62D0AD", strip: "#8E90F5", unit: "#94A3B8" }}
                />:
                one solution is <InlineFormula latex="\clr{side}{x = -3}" colorMap={{ side: "#62D0AD" }} /> and the other
                is{" "}
                <InlineFeedback
                    varName="answer_factor_solution"
                    correctValue={["-4", "x = -4"]}
                    position="terminal"
                    successMessage="— yes, 3 and 4 multiply to 12 and add to 7, so the brackets are (x + 3)(x + 4)"
                    failureMessage="— not that one"
                    hint="Find two numbers multiplying to 12 and adding to 7, then ask what empties each bracket"
                >
                    <InlineClozeInput
                        varName="answer_factor_solution"
                        correctAnswer={["-4", "x = -4"]}
                        {...clozePropsFromDefinition(getVariableInfo('answer_factor_solution'))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
