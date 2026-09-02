/**
 * Variables Configuration
 * =======================
 * 
 * CENTRAL PLACE TO DEFINE ALL SHARED VARIABLES
 * 
 * This file defines all variables that can be shared across sections.
 * AI agents should read this file to understand what variables are available.
 * 
 * USAGE:
 * 1. Define variables here with their default values and metadata
 * 2. Use them in any section with: const x = useVar('variableName', defaultValue)
 * 3. Update them with: setVar('variableName', newValue)
 */

import { type VarValue } from '@/stores';

/**
 * Variable definition with metadata
 */
export interface VariableDefinition {
    /** Default value */
    defaultValue: VarValue;
    /** Human-readable label */
    label?: string;
    /** Description for AI agents */
    description?: string;
    /** Variable type hint */
    type?: 'number' | 'text' | 'boolean' | 'select' | 'array' | 'object' | 'spotColor' | 'linkedHighlight';
    /** Unit (e.g., 'Hz', '°', 'm/s') - for numbers */
    unit?: string;
    /** Minimum value (for number sliders) */
    min?: number;
    /** Maximum value (for number sliders) */
    max?: number;
    /** Step increment (for number sliders) */
    step?: number;
    /** Display color for InlineScrubbleNumber / InlineSpotColor (e.g. '#D81B60') */
    color?: string;
    /** Options for 'select' type variables */
    options?: string[];
    /** Placeholder text for text inputs */
    placeholder?: string;
    /**
     * Correct answer for cloze input validation.
     * Accepts a single string, pipe-separated alternates (e.g. "first | 1 | 1st"),
     * or an array of accepted answers (e.g. ["first", "1", "1st"]).
     */
    correctAnswer?: string | string[];
    /** Whether cloze matching is case sensitive */
    caseSensitive?: boolean;
    /** Background color for inline components */
    bgColor?: string;
    /** Schema hint for object types (for AI agents) */
    schema?: string;
}

/**
 * =====================================================
 * 🎯 DEFINE YOUR VARIABLES HERE
 * =====================================================
 * 
 * SUPPORTED TYPES:
 * 
 * 1. NUMBER (slider):
 *    { defaultValue: 5, type: 'number', min: 0, max: 10, step: 1 }
 * 
 * 2. TEXT (free text):
 *    { defaultValue: 'Hello', type: 'text', placeholder: 'Enter text...' }
 * 
 * 3. SELECT (dropdown):
 *    { defaultValue: 'sine', type: 'select', options: ['sine', 'cosine', 'tangent'] }
 * 
 * 4. BOOLEAN (toggle):
 *    { defaultValue: true, type: 'boolean' }
 * 
 * 5. ARRAY (list of numbers):
 *    { defaultValue: [1, 2, 3], type: 'array' }
 * 
 * 6. OBJECT (complex data):
 *    { defaultValue: { x: 5, y: 10 }, type: 'object', schema: '{ x: number, y: number }' }
 */
export const variableDefinitions: Record<string, VariableDefinition> = {
    // ========================================
    // ADD YOUR VARIABLES HERE
    // ========================================

    // ─────────────────────────────────────────
    // KEEPING THE BALANCE — scales puzzle 3x + 4 = 19
    // ─────────────────────────────────────────
    balanceLeftBags: {
        defaultValue: 3,
        type: 'number',
        label: 'Bags on the left pan',
        description: 'Number of sealed bags (each worth x) still on the left pan',
        min: 0,
        max: 3,
        step: 1,
        color: '#62D0AD',
    },
    balanceLeftUnits: {
        defaultValue: 4,
        type: 'number',
        label: 'Loose blocks on the left pan',
        description: 'Number of single blocks still on the left pan',
        min: 0,
        max: 4,
        step: 1,
        color: '#64748B',
    },
    balanceRightUnits: {
        defaultValue: 19,
        type: 'number',
        label: 'Blocks on the right pan',
        description: 'Number of single blocks still on the right pan',
        min: 0,
        max: 19,
        step: 1,
        color: '#64748B',
    },
    balanceHighlight: {
        defaultValue: '',
        type: 'text',
        label: 'Balance highlight',
        description: 'Active highlight id linking prose phrases to parts of the scales',
        color: '#62D0AD',
        bgColor: 'rgba(98, 208, 173, 0.2)',
    },
    answer_balance_tip: {
        defaultValue: '',
        type: 'select',
        label: 'One-sided move answer',
        description: 'What happens when blocks leave only one pan',
        placeholder: '???',
        correctAnswer: 'tip',
        options: ['tip', 'stay level', 'empty'],
        color: '#AC8BF9',
        bgColor: 'rgba(172, 139, 249, 0.18)',
    },
    // ─────────────────────────────────────────
    // BRACKETS AND x ON BOTH SIDES — 2(x + 3) = x + 11
    // ─────────────────────────────────────────
    bracketsX: {
        defaultValue: 2,
        type: 'number',
        label: 'Value of x',
        description: 'The shared x value read by both the towers and the graph',
        min: 0,
        max: 10,
        step: 0.5,
        color: '#334155',
    },
    bracketsHighlight: {
        defaultValue: '',
        type: 'text',
        label: 'Brackets highlight',
        description: 'Which side of the equation is highlighted across both views',
        color: '#62D0AD',
        bgColor: 'rgba(98, 208, 173, 0.2)',
    },
    answer_brackets_solve: {
        defaultValue: '',
        type: 'text',
        label: 'Second equation answer',
        description: 'Solution of 3(x + 2) = x + 14',
        placeholder: '???',
        correctAnswer: '4',
        color: '#AC8BF9',
        bgColor: 'rgba(172, 139, 249, 0.18)',
    },
    answer_brackets_cross: {
        defaultValue: '',
        type: 'select',
        label: 'Where sides are equal',
        description: 'What the two lines do at the solution',
        placeholder: '???',
        correctAnswer: 'cross',
        options: ['cross', 'are steepest', 'reach zero'],
        color: '#AC8BF9',
        bgColor: 'rgba(172, 139, 249, 0.18)',
    },
    // ─────────────────────────────────────────
    // WHEN A PRODUCT IS ZERO — (x + 2)(x + 3)
    // ─────────────────────────────────────────
    zeroProductDialA: {
        defaultValue: 3,
        type: 'number',
        label: 'First dial',
        description: 'Number held by the teal dial',
        min: -6,
        max: 6,
        step: 0.5,
        color: '#62D0AD',
    },
    zeroProductDialB: {
        defaultValue: 4,
        type: 'number',
        label: 'Second dial',
        description: 'Number held by the indigo dial',
        min: -6,
        max: 6,
        step: 0.5,
        color: '#8E90F5',
    },
    zeroProductHighlight: {
        defaultValue: '',
        type: 'text',
        label: 'Zero product highlight',
        description: 'Which dial is highlighted from the prose',
        color: '#62D0AD',
        bgColor: 'rgba(98, 208, 173, 0.2)',
    },
    zeroProductValue: {
        defaultValue: 12,
        type: 'number',
        label: 'Product of the two dials',
        description: 'Read-only product shown in the dials formula',
        min: -36,
        max: 36,
        step: 0.25,
        color: '#334155',
    },
    answer_zero_product_when: {
        defaultValue: '',
        type: 'select',
        label: 'When a product is zero',
        description: 'The condition that makes a product equal zero',
        placeholder: '???',
        correctAnswer: 'one of the numbers is zero',
        options: ['one of the numbers is zero', 'both numbers are equal', 'the numbers are opposites'],
        color: '#AC8BF9',
        bgColor: 'rgba(172, 139, 249, 0.18)',
    },
    answer_zero_product_root: {
        defaultValue: '',
        type: 'text',
        label: 'Second solution',
        description: 'Second solution of (x - 4)(x + 1) = 0',
        placeholder: '???',
        correctAnswer: '-1',
        color: '#AC8BF9',
        bgColor: 'rgba(172, 139, 249, 0.18)',
    },
    // ─────────────────────────────────────────
    // FACTORISING TO SOLVE — tiles for x^2 + 5x + 6
    // ─────────────────────────────────────────
    factorRightStrips: {
        defaultValue: 0,
        type: 'number',
        label: 'x-tiles to the right',
        description: 'How many x-tiles stand to the right of the big square',
        min: 0,
        max: 5,
        step: 1,
        color: '#8E90F5',
    },
    factorBottomStrips: {
        defaultValue: 0,
        type: 'number',
        label: 'x-tiles underneath',
        description: 'How many x-tiles lie under the big square',
        min: 0,
        max: 5,
        step: 1,
        color: '#8E90F5',
    },
    factorUnits: {
        defaultValue: 0,
        type: 'number',
        label: 'Unit tiles placed',
        description: 'How many single tiles have been placed in the corner',
        min: 0,
        max: 6,
        step: 1,
        color: '#94A3B8',
    },
    factorHighlight: {
        defaultValue: '',
        type: 'text',
        label: 'Tile highlight',
        description: 'Which family of tiles is currently highlighted',
        color: '#62D0AD',
        bgColor: 'rgba(98, 208, 173, 0.2)',
    },
    answer_factor_split: {
        defaultValue: '',
        type: 'select',
        label: 'Strip split answer',
        description: 'How the five x-tiles must be split',
        placeholder: '???',
        correctAnswer: '2 and 3',
        options: ['2 and 3', '1 and 4', '5 and 0'],
        color: '#AC8BF9',
        bgColor: 'rgba(172, 139, 249, 0.18)',
    },
    answer_factor_first: {
        defaultValue: '',
        type: 'select',
        label: 'First bracket number',
        description: 'The number that completes (x + ?)(x + 3) for x^2 + 5x + 6',
        placeholder: '?',
        correctAnswer: '2',
        options: ['1', '2', '5'],
        color: '#AC8BF9',
        bgColor: 'rgba(172, 139, 249, 0.18)',
    },
    answer_factor_solution: {
        defaultValue: '',
        type: 'text',
        label: 'Second solution answer',
        description: 'Second solution of x^2 + 7x + 12 = 0',
        placeholder: '???',
        correctAnswer: ['-4', 'x = -4'],
        color: '#AC8BF9',
        bgColor: 'rgba(172, 139, 249, 0.18)',
    },
    answer_balance_solve: {
        defaultValue: '',
        type: 'text',
        label: 'Five bag puzzle answer',
        description: 'Weight of one bag when 5 bags and 3 blocks balance 38 blocks',
        placeholder: '???',
        correctAnswer: '7',
        color: '#AC8BF9',
        bgColor: 'rgba(172, 139, 249, 0.18)',
    },

    // Uncomment and modify these examples for your lesson:

    /*
    // ─────────────────────────────────────────
    // NUMBER - Use with sliders
    // ─────────────────────────────────────────
    myValue: {
        defaultValue: 5,
        type: 'number',
        label: 'My Value',
        description: 'A number that controls something',
        unit: 'm',           // optional unit display
        min: 0,
        max: 10,
        step: 0.5,
    },

    // ─────────────────────────────────────────
    // TEXT - Free text input
    // ─────────────────────────────────────────
    lessonTitle: {
        defaultValue: 'My Lesson',
        type: 'text',
        label: 'Lesson Title',
        description: 'The title of your lesson',
        placeholder: 'Enter a title...',
    },

    // ─────────────────────────────────────────
    // SELECT - Dropdown with options
    // ─────────────────────────────────────────
    difficulty: {
        defaultValue: 'medium',
        type: 'select',
        label: 'Difficulty',
        description: 'The difficulty level of the lesson',
        options: ['easy', 'medium', 'hard', 'expert'],
    },

    // ─────────────────────────────────────────
    // BOOLEAN - Toggle switch
    // ─────────────────────────────────────────
    showHints: {
        defaultValue: true,
        type: 'boolean',
        label: 'Show Hints',
        description: 'Toggle to show or hide hints',
    },

    // ─────────────────────────────────────────
    // ARRAY - List of numbers
    // ─────────────────────────────────────────
    dataPoints: {
        defaultValue: [1, 4, 9, 16, 25],
        type: 'array',
        label: 'Data Points',
        description: 'Y-values for plotting a graph',
    },

    // ─────────────────────────────────────────
    // OBJECT - Complex structured data
    // ─────────────────────────────────────────
    graphSettings: {
        defaultValue: { 
            xMin: -10, 
            xMax: 10, 
            showGrid: true 
        },
        type: 'object',
        label: 'Graph Settings',
        description: 'Configuration for the graph display',
        schema: '{ xMin: number, xMax: number, showGrid: boolean }',
    },
    */
};

/**
 * Get all variable names (for AI agents to discover)
 */
export const getVariableNames = (): string[] => {
    return Object.keys(variableDefinitions);
};

/**
 * Get a variable's default value
 */
export const getDefaultValue = (name: string): VarValue => {
    return variableDefinitions[name]?.defaultValue ?? 0;
};

/**
 * Get a variable's metadata
 */
export const getVariableInfo = (name: string): VariableDefinition | undefined => {
    return variableDefinitions[name];
};

/**
 * Get all default values as a record (for initialization)
 */
export const getDefaultValues = (): Record<string, VarValue> => {
    const defaults: Record<string, VarValue> = {};
    for (const [name, def] of Object.entries(variableDefinitions)) {
        defaults[name] = def.defaultValue;
    }
    return defaults;
};

/**
 * Get number props for InlineScrubbleNumber from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx, or getExampleVariableInfo(name) in exampleBlocks.tsx.
 */
export function numberPropsFromDefinition(def: VariableDefinition | undefined): {
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    color?: string;
} {
    if (!def || def.type !== 'number') return {};
    return {
        defaultValue: def.defaultValue as number,
        min: def.min,
        max: def.max,
        step: def.step,
        ...(def.color ? { color: def.color } : {}),
    };
}

/**
 * Get cloze input props for InlineClozeInput from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx, or getExampleVariableInfo(name) in exampleBlocks.tsx.
 */
/**
 * Get cloze choice props for InlineClozeChoice from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx.
 */
export function choicePropsFromDefinition(def: VariableDefinition | undefined): {
    placeholder?: string;
    color?: string;
    bgColor?: string;
} {
    if (!def || def.type !== 'select') return {};
    return {
        ...(def.placeholder ? { placeholder: def.placeholder } : {}),
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

/**
 * Get toggle props for InlineToggle from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx.
 */
export function togglePropsFromDefinition(def: VariableDefinition | undefined): {
    color?: string;
    bgColor?: string;
} {
    if (!def || def.type !== 'select') return {};
    return {
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

export function clozePropsFromDefinition(def: VariableDefinition | undefined): {
    placeholder?: string;
    color?: string;
    bgColor?: string;
    caseSensitive?: boolean;
} {
    if (!def || def.type !== 'text') return {};
    return {
        ...(def.placeholder ? { placeholder: def.placeholder } : {}),
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
        ...(def.caseSensitive !== undefined ? { caseSensitive: def.caseSensitive } : {}),
    };
}

/**
 * Get spot-color props for InlineSpotColor from a variable definition.
 * Extracts the `color` field.
 *
 * @example
 * <InlineSpotColor
 *     varName="radius"
 *     {...spotColorPropsFromDefinition(getVariableInfo('radius'))}
 * >
 *     radius
 * </InlineSpotColor>
 */
export function spotColorPropsFromDefinition(def: VariableDefinition | undefined): {
    color: string;
} {
    return {
        color: def?.color ?? '#8B5CF6',
    };
}

/**
 * Get linked-highlight props for InlineLinkedHighlight from a variable definition.
 * Extracts the `color` and `bgColor` fields.
 *
 * @example
 * <InlineLinkedHighlight
 *     varName="activeHighlight"
 *     highlightId="radius"
 *     {...linkedHighlightPropsFromDefinition(getVariableInfo('activeHighlight'))}
 * >
 *     radius
 * </InlineLinkedHighlight>
 */
export function linkedHighlightPropsFromDefinition(def: VariableDefinition | undefined): {
    color?: string;
    bgColor?: string;
} {
    return {
        ...(def?.color ? { color: def.color } : {}),
        ...(def?.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

/**
 * Build the `variables` prop for FormulaBlock from variable definitions.
 *
 * Takes an array of variable names and returns the config map expected by
 * `<FormulaBlock variables={...} />`.
 *
 * @example
 * import { scrubVarsFromDefinitions } from './variables';
 *
 * <FormulaBlock
 *     latex="\scrub{mass} \times \scrub{accel}"
 *     variables={scrubVarsFromDefinitions(['mass', 'accel'])}
 * />
 */
export function scrubVarsFromDefinitions(
    varNames: string[],
): Record<string, { min?: number; max?: number; step?: number; color?: string }> {
    const result: Record<string, { min?: number; max?: number; step?: number; color?: string }> = {};
    for (const name of varNames) {
        const def = variableDefinitions[name];
        if (!def) continue;
        result[name] = {
            ...(def.min !== undefined ? { min: def.min } : {}),
            ...(def.max !== undefined ? { max: def.max } : {}),
            ...(def.step !== undefined ? { step: def.step } : {}),
            ...(def.color ? { color: def.color } : {}),
        };
    }
    return result;
}
