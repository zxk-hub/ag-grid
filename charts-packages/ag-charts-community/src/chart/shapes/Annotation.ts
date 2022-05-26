import { Path } from "../../scene/shape/path";
import { Group } from "../../scene/group";
import { FontStyle, FontWeight } from "../../scene/shape/text";
import { ChartAxisDirection } from "../chartAxis";
import { PointerEvents } from "../../scene/node";
import { Scale } from "../../scale/scale";

export class AnnotationLabel {
    text?: string = undefined;
    fontStyle?: FontStyle;
    fontWeight?: FontWeight;
    fontSize: number;
    fontFamily: string;
    /**
     * The padding between the label and the line.
     */
    padding: number;
    /**
     * The color of the labels.
     * Use `undefined` rather than `rgba(0, 0, 0, 0)` to make labels invisible.
     */
    color?: string;
    position: 'start' | 'middle' | 'end';
}
export class AnnotationStyle {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    lineDash?: [];
    label?: AnnotationLabel;
}
interface AnnotationPathData {
    readonly points: {
        readonly x: number;
        readonly y: number;
    }[];
}
export class Annotation<XS extends Scale<any, number>, YS extends Scale<any, number>> {

    readonly id = "annotation"; // createId

    type?: "line" | "range";
    range?: [any, any];
    value?: any;
    style?: AnnotationStyle = new AnnotationStyle();
    label?: AnnotationLabel = new AnnotationLabel();

    xScale?: XS = undefined;
    yScale?: YS = undefined;
    direction?: ChartAxisDirection = undefined;

    readonly annotationGroup = new Group();
    private annotationLine: Path = new Path();
    private annotationRange: Path = new Path();
    private pathData?: AnnotationPathData = undefined;

    constructor() {
        const { annotationGroup, annotationLine, annotationRange } = this;

        annotationGroup.append([annotationRange, annotationLine]);

        annotationLine.fill = undefined;
        annotationLine.lineJoin = 'round';
        annotationLine.pointerEvents = PointerEvents.None;

        annotationRange.lineJoin = 'round';
        annotationRange.pointerEvents = PointerEvents.None;
    }

    update() {
        this.createNodeData();
        this.updatePaths();
    }

    private updatePaths() {
        this.updateLinePath();
        this.updateLineNode();

        if (this.type === 'range') {
            this.updateRangePath();
            this.updateRangeNode();
        }
    }

    private createNodeData() {
        const { xScale, yScale, direction, range, value } = this;

        if (!xScale || !yScale) { return; }

        const xBandWidth = xScale.bandwidth || 0;
        const yBandWidth = yScale.bandwidth || 0;

        let xStart, xEnd, yStart, yEnd;

        if (direction === ChartAxisDirection.X) {
            [xStart, xEnd] = range || [value, 0];
            [xStart, xEnd] = [xScale.convert(xStart) + xBandWidth, xScale.convert(xEnd) + xBandWidth];
            [yStart, yEnd] = yScale.range;
        } else {
            [xStart, xEnd] = xScale.range;
            [yStart, yEnd] = range || [value, 0];
            [yStart, yEnd] = [yScale.convert(yStart) + yBandWidth, yScale.convert(yEnd) + yBandWidth];
        }

        const pathData = this.pathData || (this.pathData = { points: []});
        pathData.points.push(
            {
                x: xStart,
                y: yStart
            },
            {
                x: xStart,
                y: yEnd
            },
            {
                x: xEnd,
                y: yEnd
            },
            {
                x: xEnd,
                y: yStart
            }
        );
    }

    private updateLinePath() {
        const { annotationLine, pathData = { points: [] } } = this;
        const pathMethods = ['moveTo', 'lineTo', 'moveTo', 'lineTo'];
        const points = pathData.points;
        const { path } = annotationLine;

        path.clear();
        pathMethods.forEach((method: 'moveTo' | 'lineTo', i) => {
            const { x, y } = points[i];
            path[method](x, y);
        })
        path.closePath();
    }

    private updateLineNode() {
        const { annotationLine } = this;
        annotationLine.stroke = 'black';
        annotationLine.strokeWidth = 2;
    }

    private updateRangeNode() {
        const { annotationRange } = this;
        annotationRange.fill = "pink";
        annotationRange.stroke = 'yellow';
        annotationRange.strokeWidth = 4;
    }

    private updateRangePath() {
        const { annotationRange, pathData = { points: [] } } = this;
        const points = pathData.points;
        const { path } = annotationRange;

        path.clear();
        points.forEach((point, i) => {
            const { x, y } = point;
            path[i > 0 ? 'lineTo' : 'moveTo'](x, y);
        });
        path.closePath();
    }
}